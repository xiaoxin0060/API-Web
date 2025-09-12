import { api } from './client'
import type {
  UserInterfaceInfo,
  UserInterfaceInfoAddRequest,
  UserInterfaceInfoUpdateRequest,
  UserInterfaceInfoAddQuotaRequest,
  PageData,
  PaginationRequest,
  BaseResponse,
} from '@/types/api'

// 获取列表
export async function listUserInterfaceInfo(
  params?: Partial<UserInterfaceInfo> & PaginationRequest
): Promise<BaseResponse<UserInterfaceInfo[]>> {
  return api.get<UserInterfaceInfo[]>('/userInterfaceInfo/list', { params })
}

// 分页获取列表
export async function pageUserInterfaceInfo(
  params?: Partial<UserInterfaceInfo> & PaginationRequest
): Promise<BaseResponse<PageData<UserInterfaceInfo>>> {
  return api.get<PageData<UserInterfaceInfo>>('/userInterfaceInfo/list/page', { params })
}

// 根据ID获取
export async function getUserInterfaceInfo(
  id: number
): Promise<BaseResponse<UserInterfaceInfo>> {
  return api.get<UserInterfaceInfo>('/userInterfaceInfo/get', { params: { id } })
}

// 新增关系
export async function addUserInterfaceInfo(
  payload: UserInterfaceInfoAddRequest
): Promise<BaseResponse<number>> {
  return api.post<number>('/userInterfaceInfo/add', payload)
}

// 更新
export async function updateUserInterfaceInfo(
  payload: UserInterfaceInfoUpdateRequest
): Promise<BaseResponse<boolean>> {
  return api.post<boolean>('/userInterfaceInfo/update', payload)
}

// 删除
export async function deleteUserInterfaceInfo(
  id: number
): Promise<BaseResponse<boolean>> {
  return api.post<boolean>('/userInterfaceInfo/delete', { id })
}

// 增加额度
export async function addQuota(
  payload: UserInterfaceInfoAddQuotaRequest
): Promise<BaseResponse<boolean>> {
  return api.post<boolean>('/userInterfaceInfo/addQuota', payload)
}


