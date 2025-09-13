import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import NProgress from 'nprogress'
import i18n from '@/i18n'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

// 路由元信息类型定义
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresAdmin?: boolean
    title?: string
    icon?: string
    hidden?: boolean
    roles?: string[]
    keepAlive?: boolean
    noCache?: boolean
    breadcrumb?: boolean
  }
}

// 路由配置
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/interfaces',
    meta: { hidden: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: 'auth.login',
      hidden: true
    }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/Register.vue'),
    meta: {
      title: 'auth.register',
      hidden: true
    }
  },
  {
    path: '/welcome',
    name: 'welcome-splash',
    component: () => import('@/views/WelcomeSplash.vue'),
    meta: {
      title: '欢迎动画演示',
      hidden: true
    }
  },
  {
    path: '/interfaces',
    name: 'interfaces',
    component: () => import('@/views/InterfaceList.vue'),
    meta: {
      requiresAuth: true,
      title: 'nav.interfaces',
      icon: 'Document',
      keepAlive: true
    }
  },
  {
    path: '/interfaces/new',
    name: 'interface-new',
    component: () => import('@/views/InterfaceForm.vue'),
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: 'interface.add',
      breadcrumb: true
    }
  },
  {
    path: '/interfaces/:id',
    name: 'interface-detail',
    component: () => import('@/views/InterfaceDetail.vue'),
    meta: {
      requiresAuth: true,
      title: 'interface.detail',
      breadcrumb: true
    }
  },
  {
    path: '/interfaces/:id/edit',
    name: 'interface-edit',
    component: () => import('@/views/InterfaceForm.vue'),
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: 'interface.edit',
      breadcrumb: true
    }
  },
  {
    path: '/posts',
    name: 'posts',
    component: () => import('@/views/PostList.vue'),
    meta: {
      requiresAuth: true,
      title: 'nav.posts',
      icon: 'ChatLineSquare',
      keepAlive: true
    }
  },
  {
    path: '/posts/new',
    name: 'post-new',
    component: () => import('@/views/PostForm.vue'),
    meta: {
      requiresAuth: true,
      title: 'post.add',
      breadcrumb: true
    }
  },
  {
    path: '/posts/:id',
    name: 'post-detail',
    component: () => import('@/views/PostDetail.vue'),
    meta: {
      requiresAuth: true,
      title: 'post.detail',
      breadcrumb: true
    }
  },
  {
    path: '/posts/:id/edit',
    name: 'post-edit',
    component: () => import('@/views/PostForm.vue'),
    meta: {
      requiresAuth: true,
      title: 'post.edit',
      breadcrumb: true
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/Profile.vue'),
    meta: {
      requiresAuth: true,
      title: 'user.profile',
      icon: 'User'
    }
  },
  {
    path: '/admin',
    name: 'admin',
    redirect: '/admin/users',
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: 'nav.admin',
      icon: 'Setting'
    },
    children: [
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('@/views/AdminUsers.vue'),
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          title: 'admin.userManage'
        }
      }
    ]
  },
  {
    path: '/403',
    name: 'forbidden',
    component: () => import('@/views/Error403.vue'),
    meta: {
      title: 'error.forbidden',
      hidden: true
    }
  },
  {
    path: '/500',
    name: 'server-error',
    component: () => import('@/views/Error500.vue'),
    meta: {
      title: 'error.serverError',
      hidden: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: 'page.notFound',
      hidden: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    // 验收标准：页面切换时的滚动行为
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

// 全局前置守卫
router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore()
  const app = useAppStore()
  
  // 开始加载进度条（响应时间 ≤ 100ms 要求）
  NProgress.start()
  app.setLoading(true, '页面加载中...')
  
  // 首次加载时恢复登录状态
  if (!auth.user && !auth.loading) {
    try {
      await auth.hydrate()
    } catch (error) {
      console.warn('Failed to restore auth state:', error)
    }
  }
  
  // 已登录用户访问登录/注册，按 redirect 回跳或首页
  if (auth.isLoggedIn && (to.path === '/login' || to.path === '/register')) {
    NProgress.done()
    app.setLoading(false)
    const redirect = typeof to.query.redirect === 'string' ? to.query.redirect : ''
    return next(redirect || '/interfaces')
  }
  
  // 公开页面检查
  const publicPages = ['/login', '/register', '/welcome', '/403', '/500']
  const isPublicPage = publicPages.includes(to.path) || to.name === 'not-found'
  
  if (isPublicPage) {
    return next()
  }
  
  // 需要登录的页面
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    NProgress.done()
    app.setLoading(false)
    
    // 验收标准：401统一跳转登录并在成功后回跳原路径
    const redirectPath = to.fullPath
    return next({
      path: '/login',
      query: { redirect: redirectPath }
    })
  }
  
  // 需要管理员权限的页面
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    NProgress.done()
    app.setLoading(false)
    return next('/403')
  }
  
  // 角色权限检查
  if (to.meta.roles && to.meta.roles.length > 0) {
    const hasPermission = to.meta.roles.some(role => {
      const currentRole = auth.user?.userRole
      return typeof currentRole === 'string' && currentRole.trim() === role
    })
    
    if (!hasPermission) {
      NProgress.done()
      app.setLoading(false)
      return next('/403')
    }
  }
  
  return next()
})

// 全局后置守卫
router.afterEach((to, _from, failure) => {
  const app = useAppStore()
  
  // 结束加载进度条
  NProgress.done()
  app.setLoading(false)
  
  // 设置页面标题
  if (to.meta?.title) {
    const t = i18n.global?.t ? i18n.global.t : (k: string) => k
    const titleText = t(to.meta.title as string)
    document.title = `${titleText} - ${app.config.title}`
  } else {
    document.title = app.config.title
  }
  
  // 验收标准：路由切换无明显布局抖动
  // 确保页面内容稳定渲染
  if (!failure) {
    // 埋点统计页面访问（可选）
    if (import.meta.env.PROD) {
      // TODO: 发送页面访问统计
    }
  }
})

// 监听401未授权事件（来自API拦截器）
window.addEventListener('auth:unauthorized', (_event: Event) => {
  const auth = useAuthStore()
  const currentRoute = router.currentRoute.value
  
  // 清理认证状态
  auth.logout()
  
  // 保存当前路径并跳转到登录页
  if (currentRoute.path !== '/login') {
    router.push({
      path: '/login',
      query: { 
        redirect: currentRoute.fullPath,
        message: 'session_expired' 
      }
    })
  }
})

export default router


