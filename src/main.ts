import './styles/theme.css'
import './assets/main.css'
import './styles/ultimate-animation-core.css'
import 'nprogress/nprogress.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { VueQueryPlugin } from '@tanstack/vue-query'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from '@/router'
import i18n from '@/i18n'
import { performanceDetector } from '@/utils/performanceDetector'

const app = createApp(App)

// 创建Pinia实例
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 配置 Vue Query
const vueQueryOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5分钟
        gcTime: 10 * 60 * 1000, // 10分钟
        retry: 2,
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
      },
    },
  },
}

// 注册插件（顺序很重要）
app.use(pinia)
app.use(VueQueryPlugin, vueQueryOptions)
app.use(router)
app.use(i18n)
app.use(ElementPlus)

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 全局错误处理
app.config.errorHandler = (err, _vm, info) => {
  console.error('Global error:', err, info)
  
  // 在生产环境中发送错误到监控系统
  if (import.meta.env.PROD) {
    // TODO: 集成 Sentry 或其他错误监控服务
  }
}

// 性能监控
if (import.meta.env.DEV) {
  app.config.performance = true
}

// 全局属性（向后兼容）
app.config.globalProperties.$ELEMENT = { size: 'default' }

// 挂载应用
app.mount('#app')

// 初始化性能检测器（在应用挂载后）
performanceDetector

// 主题模式交由应用配置控制（移除强制深色）
