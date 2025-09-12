<template>
  <div class="empty-state" :class="{ 'empty-state-small': size === 'small' }">
    <div class="empty-image">
      <!-- 自定义图标或使用默认图标 -->
      <slot name="icon">
        <el-icon :size="iconSize" class="empty-icon">
          <component :is="iconComponent" />
        </el-icon>
      </slot>
    </div>
    
    <div class="empty-content">
      <h3 class="empty-title">
        <slot name="title">
          {{ title || defaultTitle }}
        </slot>
      </h3>
      
      <p class="empty-description" v-if="description || $slots.description">
        <slot name="description">
          {{ description }}
        </slot>
      </p>
      
      <!-- 主要操作按钮 -->
      <div class="empty-actions" v-if="$slots.actions || showDefaultActions">
        <slot name="actions">
          <el-button 
            v-if="showCreate && canCreate"
            type="primary"
            @click="handleCreate"
            :loading="loading"
          >
            <el-icon><Plus /></el-icon>
            {{ createText || `创建${entityName}` }}
          </el-button>
          
          <el-button 
            v-if="showRefresh"
            @click="handleRefresh"
            :loading="refreshing"
          >
            <el-icon><Refresh /></el-icon>
            {{ refreshText || '刷新' }}
          </el-button>
          
          <el-button 
            v-if="showClearFilter && hasFilter"
            @click="handleClearFilter"
            plain
          >
            <el-icon><Close /></el-icon>
            {{ clearFilterText || '清除筛选' }}
          </el-button>
        </slot>
      </div>
      
      <!-- 帮助文档链接 -->
      <div class="empty-help" v-if="helpLink || helpText">
        <el-link 
          :href="helpLink" 
          target="_blank" 
          type="info"
          v-if="helpLink"
        >
          <el-icon><QuestionFilled /></el-icon>
          {{ helpText || '查看帮助文档' }}
        </el-link>
        <span v-else class="empty-help-text">{{ helpText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  // 基本属性
  type?: 'nodata' | 'search' | 'filter' | 'error' | 'network' | 'permission' | 'custom'
  size?: 'default' | 'small'
  title?: string
  description?: string
  
  // 操作相关
  showCreate?: boolean
  showRefresh?: boolean
  showClearFilter?: boolean
  createText?: string
  refreshText?: string
  clearFilterText?: string
  
  // 状态
  loading?: boolean
  refreshing?: boolean
  canCreate?: boolean
  hasFilter?: boolean
  
  // 实体相关
  entityName?: string
  
  // 帮助
  helpLink?: string
  helpText?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'nodata',
  size: 'default',
  showCreate: true,
  showRefresh: true,
  showClearFilter: true,
  loading: false,
  refreshing: false,
  canCreate: true,
  hasFilter: false,
  entityName: '内容'
})

interface Emits {
  (e: 'create'): void
  (e: 'refresh'): void
  (e: 'clear-filter'): void
}

const emit = defineEmits<Emits>()

// 计算属性
const iconSize = computed(() => props.size === 'small' ? 48 : 80)

const showDefaultActions = computed(() => 
  props.showCreate || props.showRefresh || (props.showClearFilter && props.hasFilter)
)

const iconComponent = computed(() => {
  const iconMap = {
    nodata: 'Box',
    search: 'Search',
    filter: 'Filter',
    error: 'Warning',
    network: 'WifiOff',
    permission: 'Lock',
    custom: 'InfoFilled'
  }
  return iconMap[props.type] || 'Box'
})

const defaultTitle = computed(() => {
  const titleMap = {
    nodata: `暂无${props.entityName}`,
    search: '未找到相关内容',
    filter: '没有符合条件的结果',
    error: '加载失败',
    network: '网络连接异常',
    permission: '权限不足',
    custom: '暂无内容'
  }
  return titleMap[props.type] || '暂无内容'
})

// 事件处理
const handleCreate = () => {
  emit('create')
}

const handleRefresh = () => {
  emit('refresh')
}

const handleClearFilter = () => {
  emit('clear-filter')
}
</script>

<style scoped lang="scss">
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  min-height: 300px;
  
  &.empty-state-small {
    padding: 40px 20px;
    min-height: 200px;
  }
}

.empty-image {
  margin-bottom: 24px;
  
  .empty-state-small & {
    margin-bottom: 16px;
  }
}

.empty-icon {
  color: var(--text-secondary);
  transition: all 0.3s ease;
  
  .empty-state:hover & {
    color: var(--text-secondary);
    transform: scale(1.05);
  }
}

.empty-content {
  max-width: 400px;
  
  .empty-state-small & {
    max-width: 300px;
  }
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.4;
  
  .empty-state-small & {
    font-size: 16px;
    margin-bottom: 6px;
  }
}

.empty-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 24px;
  line-height: 1.6;
  
  .empty-state-small & {
    font-size: 13px;
    margin-bottom: 16px;
  }
}

.empty-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
  
  .el-button {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      transform: translateY(-1px);
    }
  }
}

.empty-help {
  margin-top: 8px;
}

.empty-help-text {
  font-size: 12px;
  color: var(--text-secondary);
}

// 不同类型的样式变化
.empty-state {
  &[data-type="search"] {
    .empty-icon {
      color: var(--accent);
    }
  }
  
  &[data-type="error"] {
    .empty-icon {
      color: #ef4444;
    }
  }
  
  &[data-type="network"] {
    .empty-icon {
      color: #f59e0b;
    }
  }
  
  &[data-type="permission"] {
    .empty-icon {
      color: #dc2626;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .empty-state {
    padding: 40px 16px;
    min-height: 250px;
    
    &.empty-state-small {
      padding: 30px 16px;
      min-height: 150px;
    }
  }
  
  .empty-title {
    font-size: 16px;
    
    .empty-state-small & {
      font-size: 14px;
    }
  }
  
  .empty-description {
    font-size: 13px;
    
    .empty-state-small & {
      font-size: 12px;
    }
  }
  
  .empty-actions {
    flex-direction: column;
    align-items: center;
    
    .el-button {
      width: 200px;
    }
  }
}
</style>
