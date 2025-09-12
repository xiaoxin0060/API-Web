<template>
  <!-- 首次访问炫酷欢迎动画 -->
  <div 
    v-if="isFirstVisit" 
    class="ultimate-welcome-splash" 
    :class="{ 
      'splash-active': splashActive,
      'splash-interactive': showInteractive,
      'splash-exiting': isExiting 
    }"
  >
    <!-- 全屏遮罩 + 背景模糊 -->
    <div class="splash-backdrop"></div>
    
    <!-- 主要内容区域 -->
    <div class="splash-content">
      <!-- Logo中心放大进入 + 光晕呼吸 -->
      <div class="splash-logo-container">
        <div class="splash-logo" ref="logoRef">
          <div class="logo-glow-ring"></div>
          <div class="logo-inner">
            <svg class="logo-icon" viewBox="0 0 64 64" width="64" height="64">
              <circle cx="32" cy="32" r="20" fill="none" stroke="currentColor" stroke-width="2" class="logo-circle"/>
              <path d="M20 32l8 8 16-16" fill="none" stroke="currentColor" stroke-width="3" class="logo-check"/>
            </svg>
          </div>
          <div class="logo-particles">
            <div v-for="i in 12" :key="i" :class="`particle-${i}`" class="logo-particle"></div>
          </div>
        </div>
      </div>
      
      <!-- 粒子绽放闭环效果 -->
      <div class="particle-bloom-container">
        <div v-for="i in 8" :key="i" :class="`bloom-particle bloom-${i}`" class="bloom-particle-item"></div>
      </div>
      
      <!-- 数据流粒子注入效果 -->
      <div class="data-stream-container">
        <div v-for="i in 6" :key="i" :class="`stream-${i}`" class="stream-particle"></div>
      </div>
      
      <!-- 引导光轨 -->
      <div class="guidance-light-container">
        <div class="light-path light-path-1"></div>
        <div class="light-path light-path-2"></div>
        <div class="light-path light-path-3"></div>
      </div>
      
      <!-- 品牌文字 -->
      <div class="splash-brand" :class="{ 'brand-hidden': hideBrand }">
        <h1 class="brand-title">小新API平台</h1>
        <p class="brand-subtitle">专业的API接口管理与调试平台</p>
      </div>
      
      <!-- 项目介绍文字序列 -->
      <div class="project-intro">
        <div 
          class="intro-text" 
          :class="{ 
            active: currentIntroIndex === index && showIntroText,
            fadeout: currentIntroIndex > index 
          }"
          v-for="(text, index) in introTexts" 
          :key="index"
          v-show="currentIntroIndex === index"
        >
          {{ text }}
        </div>
      </div>
      
      <!-- 数字跳动展示 -->
      <div class="platform-stats">
        <div class="stat-item">
          <div class="stat-number" ref="apiCountRef">{{ animatedApiCount }}</div>
          <div class="stat-label">API接口</div>
        </div>
        <div class="stat-item">
          <div class="stat-number" ref="userCountRef">{{ animatedUserCount }}</div>
          <div class="stat-label">活跃用户</div>
        </div>
        <div class="stat-item">
          <div class="stat-number" ref="requestCountRef">{{ animatedRequestCount }}</div>
          <div class="stat-label">日请求量</div>
        </div>
      </div>
      
      <!-- 互动体验按钮 -->
      <div class="interactive-section" v-show="showInteractive">
        <div class="interactive-glow"></div>
        <button 
          class="interactive-button"
          @click="startInteractiveSequence"
          :disabled="isInteracting"
        >
          <span class="button-text">{{ isInteracting ? '正在启动...' : '开始探索' }}</span>
          <div class="button-ripple"></div>
          <div class="button-particles">
            <div v-for="i in 4" :key="i" :class="`btn-particle-${i}`" class="btn-particle"></div>
          </div>
        </button>
        
        <div class="hint-text">点击体验炫酷动画效果</div>
      </div>
    </div>
    
    <!-- 过渡遮罩 -->
    <div class="transition-overlay" :class="{ active: isTransitioning }"></div>
  </div>
  
  <!-- 原有简单动画（作为后备） -->
  <div v-else class="welcome-container" :class="[`welcome-${type}`, customClass]">
    <div class="welcome-icon">
      <el-icon><Setting v-if="type === 'login'" /><Loading v-else-if="type === 'loading'" /><Check v-else /></el-icon>
    </div>
    
    <div class="welcome-text">
      {{ displayMessage }}
      <span class="welcome-dots">
        <span class="welcome-dot"></span>
        <span class="welcome-dot"></span>
        <span class="welcome-dot"></span>
      </span>
    </div>
    
    <div class="welcome-subtitle" v-if="displaySubtitle">
      {{ displaySubtitle }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, nextTick, watch, onBeforeUnmount } from 'vue'
