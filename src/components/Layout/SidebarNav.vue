<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 定义菜单项类型
interface MenuItem {
  index: string
  title: string
  icon: string
}

const route = useRoute()
const auth = useAuthStore()

const isAdmin = computed(() => auth.user?.userRole === 'admin')

const menuItems = computed(() => {
  const items: MenuItem[] = []
  
  // 接口文档
  items.push({
    index: '/interfaces',
    title: '接口文档', 
    icon: 'M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z'
  })
  
  // 仅在特性开关启用时显示帖子模块
  if (auth.canAccessPosts) {
    items.push({
      index: '/posts',
      title: '社区帖子',
      icon: 'M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2ZM13,17H11V15H13V17ZM13,13H11V7H13V13Z'
    })
  }
  
  // 个人中心
  items.push({
    index: '/profile',
    title: '个人中心',
    icon: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2ZM7.07,18.28C7.5,17.38 10.12,16.5 12,16.5C13.88,16.5 16.5,17.38 16.93,18.28C15.57,19.36 13.86,20 12,20C10.14,20 8.43,19.36 7.07,18.28ZM18.36,16.83C16.93,15.09 13.46,14.5 12,14.5C10.54,14.5 7.07,15.09 5.64,16.83C4.62,15.5 4,13.82 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,13.82 19.38,15.5 18.36,16.83ZM12,6C10.06,6 8.5,7.56 8.5,9.5C8.5,11.44 10.06,13 12,13C13.94,13 15.5,11.44 15.5,9.5C15.5,7.56 13.94,6 12,6Z'
  })
  
  return items
})

const adminItems = computed(() => {
  const items: MenuItem[] = []
  
  // 用户管理菜单 - 仅管理员可见
  if (auth.canManageUsers) {
    items.push({
      index: '/admin/users',
      title: '用户管理',
      icon: 'M16,4C18.21,4 20,5.79 20,8C20,10.21 18.21,12 16,12C13.79,12 12,10.21 12,8C12,5.79 13.79,4 16,4ZM16,14C20.42,14 24,15.79 24,18V20H8V18C8,15.79 11.58,14 16,14Z'
    })
  }
  
  return items
})
</script>

<template>
  <div class="sidebar-nav">
    <nav class="nav-menu">
      <!-- 主要菜单项 -->
      <router-link 
        v-for="item in menuItems"
        :key="item.index"
        :to="item.index"
        class="menu-item"
        :class="{ 'menu-item--active': route.path === item.index }"
      >
        <div class="menu-item__icon">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" :d="item.icon" />
          </svg>
        </div>
        <span class="menu-item__text">{{ item.title }}</span>
      </router-link>

      <!-- 管理员菜单分组 -->
      <div v-if="adminItems.length > 0" class="menu-group">
        <div class="menu-group__title">
          <div class="menu-group__icon">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5ZM19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.65 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
            </svg>
          </div>
          <span>管理后台</span>
        </div>
        <router-link 
          v-for="item in adminItems"
          :key="item.index"
          :to="item.index"
          class="menu-item menu-item--sub"
          :class="{ 'menu-item--active': route.path === item.index }"
        >
          <div class="menu-item__icon">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" :d="item.icon" />
            </svg>
          </div>
          <span class="menu-item__text">{{ item.title }}</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.sidebar-nav {
  height: 100%;
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
}

.nav-menu {
  padding: 1rem 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
  position: relative;
}

.menu-item:hover {
  background: var(--color-row-hover);
  color: var(--color-accent-blue);
  border-left-color: var(--color-accent-blue);
}

.menu-item--active {
  background: var(--color-row-selected);
  color: var(--color-accent-blue);
  border-left-color: var(--color-accent-blue);
  font-weight: 600;
}

.menu-item--sub {
  padding-left: 2.5rem;
  font-size: 0.9rem;
}

.menu-item__icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
}

.menu-item--sub .menu-item__icon {
  width: 18px;
  height: 18px;
}

.menu-item__text {
  color: inherit;
  font-weight: inherit;
}

.menu-group {
  margin-top: 1.5rem;
  border-top: 1px solid var(--color-border);
  padding-top: 1rem;
}

.menu-group__title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1.5rem;
  color: var(--color-text-tertiary);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.menu-group__icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
}

/* 滚动条样式 */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: var(--color-border-strong);
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: var(--color-accent-blue);
}
</style>


