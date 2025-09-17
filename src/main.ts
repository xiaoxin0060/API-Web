// main.ts
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

// ✅ 正确引入中文语言包
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const app = createApp(App)

// 创建Pinia实例
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 配置 Vue Query
const vueQueryOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
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
app.use(ElementPlus, {
  locale: zhCn, // ✅ 必须设置 locale，否则会报 $l 错误
})

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 全局错误处理
app.config.errorHandler = (err, _vm, info) => {
  console.error('Global error:', err, info)
}

// 性能监控
if (import.meta.env.DEV) {
  app.config.performance = true
}

// 全局属性（向后兼容）
app.config.globalProperties.$ELEMENT = { size: 'default' }

// 挂载应用
app.mount('#app')

// 初始化性能检测器
performanceDetector