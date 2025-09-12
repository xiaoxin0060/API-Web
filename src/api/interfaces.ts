import { api, apiRawRequest } from './client'
import type {
  InterfaceInfo,
  InterfaceInfoAddRequest,
  InterfaceInfoUpdateRequest,
  InterfaceInfoInvokeRequest,
  PageData,
  PaginationRequest,
  BaseResponse
} from '@/types/api'

/**
 * 获取接口列表
 */
export async function listInterfaces(
  params?: Partial<InterfaceInfo> & PaginationRequest
): Promise<BaseResponse<InterfaceInfo[]>> {
  return api.get<InterfaceInfo[]>('/interfaceInfo/list', { params })
}

/**
 * 分页获取接口列表
 */
export async function pageInterfaces(
  params?: Partial<InterfaceInfo> & PaginationRequest
): Promise<BaseResponse<PageData<InterfaceInfo>>> {
  return api.get<PageData<InterfaceInfo>>('/interfaceInfo/list/page', { params })
}

/**
 * 根据ID获取接口详情
 */
export async function getInterface(id: number): Promise<BaseResponse<InterfaceInfo>> {
  return api.get<InterfaceInfo>('/interfaceInfo/get', { params: { id } })
}

/**
 * 根据ID获取接口详情（含解密认证配置）
 */
export async function getInterfaceDecrypted(id: number): Promise<BaseResponse<InterfaceInfo>> {
  return api.get<InterfaceInfo>('/interfaceInfo/get/decrypted', { params: { id } })
}

/**
 * 新增接口
 */
export async function addInterface(
  payload: InterfaceInfoAddRequest
): Promise<BaseResponse<number>> {
  return api.post<number>('/interfaceInfo/add', payload)
}

/**
 * 更新接口
 */
export async function updateInterface(
  payload: InterfaceInfoUpdateRequest
): Promise<BaseResponse<boolean>> {
  return api.post<boolean>('/interfaceInfo/update', payload)
}

/**
 * 删除接口
 */
export async function deleteInterface(id: number): Promise<BaseResponse<boolean>> {
  return api.post<boolean>('/interfaceInfo/delete', { id })
}

/**
 * 接口上线
 */
export async function onlineInterface(id: number): Promise<BaseResponse<boolean>> {
  return api.post<boolean>('/interfaceInfo/online', { id })
}

/**
 * 接口下线
 */
export async function offlineInterface(id: number): Promise<BaseResponse<boolean>> {
  return api.post<boolean>('/interfaceInfo/offline', { id })
}

/**
 * 调用接口
 */
export async function invokeInterface(
  id: number,
  userRequestParams: Record<string, any>,
  options?: { requestId?: string }
): Promise<BaseResponse<any>> {
  return api.post<any>('/interfaceInfo/invoke', { id, userRequestParams }, options)
}

export async function invokeInterfaceRaw(
  id: number,
  userRequestParams: Record<string, any>,
  options?: { requestId?: string }
): Promise<{ data: any; status: number; headers: any; durationMs: number }> {
  return apiRawRequest<any>({ method: 'post', url: '/interfaceInfo/invoke', data: { id, userRequestParams }, ...options })
}


