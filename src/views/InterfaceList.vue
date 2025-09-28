<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { pageInterfaces, onlineInterface, offlineInterface, deleteInterface } from '@/api/interfaces'
import { useAuthStore } from '@/stores/auth'
import { Document, Plus, Search, Refresh, Position, View, ArrowDown } from '@element-plus/icons-vue'
import TableSkeleton from '@/components/Skeleton/TableSkeleton.vue'
import EmptyState from '@/components/Empty/EmptyState.vue'

const auth = useAuthStore()
const { user: authUser, isAdmin, loading: authLoading } = storeToRefs(auth)
const router = useRouter()
const route = useRoute()

const list = ref([])
const loading = ref(false)
const total = ref(0)
const selectedRows = ref([])

// isAdmin 已通过 storeToRefs 解构

// 使用正常的权限系统

// 路由同步节流标记，避免 query 与 route 互相触发造成覆盖
const syncingFromRoute = ref(false)

// 初始化查询参数
const query = ref({
  current: 1, 
  pageSize: 10, 
  name: '',
  method: '',
  status: '',
  category: '',
  sortField: '',
  sortOrder: ''
})

const methodOptions = [
  { label: 'GET', value: 'GET', type: 'success' },
  { label: 'POST', value: 'POST', type: 'primary' },
  { label: 'PUT', value: 'PUT', type: 'warning' },
  { label: 'DELETE', value: 'DELETE', type: 'danger' }
]

// 状态映射（现在直接在代码中使用数字值）

// 分类选项来源：当前已加载数据的去重集合
const categoryOptions = computed(() => {
  const set = new Set()
  for (const item of list.value) {
    if (item && item.category) set.add(item.category)
  }
  return Array.from(set).map(v => ({ label: v, value: v }))
})

// 前端分类过滤（后端分页接口未在文档中列出 category 过滤参数）
const displayList = computed(() => {
  const data = list.value || []
  if (!query.value.category) return data
  return data.filter(r => r?.category === query.value.category)
})

function syncFromRoute() {
  const q = route.query
  console.debug('[SYNC] 同步路由参数:', q)
  console.debug('[SYNC] 当前用户权限:', isAdmin.value)
  
  query.value.current = Number(q.current || 1)
  query.value.pageSize = Number(q.pageSize || 10)
  query.value.name = (q.name || '').toString()
  query.value.method = (q.method || '').toString()
  query.value.category = (q.category || '').toString()
  query.value.sortField = (q.sortField || '').toString()
  query.value.sortOrder = (q.sortOrder || '').toString()
  
  // 根据用户权限设置状态
  if (isAdmin.value) {
    const raw = (q.status || '').toString().toUpperCase()
    // 支持多种格式：数字(0/1)、字符串(ONLINE/OFFLINE)
    let normalizedStatus = ''
    if (raw === '1' || raw === 'ONLINE') {
      normalizedStatus = 'ONLINE'
    } else if (raw === '0' || raw === 'OFFLINE') {
      normalizedStatus = 'OFFLINE'
    } else if (raw === '') {
      normalizedStatus = ''
    } else {
      console.warn('[SYNC] 未知状态值:', raw, '将重置为空')
      normalizedStatus = ''
    }
    
    query.value.status = normalizedStatus
    console.debug('[SYNC] 管理员模式，状态设置为:', query.value.status)
  } else {
    // 普通用户不显示状态筛选，query中保持空
    query.value.status = ''
    console.debug('[SYNC] 普通用户模式，状态清空')
  }
  
  console.debug('[SYNC] 最终query:', query.value)
}

function pushToRoute() {
  const q = { ...query.value }
  Object.keys(q).forEach(k => { if (q[k] === '' || q[k] === null || q[k] === undefined) delete q[k] })
  router.replace({ query: q })
}

