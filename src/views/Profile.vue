<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getMaskedAkSk, resetAkSk, updateProfile } from '@/api/auth'
import { pageUserInterfaceInfo } from '@/api/userInterfaceInfo'
import dayjs from 'dayjs'

const auth = useAuthStore()
const masked = ref(null)
const loading = ref(false)
const msg = ref('')
const showSuccessAnimation = ref(false)
const quotaLoading = ref(false)
const quotas = ref([])
const prevLeft = ref({})

// 个人信息编辑相关状态
const editMode = ref(false)
const profileForm = ref({
  userName: '',
  userAvatar: '', 
  gender: 0
})
const profileLoading = ref(false)

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
    // 非静默模式，显示加载状态
    auth.hydrate(false).then(loadMasked)
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

// 个人信息编辑功能
function startEdit() {
  if (!auth.user) return
  profileForm.value = {
    userName: auth.user.userName || '',
    userAvatar: auth.user.userAvatar || '',
    gender: auth.user.gender || 0
  }
  editMode.value = true
}

function cancelEdit() {
  editMode.value = false
  profileForm.value = { userName: '', userAvatar: '', gender: 0 }
}

async function saveProfile() {
  if (!auth.user) return
  profileLoading.value = true
  try {
    // 添加用户ID到请求数据
    const updateData = {
      id: auth.user.id,
      ...profileForm.value
    }
    
    const resp = await updateProfile(updateData)
    if (resp?.code === 0) {
      // 更新本地用户信息
      auth.updateUser(profileForm.value)
      editMode.value = false
      triggerSuccessAnimation()
      alert('个人信息更新成功！')
    } else {
      alert(resp?.message || '更新失败')
    }
  } catch (e) {
    alert(e?.response?.data?.message || e.message || '更新失败')
  } finally {
    profileLoading.value = false
  }
}

</script>

<template>
  <div class="profile">
    <el-card shadow="never" class="profile-card anim-fade-in-left" :class="{ 'anim-trigger-glow': showSuccessAnimation }">
      <template #header>
        <div class="card-header"><h2>我的资料</h2></div>
      </template>
      <div v-if="auth.loading" class="loading-state">
        <el-skeleton :rows="5" animated />
        <p class="loading-text">正在加载您的资料，请稍候片刻...</p>
      </div>
      <div v-else-if="!auth.user">
        <p>未登录，请先 <router-link to="/login">登录</router-link></p>
      </div>
      <div v-else>
        <!-- 查看模式 -->
        <div v-if="!editMode">
          <div class="user-info">
            <p><strong>用户名：</strong>{{ auth.user.userName || auth.user.userAccount }}</p>
            <p><strong>账号：</strong>{{ auth.user.userAccount }}</p>
            <p><strong>性别：</strong>{{ auth.user.gender === 1 ? '男' : auth.user.gender === 2 ? '女' : '未设置' }}</p>
            <p><strong>角色：</strong>{{ auth.user.userRole === 'admin' ? '管理员' : '普通用户' }}</p>
          </div>
          <div class="action-buttons">
            <el-button type="primary" @click="startEdit">编辑资料</el-button>
          </div>
        </div>
        
        <!-- 编辑模式 -->
        <el-form v-else v-loading="profileLoading" :model="profileForm" label-width="80px">
          <el-form-item label="用户名">
            <el-input v-model="profileForm.userName" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="头像">
            <el-input v-model="profileForm.userAvatar" placeholder="请输入头像URL" />
          </el-form-item>
          <el-form-item label="性别">
            <el-radio-group v-model="profileForm.gender">
              <el-radio :label="0">未设置</el-radio>
              <el-radio :label="1">男</el-radio>
              <el-radio :label="2">女</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveProfile" :loading="profileLoading">保存</el-button>
            <el-button @click="cancelEdit">取消</el-button>
          </el-form-item>
        </el-form>
        
        <!-- AK/SK 区域 -->
        <div class="keys-section">
          <h3>密钥信息</h3>
          <div class="keys">
            <div><b>AccessKey</b>：{{ masked?.accessKey || '-' }}</div>
            <div><b>SecretKey</b>：{{ masked?.secretKey || '-' }}</div>
          </div>
          <el-button v-if="auth.canResetAkSk" @click="onReset">重置 AK/SK</el-button>
        </div>
        
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

.user-info {
  margin: 16px 0;
  padding: 16px;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.user-info p {
  margin: 8px 0;
  line-height: 1.6;
}

.action-buttons {
  margin: 16px 0;
}

.keys-section {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.keys-section h3 {
  margin-bottom: 12px;
  color: var(--color-text-primary);
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


