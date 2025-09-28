<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { pageUsers, deleteUser } from '@/api/users'
import { resetAkSk } from '@/api/auth'
import { User, Search, Refresh, Delete } from '@element-plus/icons-vue'
import TableSkeleton from '@/components/Skeleton/TableSkeleton.vue'
import EmptyState from '@/components/Empty/EmptyState.vue'

const router = useRouter()
const route = useRoute()
const users = ref([])
const query = ref({ current: 1, pageSize: 10, userName: '', userAccount: '', sortField: 'createTime', sortOrder: 'descend' })
const total = ref(0)
const loading = ref(false)
const selectedRows = ref([])

function syncFromRoute() {
  const q = route.query
  query.value.current = Number(q.current || 1)
  query.value.pageSize = Number(q.pageSize || 10)
  query.value.userName = (q.userName || '').toString()
  query.value.userAccount = (q.userAccount || '').toString()
  query.value.sortField = (q.sortField || 'createTime').toString()
  query.value.sortOrder = (q.sortOrder || 'descend').toString()
}

function pushToRoute() {
  const q = { ...query.value }
  Object.keys(q).forEach(k => { if (q[k] === '' || q[k] === null || q[k] === undefined) delete q[k] })
  router.replace({ query: q })
}

async function fetchData() {
  loading.value = true
  try {
    const params = Object.fromEntries(Object.entries(query.value).filter(([_, v]) => v !== '' && v !== null && v !== undefined))
    const resp = await pageUsers(params)
    if (resp?.code === 0) {
      users.value = resp.data.records || []
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

function handleSearch() { query.value.current = 1; pushToRoute(); fetchData() }

function handleReset() { query.value = { current: 1, pageSize: 10, userName: '', userAccount: '', sortField: 'createTime', sortOrder: 'descend' }; pushToRoute(); fetchData() }

async function onDelete(row) {
  try {
    await ElMessageBox.confirm('确认删除该用户？此操作不可恢复。', '危险操作确认', { type: 'warning' })
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (e) { if (e !== 'cancel') ElMessage.error('删除失败') }
}

function handleSelectionChange(rows) { selectedRows.value = rows }
function handleSortChange({ prop, order }) { query.value.sortField = prop || 'createTime'; query.value.sortOrder = order || 'descend'; query.value.current = 1; pushToRoute(); fetchData() }

async function handleBulkDelete() {
  if (!selectedRows.value.length) return
  try {
    await ElMessageBox.confirm(`确认删除选中的 ${selectedRows.value.length} 个用户？`, '危险操作确认', { type: 'warning' })
    for (const u of selectedRows.value) { await deleteUser(u.id) }
    ElMessage.success('批量删除成功')
    fetchData()
  } catch (e) { if (e !== 'cancel') ElMessage.error('批量删除失败') }
}

async function onResetAkSk(row) {
  try {
    await ElMessageBox.confirm(`确认重置用户"${row.userName || row.userAccount}"的 AK/SK 密钥？`, '重置确认', { 
      type: 'warning',
      confirmButtonText: '确认重置',
      cancelButtonText: '取消'
    })
    
    const resp = await resetAkSk(row.id)
    if (resp?.code === 0) {
      ElMessage.success('密钥重置成功，请通知用户重新获取')
    } else {
      ElMessage.error(resp?.message || '重置失败')
    }
  } catch (e) { 
    if (e !== 'cancel') {
      ElMessage.error(e?.response?.data?.message || '重置失败')
    }
  }
}

onMounted(() => { syncFromRoute(); fetchData() })
</script>

<template>
  <div class="user-list">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <el-icon><User /></el-icon>
          用户管理
        </h1>
        <p class="page-subtitle">管理平台用户</p>
      </div>
    </div>

    <el-card class="search-card" shadow="never">
      <el-form :model="query" inline>
        <el-form-item label="用户名">
          <el-input v-model="query.userName" placeholder="请输入用户名" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="账号">
          <el-input v-model="query.userAccount" placeholder="请输入账号" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button>
          <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="list-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div style="display:flex;align-items:center;gap:12px;">
            <span>用户列表</span>
            <el-text type="info">共 {{ total }} 条</el-text>
            <el-text v-if="selectedRows.length" type="warning">已选 {{ selectedRows.length }} 项</el-text>
          </div>
          <div class="bulk-actions">
            <el-button size="small" type="danger" @click="handleBulkDelete">批量删除</el-button>
          </div>
        </div>
      </template>

      <TableSkeleton v-if="loading && !users.length" />
      <EmptyState v-else-if="!loading && !users.length" :showCreate="false" :showRefresh="true" entityName="用户" @refresh="fetchData" />

      <el-table
        v-else
        :data="users"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        :default-sort="{ prop: query.sortField, order: query.sortOrder === 'descend' ? 'descending' : 'ascending' }"
        class="users-table"
      >
        <el-table-column type="selection" width="48" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="userName" label="用户名" sortable="custom" />
        <el-table-column prop="userAccount" label="账号" sortable="custom" />
        <el-table-column prop="userRole" label="角色" width="120" />
        <el-table-column prop="createTime" label="创建时间" width="180" sortable="custom">
          <template #default="{ row }">{{ row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm') : '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="warning" @click.stop="onResetAkSk(row)">重置密钥</el-button>
            <el-button size="small" type="danger" @click.stop="onDelete(row)"><el-icon><Delete /></el-icon>删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="query.current"
          v-model:page-size="query.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          class="users-pagination"
          @size-change="() => { pushToRoute(); fetchData() }"
          @current-change="() => { pushToRoute(); fetchData() }"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.user-list { 
  max-width: 1400px; 
  margin: 0 auto; 
  padding: 20px;
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
  color: var(--color-text-primary); 
  margin: 0 0 8px 0; 
}

.page-subtitle { 
  color: var(--color-text-secondary); 
  margin: 0; 
}

.search-card { 
  margin-bottom: 16px; 
  border: 1px solid var(--color-border);
  border-radius: 1rem;
}

.list-card { 
  background: var(--color-bg-secondary); 
  border: 1px solid var(--color-border);
  border-radius: 1rem;
}

.card-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
}

.pagination-container { 
  display: flex; 
  justify-content: center; 
  margin-top: 24px; 
}

/* 【动画71】表格行懒加载顺序浮现 */
.users-table :deep(.el-table__row) {
  animation: tableRowFadeIn 0.6s var(--anim-ease-spring) forwards;
}

.users-table :deep(.el-table__row:nth-child(1)) { animation-delay: 0.1s; }
.users-table :deep(.el-table__row:nth-child(2)) { animation-delay: 0.15s; }
.users-table :deep(.el-table__row:nth-child(3)) { animation-delay: 0.2s; }
.users-table :deep(.el-table__row:nth-child(4)) { animation-delay: 0.25s; }
.users-table :deep(.el-table__row:nth-child(5)) { animation-delay: 0.3s; }
.users-table :deep(.el-table__row:nth-child(6)) { animation-delay: 0.35s; }
.users-table :deep(.el-table__row:nth-child(7)) { animation-delay: 0.4s; }
.users-table :deep(.el-table__row:nth-child(8)) { animation-delay: 0.45s; }
.users-table :deep(.el-table__row:nth-child(9)) { animation-delay: 0.5s; }
.users-table :deep(.el-table__row:nth-child(10)) { animation-delay: 0.55s; }

/* 【动画4】数据行悬停微光 */
.users-table :deep(.el-table__row:hover) {
  background: var(--color-row-hover);
  box-shadow: 0 0 12px rgba(96, 165, 250, 0.05);
  transition: all 0.2s var(--anim-ease-out);
}

/* 【动画20】分页器按钮脉冲 */
.users-pagination :deep(.btn-next:hover),
.users-pagination :deep(.btn-prev:hover),
.users-pagination :deep(.el-pager li:hover) {
  animation: paginationPulse 0.3s var(--anim-ease-spring) forwards;
}

.users-pagination :deep(.el-pager li.is-active) {
  animation: paginationActive 0.4s var(--anim-ease-spring) forwards;
}

@keyframes paginationPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes paginationActive {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
</style>


