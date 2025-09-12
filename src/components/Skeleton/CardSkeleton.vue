<template>
  <div class="card-skeleton-container">
    <div 
      v-for="i in count" 
      :key="i" 
      class="card-skeleton"
    >
      <!-- 卡片头部 -->
      <div class="skeleton-header">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-header-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-subtitle"></div>
        </div>
        <div class="skeleton-action"></div>
      </div>
      
      <!-- 卡片内容 -->
      <div class="skeleton-content">
        <div class="skeleton-text"></div>
        <div class="skeleton-text skeleton-text-80"></div>
        <div class="skeleton-text skeleton-text-60"></div>
      </div>
      
      <!-- 卡片底部 -->
      <div class="skeleton-footer">
        <div class="skeleton-tags">
          <div class="skeleton-tag"></div>
          <div class="skeleton-tag skeleton-tag-small"></div>
        </div>
        <div class="skeleton-meta">
          <div class="skeleton-meta-item"></div>
          <div class="skeleton-meta-item"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  count?: number
  layout?: 'grid' | 'list'
}

withDefaults(defineProps<Props>(), {
  count: 6,
  layout: 'grid'
})
</script>

<style scoped lang="scss">
.card-skeleton-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  
  &.list {
    grid-template-columns: 1fr;
  }
}

.card-skeleton {
  background: var(--surface-color);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  }
}

.skeleton-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, var(--surface-muted) 25%, var(--border-color) 50%, var(--surface-muted) 75%);
  background-size: 200px 100%;
  animation: skeleton-loading 1.5s infinite;
  flex-shrink: 0;
}

.skeleton-header-content {
  flex: 1;
}

.skeleton-title {
  height: 20px;
  width: 70%;
  background: linear-gradient(90deg, var(--surface-muted) 25%, var(--border-color) 50%, var(--surface-muted) 75%);
  background-size: 200px 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-subtitle {
  height: 14px;
  width: 50%;
  background: linear-gradient(90deg, var(--surface-muted) 25%, var(--border-color) 50%, var(--surface-muted) 75%);
  background-size: 200px 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-action {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(90deg, var(--surface-muted) 25%, var(--border-color) 50%, var(--surface-muted) 75%);
  background-size: 200px 100%;
  animation: skeleton-loading 1.5s infinite;
  flex-shrink: 0;
}

.skeleton-content {
  margin-bottom: 20px;
}

.skeleton-text {
  height: 14px;
  background: linear-gradient(90deg, var(--surface-muted) 25%, var(--border-color) 50%, var(--surface-muted) 75%);
  background-size: 200px 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &.skeleton-text-80 {
    width: 80%;
  }
  
  &.skeleton-text-60 {
    width: 60%;
  }
}

.skeleton-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skeleton-tags {
  display: flex;
  gap: 8px;
}

.skeleton-tag {
  height: 20px;
  width: 60px;
  background: linear-gradient(90deg, var(--surface-muted) 25%, var(--border-color) 50%, var(--surface-muted) 75%);
  background-size: 200px 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 10px;
  
  &.skeleton-tag-small {
    width: 40px;
  }
}

.skeleton-meta {
  display: flex;
  gap: 16px;
}

.skeleton-meta-item {
  height: 12px;
  width: 40px;
  background: linear-gradient(90deg, var(--surface-muted) 25%, var(--border-color) 50%, var(--surface-muted) 75%);
  background-size: 200px 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

@keyframes skeleton-loading {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .card-skeleton-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .card-skeleton {
    padding: 20px;
  }
  
  .skeleton-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .skeleton-meta {
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .card-skeleton {
    padding: 16px;
  }
  
  .skeleton-header {
    gap: 8px;
  }
  
  .skeleton-avatar {
    width: 32px;
    height: 32px;
  }
}
</style>
