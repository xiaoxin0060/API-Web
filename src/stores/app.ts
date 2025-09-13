import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface AppConfig {
  title: string
  version: string
  apiBaseUrl: string
  enableMock: boolean
  locale: string
  pageSize: number
}

export const useAppStore = defineStore('app', () => {
  // 应用配置
  const config = ref<AppConfig>({
    title: import.meta.env.VITE_APP_TITLE || '小新API平台',
    version: '1.0.0',
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
    enableMock: import.meta.env.VITE_ENABLE_MOCK === 'true',
    locale: 'zh-CN',
    pageSize: 10,
  })
  
  // 加载状态
  const loading = ref(false)
  const loadingText = ref('')
  
  // 侧边栏状态
  const sidebarCollapsed = ref(false)
  
  // 网络状态
  const isOnline = ref(navigator.onLine)
  
  // 设备信息
  const deviceInfo = computed(() => {
    const width = window.innerWidth
    return {
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      width,
      height: window.innerHeight,
    }
  })
  
  // 操作方法
  const setLoading = (value: boolean, text?: string) => {
    loading.value = value
    loadingText.value = text || ''
  }
  
  const setLocale = (locale: string) => {
    config.value.locale = locale
  }
  
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
  
  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine
  }
  
  // 监听在线状态变化
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  
  return {
    // 状态
    config,
    loading,
    loadingText,
    sidebarCollapsed,
    isOnline,
    deviceInfo,
    
    // 操作
    setLoading,
    setLocale,
    toggleSidebar,
    updateOnlineStatus,
  }
}, {
  persist: {
    key: 'app-store',
    storage: localStorage,
    pick: ['config.locale', 'sidebarCollapsed'],
  }
})
