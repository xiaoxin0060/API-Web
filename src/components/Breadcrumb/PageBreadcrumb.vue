<template>
  <div class="page-breadcrumb" v-if="breadcrumbList.length > 1">
    <el-breadcrumb :separator-icon="ArrowRight" class="breadcrumb-nav breadcrumb" :class="{ loaded: isLoaded }">
      <el-breadcrumb-item
        v-for="(item, index) in breadcrumbList"
        :key="item.path || index"
        :class="[
          'breadcrumb-item',
          `level-${index + 1}`,
          { 'is-active': index === breadcrumbList.length - 1 }
        ]"
      >
        <!-- 首页图标 -->
        <template v-if="index === 0">
          <el-icon><House /></el-icon>
        </template>
        
        <!-- 可点击的面包屑项 -->
        <router-link 
          v-if="item.path && index < breadcrumbList.length - 1"
          :to="item.path"
          class="breadcrumb-link"
        >
          <el-icon v-if="item.icon && index > 0" class="breadcrumb-icon">
            <component :is="item.icon" />
          </el-icon>
          {{ $t(item.title) }}
        </router-link>
        
        <!-- 当前页面（不可点击） -->
        <span v-else class="breadcrumb-current">
          <el-icon v-if="item.icon && index > 0" class="breadcrumb-icon">
            <component :is="item.icon" />
          </el-icon>
          {{ $t(item.title) }}
        </span>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore
import { computed, ref, onMounted, nextTick } from 'vue'
// @ts-ignore
import { useRoute } from 'vue-router'
// @ts-ignore
import type { RouteRecordNormalized } from 'vue-router'
// @ts-ignore
import { ArrowRight } from '@element-plus/icons-vue'

interface BreadcrumbItem {
  title: string
  path?: string | undefined
  icon?: string | undefined
}

const route = useRoute()
// const router = useRouter() // 暂时未使用

// 控制面包屑淡入动画
const isLoaded = ref(false)

// 生成面包屑导航
const breadcrumbList = computed<BreadcrumbItem[]>(() => {
  const matched = route.matched.filter((item: RouteRecordNormalized) => item.meta?.breadcrumb !== false)
  const breadcrumbs: BreadcrumbItem[] = []
  
  // 添加首页
  breadcrumbs.push({
    title: 'nav.home',
    path: '/interfaces',
    icon: 'House'
  })
  
  // 处理匹配的路由
  matched.forEach((routeRecord: RouteRecordNormalized, index: number) => {
    const isLast = index === matched.length - 1
    const title = routeRecord.meta?.title || routeRecord.name
    
    if (title && title !== 'nav.home') {
      // 动态路由参数处理
      let displayTitle = title as string
      let routePath = routeRecord.path
      
      // 处理参数化路由
      if (route.params.id && routeRecord.path.includes(':id')) {
        routePath = routeRecord.path.replace(':id', route.params.id as string)
        
        // 根据路由类型设置显示标题
        if (routeRecord.name?.toString().includes('detail')) {
          displayTitle = getDetailTitle(routeRecord.name.toString(), route.params.id as string)
        } else if (routeRecord.name?.toString().includes('edit')) {
          displayTitle = getEditTitle(routeRecord.name.toString())
        }
      }
      
      breadcrumbs.push({
        title: displayTitle,
        path: isLast ? undefined : routePath,
        icon: routeRecord.meta?.icon
      })
    }
  })
  
  // 去重并返回
  return breadcrumbs.filter((item, index, arr) => 
    arr.findIndex(i => i.title === item.title) === index
  )
})

// 获取详情页标题
const getDetailTitle = (routeName: string, id: string): string => {
  if (routeName.includes('interface')) {
    return `接口详情 #${id}`
  } else if (routeName.includes('post')) {
    return `帖子详情 #${id}`
  }
  return `详情 #${id}`
}

// 获取编辑页标题
const getEditTitle = (routeName: string): string => {
  if (routeName.includes('interface')) {
    return 'interface.edit'
  } else if (routeName.includes('post')) {
    return 'post.edit'
  }
  return '编辑'
}

// 触发面包屑淡入动画
onMounted(() => {
  nextTick(() => {
    isLoaded.value = true
  })
})
</script>

<style scoped lang="scss">
.page-breadcrumb {
  margin-bottom: 24px;
  padding: 0 4px;
}

.breadcrumb-nav {
  font-size: 14px;
  
  :deep(.el-breadcrumb__item) {
    &:not(:last-child) {
      .el-breadcrumb__inner {
        color: var(--text-secondary);
        font-weight: 400;
        transition: all 0.2s ease;
        
        &:hover {
          color: var(--accent);
        }
      }
    }
    
    &:last-child {
      .el-breadcrumb__inner {
        color: var(--text-primary);
        font-weight: 500;
        cursor: default;
      }
    }
    
    &.is-active {
      .el-breadcrumb__inner {
        color: var(--accent);
      }
    }
  }
  
  :deep(.el-breadcrumb__separator) {
    color: var(--text-secondary);
    margin: 0 8px;
  }
}

.breadcrumb-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  padding: 2px 6px;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(99, 102, 241, 0.06);
    color: var(--accent);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
}

.breadcrumb-current {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.15);
}

.breadcrumb-icon {
  font-size: 12px;
  opacity: 0.8;
}

// 响应式设计
@media (max-width: 768px) {
  .page-breadcrumb {
    margin-bottom: 16px;
    padding: 0;
  }
  
  .breadcrumb-nav {
    font-size: 13px;
    
    :deep(.el-breadcrumb__separator) {
      margin: 0 6px;
    }
  }
  
  .breadcrumb-link,
  .breadcrumb-current {
    padding: 1px 4px;
    font-size: 13px;
  }
  
  .breadcrumb-icon {
    font-size: 11px;
  }
}

// 可访问性增强
@media (prefers-reduced-motion: reduce) {
  .breadcrumb-link {
    transition: none;
    
    &:hover {
      transform: none;
    }
  }
}

// 高对比度模式
@media (prefers-contrast: high) {
  .breadcrumb-nav {
    :deep(.el-breadcrumb__item) {
      &:not(:last-child) {
        .el-breadcrumb__inner {
          color: var(--text-primary);
          
          &:hover {
            color: var(--accent);
          }
        }
      }
      
      &:last-child {
        .el-breadcrumb__inner {
          color: var(--text-primary);
          font-weight: 600;
        }
      }
    }
  }
  
  .breadcrumb-current {
    background-color: rgba(96, 165, 250, 0.1);
    border-color: var(--accent);
  }
}
</style>
