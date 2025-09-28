import { api } from './client'
import type { 
  User, 
  BaseResponse 
} from '@/types/api'

/**
 * 用户登录
 */
export async function login(
  userAccount: string, 
  userPassword: string
): Promise<BaseResponse<User>> {
  return api.post<User>('/user/login', { userAccount, userPassword })
}

/**
 * 用户注册
 */
export async function register(
  userAccount: string, 
  userPassword: string, 
  checkPassword: string
): Promise<BaseResponse<number>> {
  return api.post<number>('/user/register', { 
    userAccount, 
    userPassword, 
    checkPassword 
  })
}

/**
 * 用户登出
 */
export async function logout(): Promise<BaseResponse<boolean>> {
  return api.post<boolean>('/user/logout')
}

/**
 * 获取当前登录用户信息
 */
export async function getLoginUser(): Promise<BaseResponse<User>> {
  return api.get<User>('/user/get/login')
}

/**
 * 管理员重置用户 AK-SK
 */
export async function resetAkSk(
  userId: number
): Promise<BaseResponse<Record<string, string>>> {
  return api.post<Record<string, string>>('/user/resetAkSk', null, { 
    params: { userId } 
  })
}

/**
 * 获取用户 AK-SK（脱敏）
 */
export async function getMaskedAkSk(
  userId?: number
): Promise<BaseResponse<Record<string, string>>> {
  return api.get<Record<string, string>>('/user/aksk/masked', { 
    params: userId ? { userId } : undefined 
  })
}

/**
 * 更新用户个人信息
 */
export async function updateProfile(
  data: {
    id?: number
    userName?: string
    userAvatar?: string
    gender?: number
  }
): Promise<BaseResponse<boolean>> {
  return api.post<boolean>('/user/update', data)
}