import { Setting, Loading, Check } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  type: {
    type: String,
    default: 'loading',
    validator: (value) => ['login', 'loading', 'processing'].includes(value)
  },
  message: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  customClass: {
    type: String,
    default: ''
  },
  // 新增：控制是否显示首次访问动画
  showFirstVisit: {
    type: Boolean,
    default: false
  },
  // 首次访问标记键名
  storageKey: {
    type: String,
    default: 'hasVisitedBefore'
  }
})

const emit = defineEmits(['complete', 'interactive-complete'])
const router = useRouter()

// 动画状态控制
const isFirstVisit = ref(props.showFirstVisit)
const splashActive = ref(false)
const showInteractive = ref(false)
const isExiting = ref(false)
const isInteracting = ref(false)
const isTransitioning = ref(false)

// 数字动画数据
const animatedApiCount = ref(0)
const animatedUserCount = ref(0)
const animatedRequestCount = ref(0)

// 项目介绍文字控制
const introTexts = ref([
  '接口文档管理',
  '在线接口测试', 
  '调用统计分析',
  '权限安全管控'
])
const currentIntroIndex = ref(-1)
const showIntroText = ref(false)
const introTimer = ref(null)

// 品牌文字显示控制
const hideBrand = ref(false)

// DOM 引用
const logoRef = ref(null)
const apiCountRef = ref(null)
const userCountRef = ref(null)
const requestCountRef = ref(null)

// 原有逻辑
const displayMessage = computed(() => {
  if (props.message) return props.message
  
  switch (props.type) {
    case 'login':
      return '欢迎来到小新API平台'
    case 'loading':
      return '正在为您准备数据'
    case 'processing':
      return '正在处理您的请求'
    default:
      return '请稍候'
  }
})

const displaySubtitle = computed(() => {
  if (props.subtitle) return props.subtitle
  
  switch (props.type) {
    case 'login':
      return '专业的API接口管理与调试平台'
    case 'loading':
      return '这不会花费太长时间'
    case 'processing':
      return '请耐心等待处理完成'
    default:
      return ''
  }
})

// 数字动画函数
const animateNumber = (target, duration, callback) => {
  const start = 0
  const startTime = performance.now()
  
  const updateNumber = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // 使用缓动函数
    const easeOutQuart = 1 - Math.pow(1 - progress, 4)
    const currentValue = Math.floor(start + (target - start) * easeOutQuart)
    
    callback(currentValue)
    
    if (progress < 1) {
      requestAnimationFrame(updateNumber)
    }
  }
  
  requestAnimationFrame(updateNumber)
}

// 启动数字动画序列
const startNumberAnimations = () => {
  setTimeout(() => {
    animateNumber(1247, 2000, (value) => {
      animatedApiCount.value = value.toLocaleString()
    })
  }, 1500)
  
  setTimeout(() => {
    animateNumber(8936, 2200, (value) => {
      animatedUserCount.value = value.toLocaleString()
    })
  }, 2000)
  
  setTimeout(() => {
    animateNumber(125463, 2500, (value) => {
      animatedRequestCount.value = value.toLocaleString() + '+'
    })
  }, 2500)
}

// 启动项目介绍文字序列
const startIntroTextSequence = () => {
  // 等待Logo和品牌文字动画完成后开始
  setTimeout(() => {
    // 隐藏品牌文字，为介绍文字让出位置
    hideBrand.value = true
    
    // 等待品牌文字隐藏动画完成后开始介绍文字
    setTimeout(() => {
      showNextIntroText()
    }, 800)
  }, 3000)
}

