<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { pagePosts, deletePost } from '@/api/posts'
import { ChatLineSquare, Plus, Search, Refresh, View, Delete } from '@element-plus/icons-vue'
import TableSkeleton from '@/components/Skeleton/TableSkeleton.vue'
import EmptyState from '@/components/Empty/EmptyState.vue'

const router = useRouter()
const route = useRoute()

const posts = ref([])
const query = ref({ current: 1, pageSize: 10, content: '', reviewStatus: '', sortField: 'createTime', sortOrder: 'descend' })
const total = ref(0)
const loading = ref(false)
const selectedRows = ref([])

function syncFromRoute() {
  const q = route.query
  query.value.current = Number(q.current || 1)
  query.value.pageSize = Number(q.pageSize || 10)
  query.value.content = (q.content || '').toString()
  query.value.reviewStatus = q.reviewStatus === undefined || q.reviewStatus === '' ? '' : Number(q.reviewStatus)
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
    const resp = await pagePosts(params)
    if (resp?.code === 0) {
      posts.value = resp.data.records || []
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
  query.value = { current: 1, pageSize: 10, content: '', reviewStatus: '', sortField: 'createTime', sortOrder: 'descend' }
  pushToRoute()
  fetchData()
}

function goDetail(row) {
  const id = typeof row === 'object' ? row.id : row
  router.push(`/posts/${id}`)
}

async function onDelete(row) {
  try {
    await ElMessageBox.confirm('确认删除该帖子？此操作不可恢复。', '危险操作确认', { type: 'warning' })
    await deletePost(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (e) { if (e !== 'cancel') ElMessage.error('删除失败') }
}

function handleSelectionChange(rows) { selectedRows.value = rows }

function handleSortChange({ prop, order }) {
  query.value.sortField = prop || 'createTime'
  query.value.sortOrder = order || 'descend'
  query.value.current = 1
  pushToRoute()
  fetchData()
}

async function handleBulkDelete() {
  if (!selectedRows.value.length) return
  try {
    await ElMessageBox.confirm(`确认删除选中的 ${selectedRows.value.length} 条帖子？`, '危险操作确认', { type: 'warning' })
    for (const p of selectedRows.value) { await deletePost(p.id) }
    ElMessage.success('批量删除成功')
    fetchData()
  } catch (e) { if (e !== 'cancel') ElMessage.error('批量删除失败') }
}

onMounted(() => { syncFromRoute(); fetchData() })
</script>

<template>
  <div class="post-list">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <el-icon><ChatLineSquare /></el-icon>
          帖子列表
        </h1>
        <p class="page-subtitle">浏览与管理帖子</p>
      </div>
      <div class="header-right">
        <router-link to="/posts/new">
          <el-button type="primary"><el-icon><Plus /></el-icon>新建帖子</el-button>
        </router-link>
      </div>
    </div>

    <el-card class="search-card" shadow="never">
      <el-form :model="query" inline>
        <el-form-item label="关键词">
          <el-input v-model="query.content" placeholder="请输入内容关键词" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="query.reviewStatus" placeholder="请选择状态" clearable>
            <el-option label="未审核" :value="0" />
            <el-option label="通过" :value="1" />
            <el-option label="拒绝" :value="2" />
          </el-select>
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
            <span>帖子列表</span>
            <el-text type="info">共 {{ total }} 条</el-text>
            <el-text v-if="selectedRows.length" type="warning">已选 {{ selectedRows.length }} 项</el-text>
          </div>
          <div class="bulk-actions">
            <el-button size="small" type="danger" @click="handleBulkDelete">批量删除</el-button>
          </div>
        </div>
      </template>

      <TableSkeleton v-if="loading && !posts.length" />
      <EmptyState v-else-if="!loading && !posts.length" :showCreate="false" :showRefresh="true" entityName="帖子" @refresh="fetchData" />

      <el-table
        v-else
        :data="posts"
        v-loading="loading"
        @row-click="goDetail"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        :default-sort="{ prop: query.sortField, order: query.sortOrder === 'descend' ? 'descending' : 'ascending' }"
        style="cursor:pointer;"
        class="posts-table"
      >
        <el-table-column type="selection" width="48" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="帖子内容" min-width="300" prop="content" sortable="custom">
          <template #default="{ row }">
            <div class="content-cell">{{ row.content }}</div>
            <el-text type="info" size="small">#{{ row.id }} · {{ dayjs(row.createTime).format('YYYY-MM-DD HH:mm') }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="属性" min-width="220">
          <template #default="{ row }">
            <el-space wrap size="small">
              <el-tag v-if="row.gender !== undefined" size="small">性别: {{ row.gender }}</el-tag>
              <el-tag v-if="row.age !== undefined" size="small" type="success">年龄: {{ row.age }}</el-tag>
              <el-tag v-if="row.place" size="small" type="info">地区: {{ row.place }}</el-tag>
            </el-space>
          </template>
        </el-table-column>
        <el-table-column label="审核" width="120" prop="reviewStatus" sortable="custom">
          <template #default="{ row }">
            <el-tag :type="row.reviewStatus === 1 ? 'success' : row.reviewStatus === 2 ? 'danger' : 'info'">
              {{ row.reviewStatus === 1 ? '通过' : row.reviewStatus === 2 ? '拒绝' : '未审核' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click.stop="goDetail(row.id)"><el-icon><View /></el-icon>详情</el-button>
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
          class="posts-pagination"
          @size-change="() => { pushToRoute(); fetchData() }"
          @current-change="() => { pushToRoute(); fetchData() }"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.post-list { 
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

.content-cell { 
  margin-bottom: 6px; 
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis; 
  max-width: 600px; 
}

.pagination-container { 
  display: flex; 
  justify-content: center; 
  margin-top: 24px; 
}

/* 【动画71】表格行懒加载顺序浮现 */
.posts-table :deep(.el-table__row) {
  animation: tableRowFadeIn 0.6s var(--anim-ease-spring) forwards;
}

.posts-table :deep(.el-table__row:nth-child(1)) { animation-delay: 0.1s; }
.posts-table :deep(.el-table__row:nth-child(2)) { animation-delay: 0.15s; }
.posts-table :deep(.el-table__row:nth-child(3)) { animation-delay: 0.2s; }
.posts-table :deep(.el-table__row:nth-child(4)) { animation-delay: 0.25s; }
.posts-table :deep(.el-table__row:nth-child(5)) { animation-delay: 0.3s; }
.posts-table :deep(.el-table__row:nth-child(6)) { animation-delay: 0.35s; }
.posts-table :deep(.el-table__row:nth-child(7)) { animation-delay: 0.4s; }
.posts-table :deep(.el-table__row:nth-child(8)) { animation-delay: 0.45s; }
.posts-table :deep(.el-table__row:nth-child(9)) { animation-delay: 0.5s; }
.posts-table :deep(.el-table__row:nth-child(10)) { animation-delay: 0.55s; }

/* 【动画4】数据行悬停微光 */
.posts-table :deep(.el-table__row:hover) {
  background: var(--color-row-hover);
  box-shadow: 0 0 12px rgba(96, 165, 250, 0.05);
  transition: all 0.2s var(--anim-ease-out);
}

/* 【动画20】分页器按钮脉冲 */
.posts-pagination :deep(.btn-next:hover),
.posts-pagination :deep(.btn-prev:hover),
.posts-pagination :deep(.el-pager li:hover) {
  animation: paginationPulse 0.3s var(--anim-ease-spring) forwards;
}

.posts-pagination :deep(.el-pager li.is-active) {
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


