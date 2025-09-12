<template>
  <div class="welcome-splash-demo">
    <!-- 首次访问炫酷欢迎动画 -->
    <WelcomeAnimation 
      :show-first-visit="showWelcome"
      @complete="handleWelcomeComplete"
      @interactive-complete="handleInteractiveComplete"
    />
    
    <!-- 控制按钮 -->
    <div class="demo-controls" v-show="!showWelcome">
      <div class="controls-container">
        <h2>🎬 炫酷欢迎动画演示</h2>
        <p class="demo-description">
          体验为您定制的首次访问欢迎动画，包含：
        </p>
        <ul class="feature-list">
          <li>✨ 全屏遮罩 + 背景模糊</li>
          <li>🎯 Logo中心放大进入 + 光晕呼吸</li>
          <li>💫 粒子绽放闭环 + 数据流粒子注入</li>
          <li>⚡ 引导光轨吸引用户目光</li>
          <li>📊 数字跳动展现平台活力</li>
          <li>📝 项目介绍文字序列展示</li>
          <li>🎪 互动体验增加用户参与感</li>
          <li>🌊 空间渐进平滑过渡到主界面</li>
        </ul>
        
        <div class="demo-buttons">
          <button 
            class="start-demo-btn" 
            @click="startDemo"
            :disabled="isStarting"
          >
            {{ isStarting ? '正在启动...' : '开始体验炫酷动画' }}
          </button>
          
          <button 
            class="reset-demo-btn" 
            @click="resetDemo"
          >
            重置首次访问状态
          </button>
        </div>
        
        <div class="demo-info">
          <p class="info-text">
            💡 提示：真实场景中，此动画仅在用户首次访问时显示
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import WelcomeAnimation from '@/components/Welcome/WelcomeAnimation.vue'

const router = useRouter()

// 控制状态
const showWelcome = ref(false)
const isStarting = ref(false)

// 启动演示
const startDemo = async () => {
  isStarting.value = true
  
  // 小延迟让用户看到按钮状态变化
  setTimeout(() => {
    showWelcome.value = true
    isStarting.value = false
  }, 500)
}

// 重置演示
const resetDemo = () => {
  // 清除所有相关的缓存标记
  localStorage.removeItem('hasVisitedBefore')
  localStorage.removeItem('appColdStart')
  showWelcome.value = false
  
  // 给用户反馈
  const resetBtn = document.querySelector('.reset-demo-btn')
  if (resetBtn) {
    const originalText = resetBtn.textContent
    resetBtn.textContent = '✅ 已重置'
    resetBtn.disabled = true
    
    setTimeout(() => {
      resetBtn.textContent = originalText
      resetBtn.disabled = false
    }, 2000)
  }
}

// 处理欢迎动画完成
const handleWelcomeComplete = () => {
  console.log('欢迎动画完成')
  showWelcome.value = false
  
  // 可以在这里导航到登录页或主页
  // router.push('/login')
}

// 处理互动体验完成
const handleInteractiveComplete = () => {
  console.log('互动体验完成')
}
</script>

<style scoped>
.welcome-splash-demo {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.demo-controls {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    var(--color-bg-primary) 0%, 
    var(--color-bg-secondary) 100%
  );
  z-index: 100;
}

.controls-container {
  text-align: center;
  max-width: 600px;
  padding: 2rem;
  background: var(--color-bg-secondary);
  border-radius: 1rem;
  box-shadow: var(--color-shadow-lg);
  border: 1px solid var(--color-border);
}

.controls-container h2 {
  color: var(--color-text-primary);
  margin-bottom: 1rem;
  font-size: 2rem;
  background: linear-gradient(135deg, 
    var(--color-accent-blue), 
    var(--color-accent-purple)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.demo-description {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.feature-list {
  text-align: left;
  margin: 1.5rem 0;
  padding-left: 1rem;
}

.feature-list li {
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.demo-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.start-demo-btn {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, 
    var(--color-accent-blue), 
    var(--color-accent-purple)
  );
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(96, 165, 250, 0.3);
  min-width: 200px;
}

.start-demo-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(96, 165, 250, 0.4);
}

.start-demo-btn:active:not(:disabled) {
  transform: translateY(0);
}

.start-demo-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.reset-demo-btn {
  padding: 0.8rem 1.5rem;
  font-size: 0.95rem;
  color: var(--color-text-primary);
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-demo-btn:hover:not(:disabled) {
  background: var(--color-bg-secondary);
  border-color: var(--color-accent-blue);
}

.reset-demo-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.demo-info {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.info-text {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  opacity: 0.8;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .controls-container {
    margin: 1rem;
    padding: 1.5rem;
  }
  
  .controls-container h2 {
    font-size: 1.5rem;
  }
  
  .demo-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .start-demo-btn {
    min-width: 250px;
  }
}

/* 性能优化 */
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
  }
}
</style>