// 显示下一个介绍文字
const showNextIntroText = () => {
  if (currentIntroIndex.value >= introTexts.value.length - 1) {
    // 所有介绍文字显示完毕，重新显示品牌文字
    setTimeout(() => {
      hideBrand.value = false
    }, 1000)
    return
  }
  
  currentIntroIndex.value++
  showIntroText.value = true
  
  // 显示持续时间：2秒
  setTimeout(() => {
    // 开始淡出
    showIntroText.value = false
    
    // 淡出动画完成后显示下一个文字（间隔0.8秒）
    setTimeout(() => {
      showNextIntroText()
    }, 800)
  }, 2000)
}

// 清理介绍文字定时器
const clearIntroTimer = () => {
  if (introTimer.value) {
    clearTimeout(introTimer.value)
    introTimer.value = null
  }
}

// 互动序列
const startInteractiveSequence = async () => {
  isInteracting.value = true
  
  // 触发更炫酷的动画效果
  triggerEnhancedAnimations()
  
  // 等待动画完成
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  // 开始过渡到登录页
  startTransitionToLogin()
}

// 触发增强动画效果
const triggerEnhancedAnimations = () => {
  // 为logo添加爆炸效果
  if (logoRef.value) {
    logoRef.value.classList.add('logo-explode')
  }
  
  // 触发粒子爆发
  const particles = document.querySelectorAll('.bloom-particle-item')
  particles.forEach((particle, index) => {
    setTimeout(() => {
      particle.classList.add('particle-burst')
    }, index * 100)
  })
  
  // 触发数据流粒子
  const streams = document.querySelectorAll('.stream-particle')
  streams.forEach((stream, index) => {
    setTimeout(() => {
      stream.classList.add('stream-active')
    }, index * 150)
  })
  
  // 触发光轨效果
  const lightPaths = document.querySelectorAll('.light-path')
  lightPaths.forEach((path, index) => {
    setTimeout(() => {
      path.classList.add('light-active')
    }, index * 200 + 500)
  })
}

// 过渡到登录页
const startTransitionToLogin = async () => {
  isTransitioning.value = true
  
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  isExiting.value = true
  emit('interactive-complete')
  
  // 等待退出动画完成
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // 导航到登录页或发出完成事件
  if (router.currentRoute.value.path !== '/login') {
    router.push('/login')
  }
  
  emit('complete')
}

// 初始化动画序列
const initSplashAnimation = async () => {
  await nextTick()
  
  setTimeout(() => {
    splashActive.value = true
  }, 300)
  
  // 启动数字动画
  startNumberAnimations()
  
  // 启动项目介绍文字序列
  startIntroTextSequence()
  
  // 显示互动按钮（在所有介绍文字显示完毕后）
  setTimeout(() => {
    showInteractive.value = true
  }, 16500) // 调整时间以配合文字序列完成：3s + 0.8s + 11.2s + 1s + 0.5s缓冲
}

// 检查是否需要显示首次访问动画
const checkFirstVisit = () => {
  const hasVisited = localStorage.getItem(props.storageKey)
  if (!hasVisited && props.showFirstVisit) {
    isFirstVisit.value = true
    localStorage.setItem(props.storageKey, 'true')
  } else {
    isFirstVisit.value = false
  }
}

// 组件挂载时初始化
onMounted(() => {
  if (props.showFirstVisit) {
    checkFirstVisit()
  }
  
  if (isFirstVisit.value) {
    initSplashAnimation()
  }
})

// 监听首次访问状态变化
watch(() => props.showFirstVisit, (newValue) => {
  if (newValue) {
    checkFirstVisit()
    if (isFirstVisit.value) {
      initSplashAnimation()
    }
  }
})

// 组件销毁前清理定时器
onBeforeUnmount(() => {
  clearIntroTimer()
})
</script>

<style scoped>
/* 动画样式已在 ultimate-animation-core.css 中定义 */
</style>
