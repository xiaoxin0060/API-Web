<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-image">
        <div class="error-code">403</div>
        <div class="error-icon">
          <el-icon size="80"><Lock /></el-icon>
        </div>
      </div>
      
      <div class="error-content">
        <h1 class="error-title">访问被禁止</h1>
        <p class="error-description">
          抱歉，您没有权限访问该页面。请联系管理员获取相应权限，或者返回到有权限的页面。
        </p>
        
        <div class="error-actions">
          <el-button 
            type="primary" 
            @click="goBack"
            :loading="loading"
            size="large"
          >
            <el-icon><ArrowLeft /></el-icon>
            返回上一页
          </el-button>
          
          <el-button 
            @click="goHome" 
            size="large"
            plain
          >
            <el-icon><House /></el-icon>
            返回首页
          </el-button>
          
          <el-button 
            @click="contactAdmin"
            size="large"
            text
            type="info"
          >
            <el-icon><Message /></el-icon>
            联系管理员
          </el-button>
        </div>
        
        <!-- 权限申请表单 -->
        <el-collapse v-model="showPermissionForm" class="permission-form">
          <el-collapse-item title="申请权限" name="permission">
            <el-form 
              ref="permissionFormRef"
              :model="permissionForm"
              :rules="permissionRules"
              label-width="80px"
              size="default"
            >
              <el-form-item label="申请理由" prop="reason">
                <el-input
                  v-model="permissionForm.reason"
                  type="textarea"
                  :rows="3"
                  placeholder="请简要说明您需要此权限的理由"
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>
              
              <el-form-item>
                <el-button 
                  type="primary"
                  @click="submitPermissionRequest"
                  :loading="submitting"
                >
                  提交申请
                </el-button>
                <el-button @click="showPermissionForm = []">
                  取消
                </el-button>
              </el-form-item>
            </el-form>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore
import { ref, onMounted } from 'vue'
// @ts-ignore
import { useRouter } from 'vue-router'
// @ts-ignore
import { ElMessage } from 'element-plus'
// @ts-ignore
import { Lock, ArrowLeft, House, Message } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(false)
const submitting = ref(false)
const showPermissionForm = ref<string[]>([])

// 权限申请表单
const permissionFormRef = ref()
const permissionForm = ref({
  reason: ''
})

const permissionRules = {
  reason: [
    { required: true, message: '请填写申请理由', trigger: 'blur' },
    { min: 10, message: '申请理由至少10个字符', trigger: 'blur' }
  ]
}

// 返回上一页
const goBack = async () => {
  loading.value = true
  
  try {
    // 验收标准：有历史记录则返回，否则去首页
    if (window.history.length > 1) {
      router.back()
    } else {
      await router.push('/interfaces')
    }
  } finally {
    setTimeout(() => {
      loading.value = false
    }, 300)
  }
}

// 返回首页
const goHome = () => {
  router.push('/interfaces')
}

// 联系管理员
const contactAdmin = () => {
  // 验收标准：提供业务友好文案与申请入口
  showPermissionForm.value = ['permission']
}

// 提交权限申请
const submitPermissionRequest = async () => {
  try {
    await permissionFormRef.value.validate()
    submitting.value = true
    
    // 模拟提交请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('权限申请已提交，管理员会尽快处理')
    showPermissionForm.value = []
    permissionForm.value.reason = ''
  } catch (error) {
    console.error('Permission request failed:', error)
  } finally {
    submitting.value = false
  }
}

// 页面加载时记录访问日志
onMounted(() => {
  // 验收标准：记录无权限访问日志
  console.log('403 Access denied:', {
    user: auth.user?.userAccount,
    path: router.currentRoute.value.fullPath,
    timestamp: new Date().toISOString()
  })
})
</script>

<style scoped lang="scss">
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.error-container {
  max-width: 600px;
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.error-image {
  position: relative;
  margin-bottom: 30px;
}

.error-code {
  font-size: 120px;
  font-weight: 800;
  background: linear-gradient(45deg, #ff6b6b, #ee5a6f);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 10px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.error-icon {
  color: #ff6b6b;
  opacity: 0.8;
}

.error-title {
  font-size: 28px;
  color: var(--color-text-primary);
  margin-bottom: 15px;
  font-weight: 600;
}

.error-description {
  font-size: 16px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 30px;
}

.error-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.permission-form {
  margin-top: 20px;
  text-align: left;
  background: rgba(249, 250, 251, 0.8);
  border-radius: 8px;
}

// 响应式设计
@media (max-width: 768px) {
  .error-container {
    margin: 20px;
    padding: 30px 20px;
  }
  
  .error-code {
    font-size: 80px;
  }
  
  .error-title {
    font-size: 24px;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .error-actions .el-button {
    width: 200px;
  }
}
</style>
