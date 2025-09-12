import { api } from './client'
import type { BaseResponse, Post, PostAddRequest, PostUpdateRequest, PageData, PaginationRequest } from '@/types/api'

export async function listPosts(
  params?: Partial<Post> & PaginationRequest
): Promise<BaseResponse<Post[]>> {
  return api.get<Post[]>('/post/list', { params })
}

export async function pagePosts(
  params?: Partial<Post> & PaginationRequest
): Promise<BaseResponse<PageData<Post>>> {
  return api.get<PageData<Post>>('/post/list/page', { params })
}

export async function getPost(id: number): Promise<BaseResponse<Post>> {
  return api.get<Post>('/post/get', { params: { id } })
}

export async function addPost(payload: PostAddRequest): Promise<BaseResponse<number>> {
  return api.post<number>('/post/add', payload)
}

export async function updatePost(payload: PostUpdateRequest): Promise<BaseResponse<boolean>> {
  return api.post<boolean>('/post/update', payload)
}

export async function deletePost(id: number): Promise<BaseResponse<boolean>> {
  return api.post<boolean>('/post/delete', { id })
}


