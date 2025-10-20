import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/api'
import { login as apiLogin, logout as apiLogout, getLoginUser } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // 特性开关配置
  const FEATURE_FLAGS = {
    enablePosts: false,           // 暂时下线帖子模块
    enableUserManagement: true,   // 用户管理功能
    enableInterfaceManagement: true // 接口管理功能
  }
  
  // 计算属性
  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => {
    const role = user.value?.userRole
    return typeof role === 'string' && role.trim().toLowerCase() === 'admin'
  })
  const userName = computed(() => user.value?.userName || user.value?.userAccount || '')
  
  // 权限计算
  const canManageUsers = computed(() => isAdmin.value && FEATURE_FLAGS.enableUserManagement)
  const canManageInterfaces = computed(() => isAdmin.value && FEATURE_FLAGS.enableInterfaceManagement)
  const canAccessPosts = computed(() => FEATURE_FLAGS.enablePosts)
  const canResetAkSk = computed(() => isAdmin.value) // 仅管理员可重置AK/SK
  
  // 清除错误
  const clearError = () => {
    error.value = null
  }
  
  // 恢复登录状态
  const hydrate = async (silent = false): Promise<void> => {
    if (!silent) {
      loading.value = true
    }
    error.value = null
    
    try {
      const resp = await getLoginUser()
      
      if (resp?.code === 0) {
        user.value = resp.data
      } else {
        user.value = null
        console.warn('Failed to get login user:', resp?.code, resp?.message)
      }
    } catch (e: any) {
      user.value = null
      // 不在hydrate时显示错误，静默失败
      console.warn('Failed to restore auth state:', e)
    } finally {
      if (!silent) {
        loading.value = false
      }
    }
  }
  
  // 用户登录
  const login = async (userAccount: string, userPassword: string): Promise<boolean> => {
    loading.value = true
    error.value = null
    
    try {
      const resp = await apiLogin(userAccount, userPassword)
      if (resp?.code === 0) {
        user.value = resp.data
        return true
      }
      
      error.value = resp?.message || '登录失败'
      return false
    } catch (e: any) {
      const message = e?.response?.data?.message || e.message || '登录失败'
      error.value = message
      return false
    } finally {
      loading.value = false
    }
  }
  
  // 用户登出
  const logout = async (): Promise<void> => {
    try {
      await apiLogout()
    } catch (e) {
      // 登出API失败不影响前端清理状态
      console.warn('Logout API failed:', e)
    } finally {
      user.value = null
      error.value = null
    }
  }
  
  // 更新用户信息
  const updateUser = (userData: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...userData }
    }
  }
  
  return {
    // 状态
    user,
    loading,
    error,
    
    // 计算属性
    isLoggedIn,
    isAdmin,
    userName,
    
    // 权限计算
    canManageUsers,
    canManageInterfaces,
    canAccessPosts,
    canResetAkSk,
    
    // 特性开关
    FEATURE_FLAGS,
    
    // 操作
    hydrate,
    login,
    logout,
    updateUser,
    clearError,
  }
}, {
  persist: {
    key: 'auth-store',
    storage: sessionStorage, // 使用sessionStorage提高安全性
    // 仅持久化基本用户信息，敏感信息依赖服务端Session
    pick: ['user.id', 'user.userName', 'user.userAccount', 'user.userRole'],
  }
})


