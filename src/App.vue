<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import WelcomeAnimation from '@/components/Welcome/WelcomeAnimation.vue'
import Header from '@/components/Header.vue'
import SidebarNav from '@/components/Layout/SidebarNav.vue'
import Button from '@/components/Button.vue'
import PageBreadcrumb from '@/components/Breadcrumb/PageBreadcrumb.vue'
import AnimationDemo from '@/components/AnimationDemo.vue'

// 开发模式检测
const isDev = import.meta.env.DEV

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const isAuthPage = computed(() => ['/login', '/register'].includes(route.path))
const isAdmin = computed(() => auth.isAdmin)

// 控制欢迎动画显示 - 初始化时检查是否需要显示
const showWelcome = ref(false)

// 初始化欢迎动画状态
const initWelcomeState = () => {
  const hasVisited = localStorage.getItem('appColdStart')
  if (!hasVisited) {
    showWelcome.value = true
  }
}

// 处理欢迎动画完成
function handleWelcomeComplete() {
  showWelcome.value = false
}

// 处理互动完成
function handleInteractiveComplete() {
  console.log('用户完成互动体验')
}

// 通知徽章状态 (演示badge-updated动画)
const notificationCount = ref(3)
const badgeAnimating = ref(false)

function goto(path) {
  router.push(path)
}

function handleBrandClick() {
  goto('/interfaces')
}

async function onLogout() {
  await auth.logout()
  router.push('/login')
}

function handleCommand(command) {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'logout') {
    onLogout()
  }
}

function handleNotificationClick() {
  // 演示徽章计数动画
  badgeAnimating.value = true
  notificationCount.value = Math.floor(Math.random() * 9) + 1
  setTimeout(() => {
    badgeAnimating.value = false
  }, 600)
}

const navItems = [
  { path: '/interfaces', title: '接口文档', icon: 'Document' },
  { path: '/posts', title: '社区帖子', icon: 'ChatLineSquare' }
]

if (isAdmin.value) {
  navItems.push({ path: '/admin/users', title: '用户管理', icon: 'User' })
}

// 组件挂载时初始化欢迎动画状态
onMounted(() => {
  initWelcomeState()
})
</script>

