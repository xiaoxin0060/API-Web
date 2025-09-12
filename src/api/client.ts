import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { BaseResponse } from '@/types/api'

// 生成唯一请求ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 创建API客户端实例
const apiClient: AxiosInstance = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 添加请求ID用于追踪
    config.headers = {
      ...config.headers,
      'X-Request-Id': generateRequestId(),
    }
    
    // 添加CSRF Token (如果需要)
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
    if (csrfToken) {
      config.headers['X-CSRF-TOKEN'] = csrfToken
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    const status = error?.response?.status
    const config = error.config
    
    // 401 未授权 - 交由路由守卫处理重定向
    if (status === 401) {
      // 触发全局事件，由路由守卫处理
      window.dispatchEvent(new CustomEvent('auth:unauthorized', {
        detail: { originalUrl: window.location.href }
      }))
    }
    
    // 网络错误重试逻辑 (仅对GET和幂等请求)
    const isRetryableRequest = config.method === 'get' || config._retry < 2
    if (!error.response && isRetryableRequest && !config._retry) {
      config._retry = (config._retry || 0) + 1
      
      // 指数退避重试
      const delay = Math.pow(2, config._retry) * 1000
      return new Promise(resolve => {
        setTimeout(() => resolve(apiClient(config)), delay)
      })
    }
    
    return Promise.reject(error)
  }
)

// 请求取消管理
const cancelTokens = new Map<string, () => void>()

export function cancelRequest(requestId: string) {
  const cancel = cancelTokens.get(requestId)
  if (cancel) {
    cancel()
    cancelTokens.delete(requestId)
  }
}

export function cancelAllRequests() {
  cancelTokens.forEach(cancel => cancel())
  cancelTokens.clear()
}

// 返回包含响应元数据的原始请求（用于调试台）
export async function apiRawRequest<T = any>(
  config: AxiosRequestConfig & { requestId?: string }
): Promise<{ data: T; status: number; headers: any; durationMs: number }> {
  const requestId = config.requestId || generateRequestId()
  const source = axios.CancelToken.source()
  cancelTokens.set(requestId, source.cancel)
  const startedAt = Date.now()
  try {
    const response = await apiClient({
      ...config,
      cancelToken: source.token,
    })
    const durationMs = Date.now() - startedAt
    cancelTokens.delete(requestId)
    return { data: response.data as T, status: response.status, headers: response.headers, durationMs }
  } catch (error) {
    cancelTokens.delete(requestId)
    throw error
  }
}

// 类型安全的API请求方法
export async function apiRequest<T = any>(
  config: AxiosRequestConfig & { requestId?: string }
): Promise<BaseResponse<T>> {
  const requestId = config.requestId || generateRequestId()
  
  // 创建取消令牌
  const source = axios.CancelToken.source()
  cancelTokens.set(requestId, source.cancel)
  
  try {
    const response = await apiClient({
      ...config,
      cancelToken: source.token,
    })
    
    cancelTokens.delete(requestId)
    return response.data
  } catch (error) {
    cancelTokens.delete(requestId)
    throw error
  }
}

// 便捷方法（支持 requestId 透传）
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig & { requestId?: string }) =>
    apiRequest<T>({ ...config, method: 'get', url }),
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig & { requestId?: string }) =>
    apiRequest<T>({ ...config, method: 'post', url, data }),
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig & { requestId?: string }) =>
    apiRequest<T>({ ...config, method: 'put', url, data }),
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig & { requestId?: string }) =>
    apiRequest<T>({ ...config, method: 'delete', url }),
}

export default apiClient


