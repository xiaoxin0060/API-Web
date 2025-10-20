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
app.use(ElementPlus, {
  locale: zhCn, // 
})

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 全局错误处理
app.config.errorHandler = (err, _vm, info) => {
  console.error('Global error:', err, info)
}

// 全局属性（向后兼容）
app.config.globalProperties.$ELEMENT = { size: 'default' }

// 挂载应用
app.mount('#app')

// 应用启动后静默尝试恢复登录状态
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
// 静默尝试恢复登录状态，不显示加载状态，不阻塞应用启动
auth.hydrate(true).catch(() => {
  // 静默处理失败，不影响应用正常使用
})