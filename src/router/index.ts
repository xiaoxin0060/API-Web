import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import NProgress from 'nprogress'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

// 简单的标题翻译函数
const getTitle = (key: string): string => {
  const titleMap: Record<string, string> = {
    'auth.login': '用户登录',
    'auth.register': '用户注册', 
    'nav.interfaces': '接口文档',
    'nav.posts': '社区帖子',
    'nav.admin': '管理后台',
    'nav.home': '首页',
    'interface.add': '新建接口',
    'interface.detail': '接口详情',
    'interface.edit': '编辑接口',
    'post.add': '发布帖子',
    'post.detail': '帖子详情',
    'post.edit': '编辑帖子',
    'user.profile': '个人中心',
    'admin.userManage': '用户管理',
    'error.forbidden': '访问禁止',
    'error.serverError': '服务器错误',
    'page.notFound': '页面未找到'
  }
  return titleMap[key] || key
}

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
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  const app = useAppStore()
  
  // 开始加载进度条
  NProgress.start()
  app.setLoading(true, '页面加载中...')
  
  // 公开页面 - 立即通过，无任何延迟
  const publicPages = ['/login', '/register', '/403', '/500']
  const isPublicPage = publicPages.includes(to.path) || to.name === 'not-found'
  
  if (isPublicPage) {
    return next()
  }
  
  // 检查帖子模块特性开关
  if (to.path.startsWith('/posts') && !auth.FEATURE_FLAGS.enablePosts) {
    NProgress.done()
    app.setLoading(false)
    return next('/403')
  }
  
  // 需要登录的页面 - 直接检查当前状态，不执行异步操作
  if (to.meta.requiresAuth) {
    // 如果没有用户信息，直接跳转登录页
    if (!auth.user || !auth.isLoggedIn) {
      NProgress.done()
      app.setLoading(false)
      
      const redirectPath = to.fullPath
      return next({
        path: '/login',
        query: { redirect: redirectPath }
      })
    }
    
    // 已登录用户权限检查
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
  }
  
  // 已登录用户访问登录/注册页，重定向到首页
  if (auth.isLoggedIn && (to.path === '/login' || to.path === '/register')) {
    NProgress.done()
    app.setLoading(false)
    const redirect = typeof to.query.redirect === 'string' ? to.query.redirect : ''
    return next(redirect || '/interfaces')
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
    const titleText = getTitle(to.meta.title as string)
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


