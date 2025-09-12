<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-image">
        <div class="error-code">500</div>
        <div class="error-icon">
          <el-icon size="80"><Warning /></el-icon>
        </div>
      </div>
      
      <div class="error-content">
        <h1 class="error-title">服务器错误</h1>
        <p class="error-description">
          抱歉，服务器遇到了一些问题。我们的工程师已经收到通知，正在紧急修复中。
        </p>
        
        <div class="error-details" v-if="showDetails">
          <el-card class="detail-card">
            <template #header>
              <span>错误详情</span>
              <el-button 
                text 
                type="primary" 
                @click="copyErrorDetails"
                style="float: right; margin-top: -4px;"
              >
                <el-icon><CopyDocument /></el-icon>
                复制
              </el-button>
            </template>
            
            <div class="error-info">
              <p><strong>错误ID：</strong>{{ errorId }}</p>
              <p><strong>时间：</strong>{{ errorTime }}</p>
              <p><strong>页面：</strong>{{ currentPath }}</p>
              <p v-if="userAgent"><strong>浏览器：</strong>{{ userAgent }}</p>
            </div>
          </el-card>
        </div>
        
        <div class="error-actions">
          <el-button 
            type="primary" 
            @click="retry"
            :loading="retrying"
            size="large"
          >
            <el-icon><Refresh /></el-icon>
            重新加载
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
            @click="toggleDetails"
            size="large"
            text
            type="info"
          >
            <el-icon><InfoFilled /></el-icon>
            {{ showDetails ? '隐藏' : '显示' }}详情
          </el-button>
        </div>
        
        <div class="error-help">
          <el-alert
            title="如果问题持续存在"
            description="您可以尝试清除浏览器缓存，或联系技术支持团队获取帮助。"
            type="info"
            :closable="false"
            show-icon
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const retrying = ref(false)
const showDetails = ref(false)

// 错误信息
const errorId = ref(`ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
const errorTime = ref(new Date().toLocaleString())
const currentPath = computed(() => route.fullPath)
const userAgent = computed(() => navigator.userAgent)

// 重试操作
const retry = async () => {
  retrying.value = true
  
  try {
    // 验收标准：5xx 错误展示"重试"按钮
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 刷新当前页面
    window.location.reload()
  } catch (error) {
    ElMessage.error('重试失败，请稍后再试')
  } finally {
    retrying.value = false
  }
}

// 返回首页
const goHome = () => {
  router.push('/interfaces')
}

// 切换详情显示
const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

// 复制错误详情
const copyErrorDetails = async () => {
  const details = `
错误ID: ${errorId.value}
时间: ${errorTime.value}
页面: ${currentPath.value}
浏览器: ${userAgent.value}
  `.trim()
  
  try {
    await navigator.clipboard.writeText(details)
    ElMessage.success('错误详情已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败，请手动选择文本')
  }
}

// 页面加载时记录错误
onMounted(() => {
  // 发送错误报告到监控系统
  if (import.meta.env.PROD) {
    // TODO: 发送到 Sentry 或其他错误监控系统
    console.error('500 Server Error:', {
      errorId: errorId.value,
      path: currentPath.value,
      timestamp: new Date().toISOString(),
      userAgent: userAgent.value
    })
  }
})
</script>

<style scoped lang="scss">
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.error-container {
  max-width: 600px;
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
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
  background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 10px;
  animation: shake 2s infinite;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.error-icon {
  color: #f5576c;
  opacity: 0.8;
}

.error-title {
  font-size: 28px;
  color: var(--text-primary);
  margin-bottom: 15px;
  font-weight: 600;
}

.error-description {
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 30px;
}

.error-details {
  margin-bottom: 30px;
  text-align: left;
}

.detail-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.error-info {
  font-size: 14px;
  color: var(--text-secondary);
  
  p {
    margin-bottom: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  strong {
    color: var(--text-primary);
  }
}

.error-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

.error-help {
  margin-top: 20px;
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
