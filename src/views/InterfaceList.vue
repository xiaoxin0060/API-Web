<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { pageInterfaces, onlineInterface, offlineInterface, deleteInterface } from '@/api/interfaces'
import { useAuthStore } from '@/stores/auth'
import TableSkeleton from '@/components/Skeleton/TableSkeleton.vue'
import EmptyState from '@/components/Empty/EmptyState.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const list = ref([])
const loading = ref(false)
const total = ref(0)
const selectedRows = ref([])
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

const isAdmin = auth.isAdmin

const methodOptions = [
  { label: 'GET', value: 'GET', type: 'success' },
  { label: 'POST', value: 'POST', type: 'primary' },
  { label: 'PUT', value: 'PUT', type: 'warning' },
  { label: 'DELETE', value: 'DELETE', type: 'danger' }
]

function syncFromRoute() {
  const q = route.query
  query.value.current = Number(q.current || 1)
  query.value.pageSize = Number(q.pageSize || 10)
  query.value.name = (q.name || '').toString()
  query.value.method = (q.method || '').toString()
  query.value.status = q.status === undefined || q.status === '' ? '' : Number(q.status)
  query.value.category = (q.category || '').toString()
  query.value.sortField = (q.sortField || '').toString()
  query.value.sortOrder = (q.sortOrder || '').toString()
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
    const resp = await pageInterfaces(params)
    if (resp?.code === 0) {
      list.value = resp.data.records || []
      total.value = resp.data.total || 0
    } else {
      ElMessage.error(resp?.message || '加载失败')
    }
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e.message)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  query.value.current = 1
  pushToRoute()
  fetchData()
}

function handleReset() {
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
  pushToRoute()
  fetchData()
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

onMounted(() => { syncFromRoute(); fetchData() })
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
      <el-form :model="query" inline>
        <el-form-item label="接口名称">
          <el-input 
            v-model="query.name" 
            placeholder="请输入接口名称"
            class="search-input"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="请求方法">
          <el-select v-model="query.method" placeholder="请选择方法" clearable>
            <el-option 
              v-for="method in methodOptions" 
              :key="method.value"
              :label="method.label"
              :value="method.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="请选择状态" clearable>
            <el-option label="在线" :value="1" />
            <el-option label="下线" :value="0" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="分类">
          <el-input 
            v-model="query.category" 
            placeholder="请输入分类"
            clearable
          />
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
            <el-text v-if="selectedRows.length" type="warning">已选 {{ selectedRows.length }} 项</el-text>
          </div>
          <div v-if="isAdmin" class="bulk-actions">
            <el-button size="small" @click="handleBulk('online')">批量上线</el-button>
            <el-button size="small" @click="handleBulk('offline')">批量下线</el-button>
            <el-button size="small" type="danger" @click="handleBulk('delete')">批量删除</el-button>
          </div>
        </div>
      </template>

      <TableSkeleton v-if="loading && !list.length" />
      <EmptyState v-else-if="!loading && !list.length" :showCreate="false" :showRefresh="true" entityName="接口" @refresh="fetchData" />

      <el-table 
        v-else
        :data="list" 
        v-loading="loading"
        empty-text="暂无数据"
        @row-click="goDetail"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        :default-sort="{ prop: query.sortField || 'createTime', order: query.sortOrder || 'descending' }"
        style="cursor: pointer;"
        class="interface-table"
        :scroll-x="true"
      >
        <el-table-column type="selection" width="48" />
        <el-table-column label="序号" width="80">
          <template #default="{ $index }">
            {{ (query.current - 1) * query.pageSize + $index + 1 }}
          </template>
        </el-table-column>
        
        <el-table-column label="接口信息" min-width="300" sortable="custom" prop="name">
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
        
        <el-table-column label="分类" prop="category" width="120" sortable="custom">
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
        
        <el-table-column label="操作" width="160" v-else>
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
          @size-change="fetchData"
          @current-change="fetchData"
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