<template>
  <!-- 开场动画 -->
  <WelcomeAnimation 
    v-if="showWelcome"
    :show-first-visit="true"
    storage-key="appColdStart"
    @complete="handleWelcomeComplete"
    @interactive-complete="handleInteractiveComplete"
  />
  
  <div class="app-container">
    <!-- 主应用布局 -->
    <div v-if="!isAuthPage" class="app-layout">
      <!-- 顶部导航 -->
      <Header @brand-click="handleBrandClick" class="layout-header">
        <template #nav>
          <nav class="main-nav">
            <router-link 
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="nav-link nav-item performant-animation"
              :class="{ 'nav-link--active': route.path === item.path }"
            >
              {{ item.title }}
            </router-link>
          </nav>
        </template>
        <template #actions>
          <div v-if="auth.user" class="user-section">
            <!-- 通知徽章 (演示badge-updated动画) -->
            <div class="notification-badge" @click="handleNotificationClick">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7A7,7 0 0,1 20,14V16A1,1 0 0,1 19,17H5A1,1 0 0,1 4,16V14A7,7 0 0,1 11,7V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2Z"/>
              </svg>
              <span v-if="notificationCount > 0" class="badge badge-updated" :class="{ 'badge-updated': badgeAnimating }">
                {{ notificationCount }}
              </span>
            </div>
            
            <div class="user-dropdown" @click="handleCommand('profile')">
              <div class="user-avatar">
                {{ auth.user.userName?.[0] || auth.user.userAccount?.[0] || 'U' }}
              </div>
              <div class="user-info">
                <span class="user-name">{{ auth.user.userName || auth.user.userAccount }}</span>
                <span class="user-role">{{ auth.user.userRole === 'admin' ? '管理员' : '用户' }}</span>
              </div>
              <div class="user-menu">
                <Button type="secondary" size="small" @click.stop="handleCommand('profile')">
                  个人中心
                </Button>
                <Button type="destructive" size="small" @click.stop="onLogout">
                  退出登录
                </Button>
              </div>
            </div>
          </div>
          <div v-else>
            <Button type="primary" @click="goto('/login')">登录</Button>
          </div>
        </template>
      </Header>

      <!-- 主体布局 -->
      <div class="app-body">
        <!-- 侧边栏 -->
        <aside class="app-sidebar layout-sidebar">
          <SidebarNav />
        </aside>

        <!-- 主内容区 -->
        <main class="app-main layout-main">
          <div class="main-content">
            <PageBreadcrumb />
            <div class="content-wrapper">
              <router-view v-slot="{ Component, route: routeData }">
                <transition name="page" mode="out-in">
                  <keep-alive v-if="routeData.meta?.keepAlive">
                    <component :is="Component" :key="routeData.fullPath" />
                  </keep-alive>
                  <component v-else :is="Component" :key="routeData.fullPath" />
                </transition>
              </router-view>
            </div>
          </div>
          
          <!-- 底部版权 -->
          <footer class="app-footer">
            <div class="footer-content">
              <div class="footer-left">
                <span class="copyright">© 2024 小新API平台. 保留所有权利.</span>
              </div>
              <div class="footer-right">
                <a href="#" class="footer-link">关于我们</a>
                <a href="#" class="footer-link">使用条款</a>
                <a href="#" class="footer-link">隐私政策</a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
    
    <!-- 登录注册页面 -->
    <div v-else class="auth-container">
      <router-view />
    </div>
    
    <!-- 动画演示控制面板 (在开发模式下显示) -->
    <AnimationDemo v-if="isDev" />
  </div>
</template>

<style scoped>
.app-container {
  height: 100vh;
  background: var(--color-bg-primary);
  position: relative;
  overflow: hidden;
}

.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.app-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  background: var(--color-bg-primary);
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

/* 导航样式 */
.main-nav {
  display: flex;
  gap: 2rem;
}

.nav-link {
  padding: 0.75rem 1rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  font-weight: 500;
  position: relative;
}

.nav-link:hover {
  color: var(--color-accent-blue);
  background: rgba(96, 165, 250, 0.1);
}

.nav-link--active {
  color: var(--color-accent-blue);
  background: rgba(96, 165, 250, 0.15);
  font-weight: 600;
}

/* 用户区域 */
.user-section {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* 通知徽章 */
.notification-badge {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.notification-badge:hover {
  background: var(--color-row-hover);
  color: var(--color-text-primary);
}

.badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  background: var(--color-error);
  color: white;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  border: 2px solid var(--color-bg-secondary);
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.user-dropdown:hover {
  background: var(--color-row-hover);
  border-color: var(--color-border-strong);
}

.user-dropdown:hover .user-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-accent-blue), var(--color-accent-purple));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.user-role {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}

.user-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 0.5rem;
  box-shadow: var(--color-shadow-lg);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 120px;
}

/* 底部版权 */
.app-footer {
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  padding: 1.5rem 2rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copyright {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.footer-right {
  display: flex;
  gap: 1.5rem;
}

.footer-link {
  color: var(--color-text-tertiary);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: var(--color-accent-blue);
}

/* 登录页面 */
.auth-container {
  min-height: 100vh;
  background: var(--color-bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

/* 页面过渡动画 */
.page-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .app-sidebar {
    position: fixed;
    left: -220px;
    top: 70px;
    height: calc(100vh - 70px);
    z-index: 1000;
    transition: left 0.3s ease;
  }
  
  .main-nav {
    gap: 1rem;
  }
  
  .nav-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .user-dropdown {
    padding: 0.5rem;
  }
  
  .user-info {
    display: none;
  }
}
</style>
