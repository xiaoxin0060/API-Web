<script setup>
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const loginForm = reactive({
  userAccount: '',
  userPassword: ''
})

const rules = {
  userAccount: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 4, max: 20, message: '账号长度在 4 到 20 个字符', trigger: 'blur' }
  ],
  userPassword: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为 6 个字符', trigger: 'blur' }
  ]
}

const formRef = ref()
const showErrorShake = ref(false)

function normalizeRedirect(raw) {
  if (!raw || typeof raw !== 'string') return ''
  let val = raw
  for (let i = 0; i < 2; i++) {
    try {
      const decoded = decodeURIComponent(val)
      if (decoded === val) break
      val = decoded
    } catch {
      break
    }
  }
  // 仅允许站内路径，防止开放重定向
  return val.startsWith('/') ? val : ''
}

async function onSubmit() {
  try {
    await formRef.value.validate()
    const ok = await auth.login(loginForm.userAccount, loginForm.userPassword)
    if (ok) {
      ElMessage.success('登录成功')
      
      // 检查是否有重定向参数，如果有则跳转到原页面
      const redirect = normalizeRedirect(route.query.redirect)
      await auth.hydrate().catch(() => {})
      await router.replace(redirect || '/interfaces')
    } else {
      ElMessage.error(auth.error || '登录失败')
      triggerErrorShake()
    }
  } catch (error) {
    // 表单验证失败
    triggerErrorShake()
  }
}

function triggerErrorShake() {
  showErrorShake.value = true
  setTimeout(() => {
    showErrorShake.value = false
  }, 400)
}

// 若已登录则按 redirect 或默认页自动跳转，避免停留在登录页
const doRedirect = async () => {
  const redirect = normalizeRedirect(route.query.redirect)
  const target = redirect || '/interfaces'
  try {
    if (router.currentRoute.value.fullPath !== target) {
      await router.replace(target)
    }
  } catch (e) {
    // SPA 导航失败时使用硬跳转兜底
    window.location.assign(target)
  }
}

onMounted(() => {
  if (auth.user) {
    doRedirect()
  }
  // 监听登录状态变化，确保成功登录后一定跳转
  watch(() => auth.user, (u) => {
    if (u) doRedirect()
  })
})
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <!-- 左侧介绍 -->
      <div class="login-intro anim-fade-in-left">
        <div class="intro-content">
          <h1 class="intro-title">
            <el-icon size="40"><Setting /></el-icon>
            小新API平台
          </h1>
          <p class="intro-subtitle">专业的API接口管理与调试平台</p>
          <div class="intro-features">
            <div class="feature-item">
              <el-icon><Document /></el-icon>
              <span>接口文档管理</span>
            </div>
            <div class="feature-item">
              <el-icon><Monitor /></el-icon>
              <span>在线接口测试</span>
            </div>
            <div class="feature-item">
              <el-icon><DataAnalysis /></el-icon>
              <span>调用统计分析</span>
            </div>
            <div class="feature-item">
              <el-icon><Lock /></el-icon>
              <span>权限安全管控</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧登录表单 -->
      <div class="login-form-container anim-fade-in-right">
        <div class="form-header">
          <h2>欢迎回来</h2>
          <p>登录您的账户开始使用</p>
        </div>
        
        <el-form 
          ref="formRef" 
          :model="loginForm" 
          :rules="rules" 
          size="large"
          :class="{ 'anim-trigger-shake': showErrorShake }"
          @submit.prevent="onSubmit"
        >
          <el-form-item prop="userAccount">
            <el-input
              v-model="loginForm.userAccount"
              placeholder="请输入账号"
              prefix-icon="User"
              clearable
            />
          </el-form-item>
          
          <el-form-item prop="userPassword">
            <el-input
              v-model="loginForm.userPassword"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
              clearable
            />
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              size="large" 
              style="width: 100%"
              :loading="auth.loading"
              @click="onSubmit"
            >
              {{ auth.loading ? '正在登录...' : '登录' }}
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="form-footer">
          <span>还没有账号？</span>
          <el-link type="primary" @click="router.push('/register')">立即注册</el-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    var(--color-bg-primary) 0%, 
    var(--color-bg-secondary) 100%);
  padding: 20px;
}

.login-card {
  background: var(--color-bg-secondary);
  border-radius: 1.5rem;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--color-border);
  overflow: hidden;
  width: 100%;
  max-width: 1000px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 650px;
}

.login-intro {
  background: linear-gradient(135deg, 
    var(--color-accent-blue) 0%, 
    #3b82f6 50%,
    var(--color-accent-blue-hover) 100%);
  color: white;
  padding: 3rem 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-intro::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23ffffff" fill-opacity="0.05"><circle cx="30" cy="30" r="2"/></g></svg>');
  pointer-events: none;
}

.intro-content {
  text-align: center;
  position: relative;
  z-index: 1;
}

.intro-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.intro-subtitle {
  font-size: 1.125rem;
  opacity: 0.95;
  margin-bottom: 3rem;
  line-height: 1.6;
  font-weight: 400;
}

.intro-features {
  display: grid;
  gap: 1.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1rem;
  opacity: 0.95;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s var(--anim-ease-out);
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.login-form-container {
  padding: 3rem 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: var(--color-bg-secondary);
}

.form-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.form-header h2 {
  font-size: 1.875rem;
  color: var(--color-text-primary);
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.form-header p {
  color: var(--color-text-secondary);
  font-size: 1rem;
  margin: 0;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-card {
    grid-template-columns: 1fr;
    max-width: 480px;
    min-height: auto;
  }
  
  .login-intro {
    padding: 2rem 1.5rem;
  }
  
  .intro-title {
    font-size: 1.75rem;
  }
  
  .intro-subtitle {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
  
  .login-form-container {
    padding: 2rem 1.5rem;
  }
  
  .form-header h2 {
    font-size: 1.5rem;
  }
}
</style>


