import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * 错误处理 Composable
 * 统一处理各种错误状态和用户提示
 */
export function useErrorHandler() {
  const router = useRouter()
  const authStore = useAuthStore()
  
  const error = ref<Error | null>(null)
  const isRetrying = ref(false)
  
  const clearError = () => {
    error.value = null
  }
  
  const handleError = async (err: any, options?: {
    showMessage?: boolean
    showRetry?: boolean
    retryAction?: () => void | Promise<void>
  }) => {
    error.value = err
    
    const status = err?.response?.status
    const message = err?.response?.data?.message || err.message || '未知错误'
    
    // 401 - 未授权
    if (status === 401) {
      authStore.logout()
      ElMessage.error('登录已过期，请重新登录')
      router.push({
        path: '/login',
        query: { redirect: router.currentRoute.value.fullPath }
      })
      return
    }
    
    // 403 - 禁止访问
    if (status === 403) {
      ElMessage.error('权限不足，无法执行此操作')
      return
    }
    
    // 404 - 资源不存在
    if (status === 404) {
      ElMessage.error('请求的资源不存在')
      return
    }
    
    // 显示错误消息
    if (options?.showMessage !== false) {
      if (options?.showRetry && options?.retryAction) {
        ElMessageBox.confirm(
          `操作失败：${message}`,
          '错误',
          {
            confirmButtonText: '重试',
            cancelButtonText: '取消',
            type: 'error',
          }
        ).then(() => {
          retry(options.retryAction!)
        }).catch(() => {
          // 用户取消重试
        })
      } else {
        ElMessage.error(message)
      }
    }
    
    // 发送错误到监控系统 (如 Sentry)
    if (import.meta.env.PROD) {
      console.error('Application Error:', err)
      // TODO: 集成 Sentry
    }
  }
  
  const retry = async (retryAction: () => void | Promise<void>) => {
    isRetrying.value = true
    try {
      await retryAction()
      clearError()
      ElMessage.success('操作成功')
    } catch (err) {
      handleError(err, { showMessage: true })
    } finally {
      isRetrying.value = false
    }
  }
  
  return {
    error: computed(() => error.value),
    isRetrying: computed(() => isRetrying.value),
    handleError,
    clearError,
    retry,
  }
}

/**
 * 网络状态 Composable
 */
export function useNetworkStatus() {
  const isOnline = ref(navigator.onLine)
  
  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine
  }
  
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  
  return {
    isOnline: computed(() => isOnline.value),
  }
}

/**
 * 加载状态管理 Composable
 */
export function useLoading() {
  const loadingStates = ref<Record<string, boolean>>({})
  
  const setLoading = (key: string, loading: boolean) => {
    loadingStates.value[key] = loading
  }
  
  const isLoading = (key: string) => {
    return computed(() => loadingStates.value[key] ?? false)
  }
  
  const isAnyLoading = computed(() => {
    return Object.values(loadingStates.value).some(loading => loading)
  })
  
  return {
    setLoading,
    isLoading,
    isAnyLoading,
  }
}
