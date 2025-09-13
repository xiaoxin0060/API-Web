<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Logo区域 -->
      <div class="header-left">
        <div class="brand logo" @click="$emit('brand-click')">
          <div class="brand-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <span class="brand-text">小新API平台</span>
        </div>
      </div>

      <!-- 导航区域 -->
      <nav class="header-nav">
        <slot name="nav"></slot>
      </nav>

      <!-- 用户操作区域 -->
      <div class="header-right">
        <slot name="actions"></slot>
      </div>
    </div>
  </header>
</template>

<script setup>
defineEmits(['brand-click'])
</script>

<style scoped>
.app-header {
  background: var(--color-bg-secondary);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--color-border);
  height: 70px;
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.2s ease;
  box-shadow: var(--color-shadow-sm);
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 1rem 0 0; /* 完全贴边，去掉左边距 */
  width: 100%; /* 完全撑满宽度 */
}

.header-left {
  display: flex;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0.5rem 1rem 0.5rem 0.5rem; /* logo贴到最左边 */
  border-radius: 0.75rem;
  margin-left: 0.5rem; /* 给左边留一点点边距，避免完全贴边 */
}

.brand:hover {
  transform: translateY(-1px);
  background: var(--color-bg-tertiary);
}

.brand-icon {
  width: 24px;
  height: 24px;
  color: var(--color-accent-blue);
  transition: all 0.2s ease;
}

.brand:hover .brand-icon {
  transform: scale(1.1);
}

.brand-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.header-nav {
  flex: 1;
  display: flex;
  justify-content: center;
  margin: 0 2rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-right: 0.5rem; /* 确保用户头像贴到最右边 */
}

@media (max-width: 768px) {
  .header-container {
    padding: 0; /* 移动端完全无边距 */
  }
  
  .header-nav {
    margin: 0 1rem;
  }
  
  .brand-text {
    display: none;
  }
  
  .brand {
    padding: 0.5rem;
    margin-left: 0.25rem; /* 移动端更小的左边距 */
  }
  
  .header-right {
    margin-right: 0.25rem; /* 移动端用户头像也贴右边 */
  }
}
</style>
