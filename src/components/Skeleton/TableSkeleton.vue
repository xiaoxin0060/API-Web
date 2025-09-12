<template>
  <div class="table-skeleton">
    <!-- 表格头部骨架 -->
    <div class="skeleton-header">
      <div class="skeleton-title skeleton"></div>
      <div class="skeleton-actions">
        <div class="skeleton-button skeleton"></div>
        <div class="skeleton-button skeleton"></div>
      </div>
    </div>
    
    <!-- 搜索栏骨架 -->
    <div class="skeleton-search">
      <div class="skeleton-input skeleton"></div>
      <div class="skeleton-input skeleton"></div>
      <div class="skeleton-button skeleton"></div>
    </div>
    
    <!-- 表格骨架 -->
    <div class="skeleton-table">
      <!-- 表头 -->
      <div class="skeleton-table-header">
        <div 
          v-for="i in columns" 
          :key="i" 
          class="skeleton-th"
        ></div>
      </div>
      
      <!-- 表格行 -->
      <div 
        v-for="row in rows" 
        :key="row" 
        class="skeleton-table-row"
      >
        <div 
          v-for="col in columns" 
          :key="col" 
          class="skeleton-td"
        >
          <div class="skeleton-text skeleton" :class="`skeleton-text-${col % 3 === 0 ? 'short' : col % 2 === 0 ? 'medium' : 'long'}`"></div>
        </div>
      </div>
    </div>
    
    <!-- 分页骨架 -->
    <div class="skeleton-pagination">
      <div class="skeleton-text skeleton-text-short skeleton"></div>
      <div class="skeleton-buttons">
        <div v-for="i in 5" :key="i" class="skeleton-page skeleton"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  rows?: number
  columns?: number
}

withDefaults(defineProps<Props>(), {
  rows: 8,
  columns: 6
})
</script>

<style scoped lang="scss">
.table-skeleton {
  padding: 24px;
  background: var(--surface-color);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.skeleton-title {
  height: 32px;
  width: 200px;
  background: linear-gradient(90deg, var(--surface-muted) 25%, var(--border-color) 50%, var(--surface-muted) 75%);
  background-size: 200px 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 6px;
}

.skeleton-actions {
  display: flex;
  gap: 12px;
}

.skeleton-button {
  height: 32px;
  width: 80px;
  background: linear-gradient(90deg, var(--surface-muted) 25%, var(--border-color) 50%, var(--surface-muted) 75%);
  background-size: 200px 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 6px;
}

.skeleton-search {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(249, 250, 251, 0.6);
  border-radius: 8px;
}

.skeleton-input {
  height: 32px;
  flex: 1;
  background: linear-gradient(90deg, var(--surface-muted) 25%, var(--border-color) 50%, var(--surface-muted) 75%);
  background-size: 200px 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 6px;
  
  &:last-of-type {
    flex: 0 0 120px;
  }
}

.skeleton-table {
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 24px;
}

.skeleton-table-header {
  display: flex;
  background: rgba(249, 250, 251, 0.8);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.skeleton-th {
  flex: 1;
  height: 48px;
  padding: 12px 16px;
  
  &::before {
    content: '';
    display: block;
    height: 16px;
    width: 80%;
    background: linear-gradient(90deg, var(--surface-muted) 25%, var(--border-color) 50%, var(--surface-muted) 75%);
    background-size: 200px 100%;
    animation: skeleton-loading 1.5s infinite;
    border-radius: 4px;
  }
}

.skeleton-table-row {
  display: flex;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  
  &:hover {
    background: rgba(99, 102, 241, 0.02);
  }
  
  &:last-child {
    border-bottom: none;
  }
}

.skeleton-td {
  flex: 1;
  height: 56px;
  padding: 16px;
  display: flex;
  align-items: center;
}

.skeleton-text {
  height: 14px;
  background: linear-gradient(90deg, var(--surface-muted) 25%, var(--border-color) 50%, var(--surface-muted) 75%);
  background-size: 200px 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  
  &.skeleton-text-short {
    width: 40%;
  }
  
  &.skeleton-text-medium {
    width: 60%;
  }
  
  &.skeleton-text-long {
    width: 80%;
  }
}

.skeleton-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--surface-muted);
  border-radius: 8px;
}

.skeleton-buttons {
  display: flex;
  gap: 8px;
}

.skeleton-page {
  width: 32px;
  height: 32px;
  background: linear-gradient(90deg, var(--surface-muted) 25%, var(--border-color) 50%, var(--surface-muted) 75%);
  background-size: 200px 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 6px;
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
  .skeleton-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .skeleton-search {
    flex-direction: column;
    
    .skeleton-input {
      flex: none;
      width: 100%;
    }
  }
  
  .skeleton-table-header,
  .skeleton-table-row {
    display: none; // 在移动端隐藏表格，显示卡片式骨架
  }
  
  .skeleton-pagination {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}
</style>
