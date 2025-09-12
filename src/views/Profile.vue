<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getMaskedAkSk, resetAkSk } from '@/api/auth'
import { pageUserInterfaceInfo } from '@/api/userInterfaceInfo'
import WelcomeAnimation from '@/components/Welcome/WelcomeAnimation.vue'
import dayjs from 'dayjs'

const auth = useAuthStore()
const masked = ref(null)
const loading = ref(false)
const msg = ref('')
const showSuccessAnimation = ref(false)
const quotaLoading = ref(false)
const quotas = ref([])
const prevLeft = ref({})

async function loadMasked() {
  if (!auth.user) return
  loading.value = true
  msg.value = ''
  try {
    const resp = await getMaskedAkSk(auth.user.id)
    if (resp?.code === 0) {
      masked.value = resp.data
    } else {
      msg.value = resp?.message || '加载失败'
    }
  } catch (e) {
    msg.value = e?.response?.data?.message || e.message
  } finally {
    loading.value = false
  }
}

async function onReset() {
  if (!auth.user) return
  loading.value = true
  msg.value = ''
  try {
    const resp = await resetAkSk(auth.user.id)
    if (resp?.code === 0) {
      alert('已重置，请妥善保存新密钥')
      await loadMasked()
      triggerSuccessAnimation()
    } else {
      msg.value = resp?.message || '重置失败'
    }
  } catch (e) {
    msg.value = e?.response?.data?.message || e.message
  } finally {
    loading.value = false
  }
}

function triggerSuccessAnimation() {
  showSuccessAnimation.value = true
  setTimeout(() => {
    showSuccessAnimation.value = false
  }, 1000)
}

onMounted(() => {
  if (!auth.user) {
    auth.hydrate().then(loadMasked)
  } else {
    loadMasked()
  }
  loadQuotas()
})
async function loadQuotas() {
  if (!auth.user) return
  quotaLoading.value = true
  try {
    const resp = await pageUserInterfaceInfo({ userId: auth.user.id, current: 1, pageSize: 50 })
    if (resp?.code === 0) {
      const records = resp.data.records || []
      // 计算差值高亮
      quotas.value = records.map(r => ({ ...r, diff: prevLeft.value[r.interfaceInfoId] !== undefined ? r.leftNum - prevLeft.value[r.interfaceInfoId] : 0 }))
      prevLeft.value = Object.fromEntries(records.map(r => [r.interfaceInfoId, r.leftNum]))
    }
  } finally {
    quotaLoading.value = false
  }
}

function refreshQuotas() { loadQuotas() }

</script>

<template>
  <div class="profile">
    <el-card shadow="never" class="profile-card anim-fade-in-left" :class="{ 'anim-trigger-glow': showSuccessAnimation }">
      <template #header>
        <div class="card-header"><h2>我的资料</h2></div>
      </template>
      <WelcomeAnimation v-if="auth.loading" type="loading" message="正在加载您的资料" subtitle="请稍候片刻" />
      <div v-else-if="!auth.user">
        <p>未登录，请先 <router-link to="/login">登录</router-link></p>
      </div>
      <div v-else>
        <p>用户：{{ auth.user.userName || auth.user.userAccount }}</p>
        <div class="keys">
          <div><b>AccessKey</b>：{{ masked?.accessKey || '-' }}</div>
          <div><b>SecretKey</b>：{{ masked?.secretKey || '-' }}</div>
        </div>
        <el-button @click="onReset">管理员重置 AK/SK</el-button>
        <p v-if="msg" class="error-message">{{ msg }}</p>
      </div>
    </el-card>

    <el-card shadow="never" class="quota-card anim-fade-in-right">
      <template #header>
        <div class="card-header">
          <h3>我的接口配额</h3>
          <el-button size="small" @click="refreshQuotas" :loading="quotaLoading">刷新</el-button>
        </div>
      </template>
      <el-table :data="quotas" v-loading="quotaLoading" class="quota-table">
        <el-table-column prop="interfaceInfoId" label="接口ID" width="100" />
        <el-table-column prop="totalNum" label="总额度" width="120" />
        <el-table-column prop="leftNum" label="剩余额度" width="120">
          <template #default="{ row }">
            <el-text :type="row.diff > 0 ? 'success' : row.diff < 0 ? 'danger' : 'primary'">
              {{ row.leftNum }} <span v-if="row.diff">( {{ row.diff > 0 ? '+' : '' }}{{ row.diff }} )</span>
            </el-text>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180">
          <template #default="{ row }">{{ row.updateTime ? dayjs(row.updateTime).format('YYYY-MM-DD HH:mm') : '-' }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.error-message {
  color: #ef4444;
  font-size: 14px;
  margin: 8px 0;
}

.profile { 
  max-width: 1200px; 
  margin: 0 auto; 
  display: grid; 
  gap: 24px; 
  padding: 20px;
}

.profile-card {
  border: 1px solid var(--color-border);
  border-radius: 1rem;
}

.keys { 
  display: grid; 
  gap: 8px; 
  margin: 16px 0; 
  padding: 16px; 
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: 8px; 
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 14px;
}

.quota-card { 
  margin-top: 8px; 
  border: 1px solid var(--color-border);
  border-radius: 1rem;
}

.card-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
}

/* 表格行动画 */
.quota-table :deep(.el-table__row) {
  animation: tableRowFadeIn 0.6s var(--anim-ease-spring) forwards;
}

.quota-table :deep(.el-table__row:nth-child(1)) { animation-delay: 0.1s; }
.quota-table :deep(.el-table__row:nth-child(2)) { animation-delay: 0.2s; }
.quota-table :deep(.el-table__row:nth-child(3)) { animation-delay: 0.3s; }
.quota-table :deep(.el-table__row:nth-child(4)) { animation-delay: 0.4s; }
.quota-table :deep(.el-table__row:nth-child(5)) { animation-delay: 0.5s; }

/* 表格行悬停微光 */
.quota-table :deep(.el-table__row:hover) {
  background: var(--color-row-hover);
  box-shadow: 0 0 12px rgba(96, 165, 250, 0.05);
  transition: all 0.2s var(--anim-ease-out);
}
</style>