async function fetchData() {
  loading.value = true
  try {
    // 过滤空值参数
    const params = Object.fromEntries(
      Object.entries(query.value).filter(([k, v]) => v !== '' && v !== null && v !== undefined)
    )
    // 后端文档未声明 category 作为分页过滤参数，这里移除以避免干扰
    if ('category' in params) delete params.category
    
    // 根据用户权限设置状态过滤
    const currentIsAdmin = isAdmin.value
    console.debug('[STATUS] 当前权限:', {
      权限状态: currentIsAdmin,
      查询状态: query.value.status,
      查询状态类型: typeof query.value.status
    })
    
    if (!currentIsAdmin) {
      // 普通用户强制仅显示已上线接口
      params.status = 1
      console.debug('[STATUS] 普通用户模式，强制status=1')
    } else {
      // 管理员状态筛选逻辑
      const statusFilter = query.value.status
      if (statusFilter === 'ONLINE') {
        params.status = 1
        console.debug('[STATUS] 管理员选择在线，status=1')
      } else if (statusFilter === 'OFFLINE') {
        params.status = 0
        console.debug('[STATUS] 管理员选择下线，status=0')
      } else if (statusFilter === '' || statusFilter === null || statusFilter === undefined) {
        // 明确不传status参数，显示全部状态
        console.debug('[STATUS] 管理员未选择状态，显示全部（不传status参数）')
      } else {
        // 处理其他意外值
        console.warn('[STATUS] 意外的状态值:', statusFilter, '显示全部')
      }
    }
    
    // 调试信息（开发环境）
    if (import.meta.env.DEV) {
      console.debug('[interfaces] query:', query.value)
      console.debug('[interfaces] params:', params)
      console.debug('[interfaces] isAdmin:', isAdmin.value)
    }
    
    const resp = await pageInterfaces(params)
    console.debug('[API] 响应结果:', resp)
    
    if (resp?.code === 0) {
      const records = resp.data.records || []
      list.value = records
      total.value = resp.data.total || 0
      console.debug('[API] 加载成功，条数:', records.length, '总数:', total.value)
      if (records.length > 0) {
        console.debug('[API] 第一条数据示例:', records[0])
      }
    } else {
      console.error('[API] 加载失败:', resp)
      ElMessage.error(resp?.message || '加载失败')
    }
  } catch (e) {
    // @ts-ignore
    ElMessage.error(e?.response?.data?.message || e?.message || '请求失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  console.debug('[SEARCH] 执行搜索')
  query.value.current = 1
  // 只推送路由，让路由监听触发fetchData避免重复请求
  pushToRoute()
}

function handleReset() {
  console.debug('[RESET] 重置筛选条件')
  
  // 重置所有筛选条件
  query.value = {
    current: 1, 
    pageSize: 10, 
    name: '',
    method: '',
    status: '',
    category: '',
    sortField: '',
    sortOrder: ''
  }
  
  console.debug('[RESET] 重置后的query:', query.value)
  
  // 只推送路由，让路由监听触发fetchData避免重复请求
  pushToRoute()
}

function goDetail(row) {
  const id = typeof row === 'object' ? row.id : row
  router.push(`/interfaces/${id}`)
}

function goTest(id) {
  router.push(`/interfaces/${id}#test`)
}

function goEdit(id) {
  router.push(`/interfaces/${id}/edit`)
}

async function handleStatusChange(row, status) {
  try {
    await ElMessageBox.confirm(
      status === 1 ? '确认上线该接口？上线后将对用户可见并可调用。' : '确认下线该接口？下线后将无法调用，已接入的功能可能受影响。',
      '二次确认',
      { type: 'warning' }
    )
    if (status === 1) {
      await onlineInterface(row.id)
      ElMessage.success('接口已上线')
    } else {
      await offlineInterface(row.id)
      ElMessage.success('接口已下线')
    }
    fetchData()
  } catch (e) {
    // @ts-ignore
    if (e !== 'cancel') ElMessage.error(e?.response?.data?.message || '操作失败')
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm('确认删除该接口？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteInterface(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (e) {
    if (e !== 'cancel') {
      // @ts-ignore
      ElMessage.error(e?.response?.data?.message || '删除失败')
    }
  }
}

function getMethodType(method) {
  return methodOptions.find(opt => opt.value === method)?.type || 'info'
}

function handleSelectionChange(rows) {
  selectedRows.value = rows
}

function handleSortChange({ prop, order }) {
  query.value.sortField = prop || ''
  // Element Plus: ascending/descending/null -> backend: ascend/descend/''
  query.value.sortOrder = order === 'ascending' ? 'ascend' : order === 'descending' ? 'descend' : ''
  query.value.current = 1
  pushToRoute()
  fetchData()
}

async function handleBulk(action) {
  if (!selectedRows.value.length) return
  const ids = selectedRows.value.map(r => r.id)
  if (action === 'delete') {
    try {
      await ElMessageBox.confirm(`确认删除选中的 ${ids.length} 个接口？此操作不可恢复。`, '危险操作确认', { type: 'warning' })
      for (const id of ids) { await deleteInterface(id) }
      ElMessage.success('批量删除成功')
      fetchData()
    } catch (e) { if (e !== 'cancel') ElMessage.error('批量删除失败') }
    return
  }
  const targetStatus = action === 'online' ? 1 : 0
  try {
    await ElMessageBox.confirm(
      action === 'online' ? `确认批量上线 ${ids.length} 个接口？` : `确认批量下线 ${ids.length} 个接口？下线后不可调用。`,
      '二次确认',
      { type: 'warning' }
    )
    for (const id of ids) {
      if (targetStatus === 1) await onlineInterface(id); else await offlineInterface(id)
    }
    ElMessage.success('批量操作成功')
    fetchData()
  } catch (e) { if (e !== 'cancel') ElMessage.error('批量操作失败') }
}

function handleActionCommand(row, command) {
  switch (command) {
    case 'edit':
      goEdit(row.id)
      break
    case 'online':
      handleStatusChange(row, 1)
      break
    case 'offline':
      handleStatusChange(row, 0)
      break
    case 'delete':
      handleDelete(row)
      break
  }
}

onMounted(async () => { 
  console.log('[INIT] 开始初始化，auth对象:', auth)
  console.log('[INIT] authUser ref:', authUser)
  console.log('[INIT] 当前用户:', authUser.value)
  console.log('[INIT] 权限状态详情:', { 
    isAdmin: isAdmin.value, 
    loading: authLoading.value,
    userRole: authUser.value?.userRole 
  })
  
  // 确保用户信息已加载
  if (!authUser.value && !authLoading.value) {
    console.log('[INIT] 重新加载用户信息...')
    try {
      await auth.hydrate()
      console.log('[INIT] hydrate完成')
      console.log('[INIT] authUser ref:', authUser)
      console.log('[INIT] authUser.value:', authUser.value)
      console.log('[INIT] 用户信息:', authUser.value)
      console.log('[INIT] 用户角色:', authUser.value?.userRole)
      console.log('[INIT] isAdmin computed:', isAdmin.value)
      
      // 强制触发响应式更新检查
      await nextTick()
      console.log('[INIT] nextTick后 authUser.value:', authUser.value)
    } catch (e) {
      console.error('[INIT] hydrate失败:', e)
    }
  }
  
  // 检查是否已登录
  if (!authUser.value) {
    console.warn('[INIT] 用户未登录，跳转到登录页面')
    // 可以选择跳转到登录页面
    // router.push('/login')
    // return
  }
  
  console.log('[INIT] 最终权限状态:', { isAdmin: isAdmin.value })
  syncFromRoute(); 
  fetchData() 
})

// 监听用户状态变化
watch(authUser, (newUser, oldUser) => {
  console.log('[WATCH] 用户状态变化:', {
    旧用户: oldUser,
    新用户: newUser,
    是否管理员: isAdmin.value
  })
  
  // 如果用户状态发生变化，重新获取数据
  if (newUser !== oldUser && oldUser !== undefined) {
    console.log('[WATCH] 用户状态改变，重新获取数据')
    fetchData()
  }
})

// 监听路由查询变化（来自浏览器前进/后退或外部跳转）
watch(() => route.query, () => {
  syncingFromRoute.value = true
  syncFromRoute()
  fetchData()
  // 下一帧再关闭，确保本次变更不会被 query 监听再次写回
  requestAnimationFrame(() => { syncingFromRoute.value = false })
})

function handleFilterChange() {
  if (syncingFromRoute.value) return
  console.debug('[FILTER] 筛选条件变化:', query.value)
  query.value.current = 1
  // 只推送路由，让路由监听触发fetchData避免重复请求
  pushToRoute()
}

// 专门处理状态筛选的函数
function handleStatusFilterChange(newStatus) {
  console.debug('[STATUS_FILTER] 状态筛选变化:', {
    新状态: newStatus,
    旧状态: query.value.status
  })
  
  // 防止路由同步时的重复触发
  if (syncingFromRoute.value) return
  
  query.value.status = newStatus || ''
  query.value.current = 1
  
  console.debug('[STATUS_FILTER] 更新后的query:', query.value)
  
  // 只推送路由，让路由监听触发fetchData避免重复请求
  pushToRoute()
}



// 删除单独的筛选标签展示，统一在原控件中显示选中项
</script>

<template>
  <div class="interface-list">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <el-icon><Document /></el-icon>
          接口文档
        </h1>
        <p class="page-subtitle">管理和测试您的API接口</p>
      </div>
      <div class="header-right" v-if="isAdmin">
        <el-button type="primary" @click="router.push('/interfaces/new')">
          <el-icon><Plus /></el-icon>
          新建接口
        </el-button>
      </div>
    </div>

    <!-- 搜索筛选区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="query" inline @change="handleFilterChange">
        <el-form-item label="接口名称">
          <el-input 
            v-model="query.name" 
            placeholder="请输入接口名称"
            class="search-input"
            clearable
            @keyup.enter="handleSearch"
            @change="handleFilterChange"
          />
        </el-form-item>
        
        <el-form-item label="请求方法">
          <el-select 
            v-model="query.method" 
            placeholder="请选择方法" 
            clearable 
            @change="handleFilterChange"
            style="width: 120px"
          >
            <el-option 
              v-for="method in methodOptions" 
              :key="method.value"
              :label="method.label"
              :value="method.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item v-if="isAdmin" label="状态">
          <el-select 
            v-model="query.status" 
            placeholder="请选择状态" 
            clearable 
            @change="handleStatusFilterChange"
            style="width: 120px"
          >
            <el-option label="在线" value="ONLINE" />
            <el-option label="下线" value="OFFLINE" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="分类">
          <el-select v-model="query.category" placeholder="请选择分类" clearable filterable @change="handleFilterChange">
            <el-option 
              v-for="opt in categoryOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset" class="reload-button" :class="{ loading: loading }">
            <el-icon class="icon"><Refresh /></el-icon>
            {{ loading ? '重置中...' : '重置' }}
          </el-button>
        </el-form-item>
        
      </el-form>
    </el-card>



    <!-- 批量操作工具条 -->
    <el-card class="list-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div style="display:flex;align-items:center;gap:12px;">
            <span>接口列表</span>
            <el-text type="info">共 {{ total }} 条</el-text>
            <el-text v-if="isAdmin && selectedRows.length" type="warning">已选 {{ selectedRows.length }} 项</el-text>
          </div>
          <div v-if="isAdmin" class="bulk-actions">
            <el-button size="small" @click="handleBulk('online')">批量上线</el-button>
            <el-button size="small" @click="handleBulk('offline')">批量下线</el-button>
            <el-button size="small" type="danger" @click="handleBulk('delete')">批量删除</el-button>
          </div>
        </div>
      </template>

      <TableSkeleton v-if="loading && !displayList.length" />
      <EmptyState v-else-if="!loading && !displayList.length" :showCreate="false" :showRefresh="true" entityName="接口" @refresh="fetchData" />

      <el-table 
        v-else
        :data="displayList" 
        v-loading="loading"
        empty-text="暂无数据"
        row-key="id"
        @row-click="goDetail"
        @selection-change="isAdmin ? handleSelectionChange : undefined"
        @sort-change="handleSortChange"
        :default-sort="{ prop: query.sortField || 'createTime', order: query.sortOrder || 'descending' }"
        style="cursor: pointer;"
        class="interface-table"
      >
        <el-table-column v-if="isAdmin" type="selection" width="48" />
        <el-table-column label="序号" width="80">
          <template #default="{ $index }">
            {{ (query.current - 1) * query.pageSize + $index + 1 }}
          </template>
        </el-table-column>
        
        <el-table-column label="接口信息" min-width="360" sortable="custom" prop="name">
          <template #default="{ row }">
            <div class="interface-info">
              <div class="interface-title">
                <el-text class="interface-name" @click.stop="goDetail(row)">
                  {{ row.name }}
                </el-text>
                <el-tag 
                  :type="getMethodType(row.method)"
                  size="small"
                  style="margin-left: 8px;"
                >
                  {{ row.method }}
                </el-tag>
              </div>
              <div class="interface-desc">
                <el-text type="info" size="small">
                  {{ row.description || '暂无描述' }}
                </el-text>
              </div>
              <div class="interface-url">
                <el-text type="primary" size="small">{{ row.url || '暂无接口地址' }}</el-text>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="分类" prop="category" width="140" sortable="custom">
          <template #default="{ row }">
            <el-tag v-if="row.category" type="info" size="small">
              {{ row.category }}
            </el-tag>
            <el-text v-else type="info">-</el-text>
          </template>
        </el-table-column>
        
        <el-table-column label="状态" width="100" sortable="custom" prop="status">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '在线' : '下线' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="创建时间" width="180" sortable="custom" prop="createTime">
          <template #default="{ row }">
            <el-text type="info">
              {{ row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm') : '-' }}
            </el-text>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="280" fixed="right" v-if="isAdmin">
          <template #default="{ row }">
            <div class="action-buttons table-actions" @click.stop>
              <el-button-group class="primary-actions">
                <el-button size="small" type="success" @click="goTest(row.id)">
                  <el-icon><Position /></el-icon>
                  测试
                </el-button>
                <el-button size="small" @click="goDetail(row.id)">
                  <el-icon><View /></el-icon>
                  详情
                </el-button>
              </el-button-group>
              
              <el-dropdown @command="(cmd) => handleActionCommand(row, cmd)" class="action-dropdown">
                <el-button size="small">
                  更多<el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu class="table-dropdown-menu">
                    <el-dropdown-item command="edit" :icon="'Edit'">
                      编辑
                    </el-dropdown-item>
                    <el-dropdown-item 
                      :command="row.status === 1 ? 'offline' : 'online'"
                      :icon="row.status === 1 ? 'OffLine' : 'Connection'"
                    >
                      {{ row.status === 1 ? '下线' : '上线' }}
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" :icon="'Delete'" divided>
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" v-else>
          <template #default="{ row }">
            <div class="action-buttons" @click.stop>
              <el-button size="small" type="success" @click="goTest(row.id)">
                <el-icon><Position /></el-icon>
                测试
              </el-button>
              <el-button size="small" @click="goDetail(row.id)">
                <el-icon><View /></el-icon>
                详情
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="query.current"
          v-model:page-size="query.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="() => { pushToRoute(); fetchData() }"
          @current-change="() => { pushToRoute(); fetchData() }"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.interface-list {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.page-subtitle {
  color: var(--text-secondary);
  margin: 0;
}

.search-card {
  margin-bottom: 16px;
}

.list-card {
  background: var(--surface-color);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.interface-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.interface-title {
  display: flex;
  align-items: center;
}

.interface-name {
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
}

.interface-name:hover {
  color: var(--accent);
}

.interface-desc {
  line-height: 1.4;
  margin: 2px 0;
}

.interface-url {
  font-family: 'Courier New', monospace;
  margin: 2px 0;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

/* 表格行hover效果 */
:deep(.el-table__row) {
  cursor: pointer;
}

:deep(.el-table__row:hover) {
  background-color: var(--surface-muted);
}

/* 表格布局优化 */
.interface-table {
  width: 100%;
  overflow-x: auto;
}

:deep(.el-table) {
  min-width: 1200px; /* 确保表格有最小宽度 */
}

:deep(.el-table__header-wrapper),
:deep(.el-table__body-wrapper) {
  overflow-x: auto;
}

/* 操作按钮布局优化 */
.action-buttons.table-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.primary-actions {
  display: flex;
  gap: 4px;
}

.primary-actions .el-button {
  padding: 5px 8px;
  font-size: 12px;
}

.action-dropdown .el-button {
  padding: 5px 8px;
  font-size: 12px;
}

</style>


