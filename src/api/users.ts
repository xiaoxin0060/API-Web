import { api } from './client'
import type { BaseResponse, User, UserVO, PageData, PaginationRequest, UserUpdateRequest } from '@/types/api'

export async function listUsers(
  params?: Partial<UserVO> & PaginationRequest
): Promise<BaseResponse<UserVO[]>> {
  return api.get<UserVO[]>('/user/list', { params })
}

export async function pageUsers(
  params?: Partial<UserVO> & PaginationRequest
): Promise<BaseResponse<PageData<UserVO>>> {
  return api.get<PageData<UserVO>>('/user/list/page', { params })
}

export async function getUser(id: number): Promise<BaseResponse<UserVO>> {
  return api.get<UserVO>('/user/get', { params: { id } })
}

export async function addUser(payload: Omit<User, 'id'|'createTime'|'updateTime'|'isDelete'>): Promise<BaseResponse<number>> {
  return api.post<number>('/user/add', payload)
}

export async function updateUser(payload: UserUpdateRequest): Promise<BaseResponse<boolean>> {
  return api.post<boolean>('/user/update', payload)
}

export async function deleteUser(id: number): Promise<BaseResponse<boolean>> {
  return api.post<boolean>('/user/delete', { id })
}


