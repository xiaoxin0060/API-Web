<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, UserFilled } from '@element-plus/icons-vue'
import { register as apiRegister } from '@/api/auth'

const router = useRouter()
const loading = ref(false)
const showErrorShake = ref(false)

const registerForm = reactive({
  userAccount: '',
  userPassword: '',
  checkPassword: ''
})

const rules = {
  userAccount: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 4, max: 20, message: '账号长度在 4 到 20 个字符', trigger: 'blur' }
  ],
  userPassword: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为 6 个字符', trigger: 'blur' }
  ],
  checkPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.userPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const formRef = ref()

async function onSubmit() {
  try {
    await formRef.value.validate()
    loading.value = true
    const resp = await apiRegister(
      registerForm.userAccount, 
      registerForm.userPassword, 
      registerForm.checkPassword
    )
    if (resp?.code === 0) {
      ElMessage.success('注册成功，即将跳转到登录页')
      setTimeout(() => router.push('/login'), 1500)
    } else {
      ElMessage.error(resp?.message || '注册失败')
      triggerErrorShake()
    }
  } catch (e) {
    if (e?.response?.data?.message || e.message) {
      ElMessage.error(e?.response?.data?.message || e.message || '注册失败')
    }
    triggerErrorShake()
  } finally {
    loading.value = false
  }
}

function triggerErrorShake() {
  showErrorShake.value = true
  setTimeout(() => {
    showErrorShake.value = false
  }, 400)
}
</script>

<template>
  <div class="register-container">
    <div class="register-card anim-fade-in-up">
      <div class="card-header">
        <div class="header-icon">
          <el-icon size="48"><UserFilled /></el-icon>
        </div>
        <h1 class="register-title">创建新账户</h1>
        <p class="register-subtitle">加入小新API平台，开始您的API之旅</p>
      </div>

      <el-form 
        ref="formRef" 
        :model="registerForm" 
        :rules="rules" 
        size="large"
        :class="{ 'anim-trigger-shake': showErrorShake }"
        @submit.prevent="onSubmit"
      >
        <el-form-item prop="userAccount">
          <el-input
            v-model="registerForm.userAccount"
            placeholder="请输入账号"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="userPassword">
          <el-input
            v-model="registerForm.userPassword"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="checkPassword">
          <el-input
            v-model="registerForm.checkPassword"
            type="password"
            placeholder="请再次输入密码"
            :prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            style="width: 100%"
            :loading="loading"
            @click="onSubmit"
          >
            {{ loading ? '正在创建账户...' : '注册' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="register-footer">
        <p>
          已有账号？
          <router-link to="/login" class="login-link">立即登录</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    var(--color-bg-primary) 0%, 
    var(--color-bg-secondary) 100%);
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 420px;
  background: var(--color-bg-secondary);
  border-radius: 1rem;
  box-shadow: var(--color-shadow-lg);
  padding: 2.5rem;
  border: 1px solid var(--color-border);
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.header-icon {
  margin-bottom: 1rem;
  color: var(--color-accent-blue);
}

.register-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 0.5rem 0;
}

.register-subtitle {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
}

.register-footer {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.register-footer p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.login-link {
  color: var(--color-accent-blue);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.login-link:hover {
  color: var(--color-accent-blue-hover);
  text-decoration: underline;
}

/* 修复密码输入框叉号抖动问题 - 预留清除按钮空间 */
.register-card :deep(.el-input--password .el-input__wrapper) {
  padding-right: 55px !important; /* 为眼睛图标和叉号预留空间 */
}

.register-card :deep(.el-input--password .el-input__suffix) {
  width: 50px !important; /* 固定后缀区域宽度 */
  display: flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
}

.register-card :deep(.el-input--password .el-input__clear) {
  margin-right: 4px !important; /* 叉号与眼睛图标的间距 */
}

/* 普通输入框也预留清除按钮空间 */
.register-card :deep(.el-input:not(.el-input--password) .el-input__wrapper) {
  padding-right: 35px !important; /* 为叉号预留空间 */
}

.register-card :deep(.el-input:not(.el-input--password) .el-input__suffix) {
  width: 30px !important;
}

/* 动画样式 */
.anim-fade-in-up {
  animation: fadeInUp 0.6s var(--anim-ease-spring) forwards;
}

@keyframes fadeInUp {
  from { 
    opacity: 0; 
    transform: translateY(30px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

/* 响应式设计 */
@media (max-width: 640px) {
  .register-container {
    padding: 1rem;
  }
  
  .register-card {
    padding: 2rem 1.5rem;
  }
  
  .register-title {
    font-size: 1.5rem;
  }
}</style>


