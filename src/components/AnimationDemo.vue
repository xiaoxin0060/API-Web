<template>
  <div class="animation-demo-panel" :class="{ 'demo-open': isOpen }">
    <!-- 控制按钮 -->
    <button 
      class="demo-toggle-btn"
      @click="togglePanel"
      :aria-label="isOpen ? '关闭动画演示' : '打开动画演示'"
    >
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
      <span>动画演示</span>
    </button>

    <!-- 演示面板 -->
    <div v-if="isOpen" class="demo-panel">
      <div class="demo-header">
        <h3>🎬 终极动画演示面板</h3>
        <p>演示18个高级动画效果的性能优化和无障碍降级</p>
      </div>

      <!-- 性能控制 -->
      <div class="demo-section">
        <h4>⚡ 性能控制</h4>
        <div class="demo-controls">
          <label class="demo-control">
            <input 
              type="checkbox" 
              v-model="controls.lowPerformance" 
              @change="toggleLowPerformance"
            >
            <span>低性能模式 (GPU ≤ 4核心, RAM ≤ 4GB)</span>
          </label>
          <label class="demo-control">
            <input 
              type="checkbox" 
              v-model="controls.reducedMotion" 
              @change="toggleReducedMotion"
            >
            <span>减少动画模式 (无障碍友好)</span>
          </label>
          <label class="demo-control">
            <input 
              type="checkbox" 
              v-model="controls.batteryMode" 
              @change="toggleBatteryMode"
            >
            <span>节电模式 (省电 &lt; 20%)</span>
          </label>
        </div>
      </div>

      <!-- 动画测试区 -->
      <div class="demo-section">
        <h4>🎭 动画测试区 (18个动画)</h4>
        
        <!-- 基础组件动画 -->
        <div class="demo-category">
          <h5>基础组件动画</h5>
          <div class="demo-test-grid">
            <!-- 1. 渐进式空间浮现 -->
            <div class="test-item">
              <div class="layout-demo">
                <div class="demo-header layout-header">Header</div>
                <div class="demo-sidebar layout-sidebar">Side</div>
                <div class="demo-main layout-main">Main</div>
              </div>
              <button @click="triggerLayoutAnimation">布局浮现</button>
            </div>

            <!-- 2. Logo光晕呼吸 -->
            <div class="test-item">
              <div class="logo-test logo">Logo呼吸</div>
              <button @click="triggerAnimation('logo')">Logo呼吸</button>
            </div>

            <!-- 3. 焦点脉冲引导 -->
            <div class="test-item">
              <div 
                class="data-cell" 
                :class="{ changed: pulseDemo }"
              >
                {{ dataValue }}
              </div>
              <button @click="updateData">数据脉冲</button>
            </div>

            <!-- 4. 表格行悬停微光 -->
            <div class="test-item">
              <div class="table-row demo-row">悬停看微光</div>
              <small>鼠标悬停测试</small>
            </div>

            <!-- 5. 按钮点击微缩光晕 -->
            <div class="test-item">
              <button class="btn-primary performant-animation">按钮光晕</button>
              <small>点击看效果</small>
            </div>

            <!-- 6. 输入框错误抖动 -->
            <div class="test-item">
              <input 
                class="input test-input" 
                :class="{ invalid: errorDemo }"
                placeholder="输入框抖动"
                v-model="testInput"
              >
              <button @click="triggerError">触发错误</button>
            </div>
          </div>
        </div>

        <!-- 状态反馈动画 -->
        <div class="demo-category">
          <h5>状态反馈动画</h5>
          <div class="demo-test-grid">
            <!-- 7. 徽章计数增长 -->
            <div class="test-item">
              <div 
                class="badge-demo badge-updated" 
                :class="{ 'badge-updated': badgeDemo }"
              >
                {{ badgeCount }}
              </div>
              <button @click="updateBadge">徽章增长</button>
            </div>

            <!-- 8. 加载状态旋转呼吸 -->
            <div class="test-item">
              <div 
                class="loader-spinner demo-spinner"
                :class="{ active: spinnerDemo }"
              ></div>
              <button @click="toggleSpinner">加载状态</button>
            </div>

            <!-- 9. 导航项悬停上升 -->
            <div class="test-item">
              <div class="nav-item demo-nav">导航项</div>
              <small>鼠标悬停测试</small>
            </div>

            <!-- 10. 面包屑路径淡入 -->
            <div class="test-item">
              <div class="breadcrumb" :class="{ loaded: breadcrumbDemo }">
                <span class="breadcrumb-item level-1">首页</span>
                <span class="breadcrumb-item level-2">列表</span>
                <span class="breadcrumb-item level-3">详情</span>
              </div>
              <button @click="triggerBreadcrumb">面包屑</button>
            </div>

            <!-- 11. 下拉菜单滑入 -->
            <div class="test-item">
              <div class="dropdown-demo">
                <button @click="toggleDropdown">下拉菜单</button>
                <div class="dropdown-menu" :class="{ open: dropdownDemo }">
                  <div>菜单项1</div>
                  <div>菜单项2</div>
                </div>
              </div>
            </div>

            <!-- 12. 搜索框智能扩展 -->
            <div class="test-item">
              <input 
                class="search-input demo-search"
                placeholder="搜索框扩展"
                @focus="onSearchFocus"
              >
              <small>聚焦看扩展</small>
            </div>
          </div>
        </div>

        <!-- 加载与占位动画 -->
        <div class="demo-category">
          <h5>加载与占位动画</h5>
          <div class="demo-test-grid">
            <!-- 13. 输入框聚焦边框呼吸 -->
            <div class="test-item">
              <input 
                class="input demo-focus"
                placeholder="聚焦边框呼吸"
              >
              <small>聚焦看呼吸</small>
            </div>

            <!-- 14. 骨架屏波浪填充 -->
            <div class="test-item">
              <div v-if="showSkeleton" class="skeleton skeleton-text"></div>
              <div v-else>加载完成的内容</div>
              <button @click="toggleSkeleton">骨架屏</button>
            </div>

            <!-- 15. API重载旋转刷新 -->
            <div class="test-item">
              <button 
                class="reload-button" 
                :class="{ loading: reloadDemo }"
                @click="triggerReload"
              >
                <span class="icon">🔄</span>
                重载测试
              </button>
            </div>

            <!-- 16. 模态框中心放大 -->
            <div class="test-item">
              <button @click="toggleModal">模态框</button>
              <div v-if="modalDemo" class="modal open">
                <div class="modal-backdrop"></div>
                <div class="modal-container">
                  <p>模态框内容</p>
                  <button @click="toggleModal">关闭</button>
                </div>
              </div>
            </div>

            <!-- 17. 粒子绽放效果 -->
            <div class="test-item">
              <div 
                class="success-bloom demo-bloom"
                :class="{ active: bloomDemo }"
                @click="triggerBloom"
              >
                点击绽放
              </div>
            </div>

            <!-- 18. 性能优化守则演示 -->
            <div class="test-item">
              <div class="performance-demo">
                <div class="performant-animation">GPU加速</div>
              </div>
              <small>GPU优化演示</small>
            </div>
          </div>
        </div>

        <!-- 侧边栏与导航动画 -->
        <div class="demo-category">
          <h5>侧边栏与导航动画</h5>
          <div class="demo-test-grid">
            <!-- 31. 侧边栏菜单项磁吸悬停 -->
            <div class="test-item">
              <div 
                class="menu-item demo-menu-item"
                @mouseenter="triggerMenuHover"
              >
                <div class="menu-item__icon">📄</div>
                <span class="menu-item__text">磁吸菜单</span>
              </div>
              <small>悬停体验磁吸效果</small>
            </div>

            <!-- 35. 管理员菜单分组 -->
            <div class="test-item">
              <div class="menu-group demo-menu-group">
                <div class="menu-group__title" @click="toggleAdminMenu">
                  <div class="menu-group__icon">⚙️</div>
                  <span>管理后台</span>
                </div>
                <div v-if="adminMenuDemo" class="menu-item menu-item--sub">
                  <div class="menu-item__icon">👥</div>
                  <span class="menu-item__text">用户管理</span>
                </div>
              </div>
              <small>点击展开子菜单</small>
            </div>
          </div>
        </div>

        <!-- 表单与输入动画 -->
        <div class="demo-category">
          <h5>表单与输入动画</h5>
          <div class="demo-test-grid">
            <!-- 48. 多选下拉选项浮现 -->
            <div class="test-item">
              <div class="dropdown-demo" @click="toggleDropdown">
                <div class="dropdown-trigger">选择选项 ▼</div>
                <div v-if="dropdownDemo" class="el-select-dropdown">
                  <div class="el-select-dropdown__item">选项一</div>
                  <div class="el-select-dropdown__item">选项二</div>
                  <div class="el-select-dropdown__item">选项三</div>
                  <div class="el-select-dropdown__item">选项四</div>
                </div>
              </div>
              <small>点击看选项淡入</small>
            </div>

            <!-- 50. 文件上传拖拽高亮 -->
            <div class="test-item">
              <div 
                class="upload-drop-zone demo-upload"
                :class="{ 'drag-over': uploadDemo }"
                @click="triggerUpload"
                @dragover.prevent="uploadDemo = true"
                @dragleave="uploadDemo = false"
              >
                📁 拖拽文件到此处
              </div>
              <small>点击或拖拽测试</small>
            </div>

            <!-- 52. 自动完成选项滑入 -->
            <div class="test-item">
              <div class="autocomplete-demo">
                <input 
                  class="demo-autocomplete-input"
                  placeholder="自动完成测试"
                  @focus="showAutocomplete = true"
                  @blur="hideAutocomplete"
                  v-model="autocompleteValue"
                >
                <div v-if="showAutocomplete" class="autocomplete-dropdown">
                  <div class="autocomplete-option">建议选项一</div>
                  <div class="autocomplete-option">建议选项二</div>
                  <div class="autocomplete-option">建议选项三</div>
                </div>
              </div>
              <small>聚焦输入框看建议</small>
            </div>
          </div>
        </div>

        <!-- 表格与数据动画 -->
        <div class="demo-category">
          <h5>表格与数据动画</h5>
          <div class="demo-test-grid">
            <!-- 20. 分页器按钮脉冲 -->
            <div class="test-item">
              <div class="pagination-demo">
                <div class="el-pagination">
                  <button class="btn-prev" @click="paginationDemo">←</button>
                  <ul class="el-pager">
                    <li :class="{ 'is-active': currentPage === 1 }" @click="setCurrentPage(1)">1</li>
                    <li :class="{ 'is-active': currentPage === 2 }" @click="setCurrentPage(2)">2</li>
                    <li :class="{ 'is-active': currentPage === 3 }" @click="setCurrentPage(3)">3</li>
                  </ul>
                  <button class="btn-next" @click="paginationDemo">→</button>
                </div>
              </div>
              <small>点击分页按钮看脉冲</small>
            </div>

            <!-- 71. 表格行懒加载顺序浮现 -->
            <div class="test-item">
              <button @click="triggerTableLoad">重载表格行</button>
              <div class="demo-table" v-if="tableLoadDemo">
                <div class="table-row demo-table-row">行1：用户数据</div>
                <div class="table-row demo-table-row">行2：接口信息</div>
                <div class="table-row demo-table-row">行3：系统配置</div>
              </div>
              <small>表格行顺序浮现</small>
            </div>

            <!-- 76. 数据流粒子注入 -->
            <div class="test-item">
              <button @click="triggerDataInject">注入新数据</button>
              <div class="data-stream-demo">
                <div 
                  v-for="item in streamData" 
                  :key="item.id" 
                  class="stream-item"
                  :class="{ 'data-stream-item new': item.isNew }"
                >
                  {{ item.text }}
                </div>
              </div>
              <small>数据注入带粒子效果</small>
            </div>
          </div>
        </div>
      </div>

      <!-- 性能信息显示 -->
      <div class="demo-section">
        <h4>📊 设备性能信息</h4>
        <div class="performance-info">
          <div class="info-item">
            <span>设备内存:</span>
            <span>{{ performanceInfo.deviceMemory || 'Unknown' }} GB</span>
          </div>
          <div class="info-item">
            <span>CPU核心数:</span>
            <span>{{ performanceInfo.hardwareConcurrency || 'Unknown' }}</span>
          </div>
          <div class="info-item">
            <span>连接类型:</span>
            <span>{{ performanceInfo.connectionEffectiveType || 'Unknown' }}</span>
          </div>
          <div class="info-item">
            <span>当前模式:</span>
            <span 
              :class="{
                'mode-low': performanceInfo.isLowPerformance,
                'mode-normal': !performanceInfo.isLowPerformance
              }"
            >
              {{ performanceInfo.isLowPerformance ? '低性能模式' : '标准模式' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Lighthouse评分目标 -->
      <div class="demo-section">
        <h4>🏆 目标评分</h4>
        <div class="score-targets">
          <div class="score-item">
            <span class="score-label">性能 (Performance):</span>
            <span class="score-value">≥ 95</span>
          </div>
          <div class="score-item">
            <span class="score-label">无障碍 (Accessibility):</span>
            <span class="score-value">≥ 90</span>
          </div>
          <div class="score-item">
            <span class="score-label">动画数量:</span>
            <span class="score-value">18个精选</span>
          </div>
        </div>
      </div>

      <!-- 关闭按钮 -->
      <button class="demo-close" @click="closePanel">✖</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { performanceDetector, hasReducedMotionPreference, onReducedMotionChange } from '@/utils/performanceDetector'

// 面板状态
const isOpen = ref(false)

// 控制状态
const controls = reactive({
  lowPerformance: false,
  reducedMotion: false,
  batteryMode: false
})

// 测试状态
const errorDemo = ref(false)
const pulseDemo = ref(false)
const showSkeleton = ref(true)
const reloadDemo = ref(false)
const testInput = ref('')
const dataValue = ref(42)

// 新增测试状态
const badgeDemo = ref(false)
const badgeCount = ref(3)
const spinnerDemo = ref(false)
const breadcrumbDemo = ref(false)
const dropdownDemo = ref(false)
const modalDemo = ref(false)
const bloomDemo = ref(false)

// 侧边栏与导航测试状态
const adminMenuDemo = ref(false)

// 表单与输入测试状态
const uploadDemo = ref(false)
const showAutocomplete = ref(false)
const autocompleteValue = ref('')

// 表格与数据测试状态
const currentPage = ref(1)
const tableLoadDemo = ref(false)
const streamData = ref([
  { id: 1, text: '原有数据项 1', isNew: false },
  { id: 2, text: '原有数据项 2', isNew: false },
])

// 性能信息
const performanceInfo = reactive(performanceDetector.getPerformanceInfo())

// 清理函数
let cleanupReducedMotion: (() => void) | null = null

onMounted(() => {
  // 初始化减少动画偏好
  controls.reducedMotion = hasReducedMotionPreference()
  
  // 监听减少动画偏好变化
  cleanupReducedMotion = onReducedMotionChange((prefersReduced) => {
    controls.reducedMotion = prefersReduced
    if (prefersReduced) {
      document.documentElement.classList.add('demo-reduced-motion')
    } else {
      document.documentElement.classList.remove('demo-reduced-motion')
    }
  })

  // 更新性能信息
  updatePerformanceInfo()
})

onUnmounted(() => {
  cleanupReducedMotion?.()
})

function togglePanel() {
  isOpen.value = !isOpen.value
}

function closePanel() {
  isOpen.value = false
}

function toggleLowPerformance() {
  if (controls.lowPerformance) {
    performanceDetector.forceLowPerformanceMode()
  } else {
    performanceDetector.removeLowPerformanceMode()
  }
  updatePerformanceInfo()
}

function toggleReducedMotion() {
  if (controls.reducedMotion) {
    document.documentElement.classList.add('demo-reduced-motion')
  } else {
    document.documentElement.classList.remove('demo-reduced-motion')
  }
}

function toggleBatteryMode() {
  if (controls.batteryMode) {
    document.documentElement.classList.add('demo-battery-saving')
  } else {
    document.documentElement.classList.remove('demo-battery-saving')
  }
}

function triggerAnimation(type: string) {
  const element = document.querySelector(`.${type}-test`)
  if (element) {
    element.classList.remove('anim-trigger-glow')
    void (element as HTMLElement).offsetWidth // 强制重排
    element.classList.add('anim-trigger-glow')
  }
}

function triggerError() {
  errorDemo.value = true
  setTimeout(() => {
    errorDemo.value = false
  }, 500)
}

function updateData() {
  dataValue.value = Math.floor(Math.random() * 100)
  pulseDemo.value = true
  setTimeout(() => {
    pulseDemo.value = false
  }, 1200)
}

function toggleSkeleton() {
  showSkeleton.value = !showSkeleton.value
}

function triggerReload() {
  reloadDemo.value = true
  setTimeout(() => {
    reloadDemo.value = false
  }, 2000)
}

function updatePerformanceInfo() {
  const info = performanceDetector.getPerformanceInfo()
  Object.assign(performanceInfo, info)
}

// 新增测试方法
function triggerLayoutAnimation() {
  // 重新触发布局动画
  const elements = ['.demo-header', '.demo-sidebar', '.demo-main']
  elements.forEach((selector, index) => {
    const element = document.querySelector(selector)
    if (element) {
      element.classList.remove('layout-header', 'layout-sidebar', 'layout-main')
      void (element as HTMLElement).offsetWidth
      setTimeout(() => {
        if (selector.includes('header')) element.classList.add('layout-header')
        if (selector.includes('sidebar')) element.classList.add('layout-sidebar')
        if (selector.includes('main')) element.classList.add('layout-main')
      }, index * 50)
    }
  })
}

function updateBadge() {
  badgeCount.value = Math.floor(Math.random() * 99) + 1
  badgeDemo.value = true
  setTimeout(() => {
    badgeDemo.value = false
  }, 600)
}

function toggleSpinner() {
  spinnerDemo.value = !spinnerDemo.value
  setTimeout(() => {
    spinnerDemo.value = false
  }, 3000)
}

function triggerBreadcrumb() {
  breadcrumbDemo.value = false
  setTimeout(() => {
    breadcrumbDemo.value = true
  }, 100)
}

function toggleDropdown() {
  dropdownDemo.value = !dropdownDemo.value
}

function toggleModal() {
  modalDemo.value = !modalDemo.value
}

function triggerBloom() {
  bloomDemo.value = true
  setTimeout(() => {
    bloomDemo.value = false
  }, 1600)
}

function onSearchFocus() {
  // 搜索框聚焦效果已通过CSS实现
}

// 侧边栏与导航方法
function triggerMenuHover() {
  // 菜单悬停效果已通过CSS实现
}

function toggleAdminMenu() {
  adminMenuDemo.value = !adminMenuDemo.value
}

// 表单与输入方法
function triggerUpload() {
  uploadDemo.value = true
  setTimeout(() => {
    uploadDemo.value = false
  }, 2000)
}

function hideAutocomplete() {
  setTimeout(() => {
    showAutocomplete.value = false
  }, 200) // 延迟隐藏，防止点击建议项时立即消失
}

// 表格与数据方法
function paginationDemo() {
  // 分页按钮点击效果已通过CSS实现
}

function setCurrentPage(page: number) {
  currentPage.value = page
}

function triggerTableLoad() {
  tableLoadDemo.value = false
  setTimeout(() => {
    tableLoadDemo.value = true
  }, 100)
}

function triggerDataInject() {
  const newItem = {
    id: Date.now(),
    text: `新注入数据 ${Date.now() % 1000}`,
    isNew: true
  }
  
  streamData.value.push(newItem)
  
  // 2秒后移除新数据标记
  setTimeout(() => {
    const item = streamData.value.find((i: any) => i.id === newItem.id)
    if (item) {
      item.isNew = false
    }
  }, 2000)
}
</script>

<style scoped>
.animation-demo-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 10000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}

.demo-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--color-accent-blue);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
  transition: all 0.2s ease;
}

.demo-toggle-btn:hover {
  background: #4f8fff;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(96, 165, 250, 0.4);
}

.demo-panel {
  position: absolute;
  bottom: 60px;
  right: 0;
  width: 400px;
  max-height: 600px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  overflow-y: auto;
  backdrop-filter: blur(20px);
  animation: panelSlideIn 0.3s var(--anim-ease-spring);
}

@keyframes panelSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.demo-header {
  padding: 20px;
  border-bottom: 1px solid var(--color-border);
  text-align: center;
}

.demo-header h3 {
  margin: 0 0 8px 0;
  color: var(--color-text-primary);
  font-size: 18px;
}

.demo-header p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.demo-section {
  padding: 20px;
  border-bottom: 1px solid var(--color-border);
}

.demo-section:last-child {
  border-bottom: none;
}

.demo-section h4 {
  margin: 0 0 16px 0;
  color: var(--color-text-primary);
  font-size: 16px;
}

.demo-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.demo-control {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-primary);
  font-size: 14px;
  cursor: pointer;
}

.demo-control input {
  margin: 0;
}

.demo-test-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.demo-category {
  margin-bottom: 20px;
}

.demo-category h5 {
  margin: 0 0 12px 0;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 600;
}

.test-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--color-bg-tertiary);
  border-radius: 8px;
}

.test-item button {
  padding: 6px 12px;
  background: var(--color-button-secondary);
  color: var(--color-button-secondary-text);
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.test-item button:hover {
  background: var(--color-button-secondary-hover);
}

.logo-test {
  padding: 8px 16px;
  background: var(--color-bg-primary);
  border-radius: 6px;
  font-size: 12px;
  font-weight: bold;
  color: var(--color-accent-blue);
  position: relative;
  overflow: visible; /* 让光环效果可见 */
}

.test-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 12px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.data-cell {
  padding: 8px 16px;
  background: var(--color-bg-primary);
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  color: var(--color-text-primary);
  min-width: 60px;
  text-align: center;
}

.skeleton-text {
  height: 20px;
  width: 120px;
  border-radius: 4px;
}

/* 新增演示组件样式 */
.layout-demo {
  display: grid;
  grid-template-areas: 
    "header header"
    "sidebar main";
  grid-template-columns: 60px 100px;
  grid-template-rows: 20px 30px;
  gap: 2px;
  width: 160px;
  font-size: 10px;
}

.demo-header {
  grid-area: header;
  background: var(--color-accent-blue);
  color: white;
  text-align: center;
  border-radius: 2px;
}

.demo-sidebar {
  grid-area: sidebar;
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  text-align: center;
  border-radius: 2px;
}

.demo-main {
  grid-area: main;
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  text-align: center;
  border-radius: 2px;
}

.badge-demo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  background: var(--color-accent-blue);
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  padding: 0 8px;
}

.demo-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-border);
  border-top: 2px solid var(--color-accent-blue);
  border-radius: 50%;
}

.demo-spinner.active {
  animation: spinBreathe 1.2s ease-in-out infinite;
}

.demo-row {
  padding: 8px 16px;
  background: var(--color-bg-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.demo-nav {
  padding: 8px 16px;
  background: var(--color-bg-tertiary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-demo {
  position: relative;
}

.dropdown-demo .dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 4px 0;
  min-width: 120px;
  z-index: 100;
}

.dropdown-demo .dropdown-menu div {
  padding: 4px 12px;
  font-size: 12px;
  color: var(--color-text-primary);
}

.dropdown-demo .dropdown-menu div:hover {
  background: var(--color-row-hover);
}

.demo-search {
  width: 100px;
  transition: all 0.3s ease;
}

.demo-search:focus {
  width: 140px;
}

.demo-focus {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 12px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  /* 移除transition，让增强的呼吸动画生效 */
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10000;
  display: none;
}

.modal.open {
  display: block;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.modal-container {
  position: absolute;
  top: 50%;
  left: 50%;
  background: var(--color-bg-secondary);
  border-radius: 8px;
  padding: 20px;
  min-width: 200px;
  text-align: center;
}

.demo-bloom {
  position: relative;
  width: 100px;
  height: 40px;
  background: var(--color-success);
  color: white;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  overflow: hidden;
}

.demo-bloom.active::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: bloomParticle 1s ease-out forwards;
}

@keyframes bloomParticle {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
  30% { opacity: 0.8; transform: translate(-50%, -50%) scale(3); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(5) translateY(-30px); }
}

.performance-demo {
  padding: 8px 12px;
  background: linear-gradient(45deg, var(--color-accent-blue), var(--color-accent-purple));
  color: white;
  border-radius: 6px;
  font-size: 10px;
  font-weight: bold;
  text-align: center;
}

.performance-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.mode-low {
  color: var(--color-warning);
  font-weight: bold;
}

.mode-normal {
  color: var(--color-success);
  font-weight: bold;
}

.score-targets {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.score-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.score-value {
  font-weight: bold;
  color: var(--color-success);
}

.demo-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.demo-close:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

/* 新增演示项目样式 */

/* 侧边栏与导航演示样式 */
.demo-menu-item {
  padding: 8px 12px;
  background: var(--color-bg-primary);
  border-radius: 6px;
  border-left: 3px solid transparent;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.demo-menu-item .menu-item__icon {
  width: 16px;
  height: 16px;
  font-size: 14px;
}

.demo-menu-item .menu-item__text {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.demo-menu-group {
  background: var(--color-bg-primary);
  border-radius: 6px;
  padding: 8px;
}

.demo-menu-group .menu-group__title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  margin-bottom: 4px;
}

.demo-menu-group .menu-group__icon {
  font-size: 12px;
}

/* 表单与输入演示样式 */
.dropdown-demo {
  position: relative;
  width: 100%;
}

.dropdown-trigger {
  padding: 6px 8px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  text-align: left;
}

.dropdown-trigger:hover {
  border-color: var(--color-accent-blue);
}

.el-select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 4px;
}

.el-select-dropdown__item {
  padding: 6px 8px;
  font-size: 12px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.el-select-dropdown__item:hover {
  background: var(--color-row-hover);
  color: var(--color-accent-blue);
}

.demo-upload {
  padding: 20px;
  text-align: center;
  border-radius: 8px;
  font-size: 12px;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.autocomplete-demo {
  position: relative;
  width: 100%;
}

.demo-autocomplete-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 12px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  outline: none;
}

.demo-autocomplete-input:focus {
  border-color: var(--color-accent-blue);
}

.autocomplete-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 2px;
}

.autocomplete-option {
  padding: 6px 8px;
  font-size: 12px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.autocomplete-option:hover {
  background: var(--color-row-hover);
  color: var(--color-accent-blue);
}

/* 表格与数据演示样式 */
.pagination-demo {
  width: 100%;
  display: flex;
  justify-content: center;
}

.pagination-demo .el-pagination {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-demo .btn-prev,
.pagination-demo .btn-next {
  width: 24px;
  height: 24px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-demo .btn-prev:hover,
.pagination-demo .btn-next:hover {
  border-color: var(--color-accent-blue);
  color: var(--color-accent-blue);
}

.pagination-demo .el-pager {
  display: flex;
  gap: 2px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.pagination-demo .el-pager li {
  width: 24px;
  height: 24px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.pagination-demo .el-pager li:hover {
  border-color: var(--color-accent-blue);
  color: var(--color-accent-blue);
}

.pagination-demo .el-pager li.is-active {
  background: var(--color-accent-blue);
  color: white;
  border-color: var(--color-accent-blue);
}

.demo-table {
  margin-top: 8px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.demo-table-row {
  padding: 8px 12px;
  background: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border);
  font-size: 12px;
  opacity: 0;
  transform: translateY(20px);
  animation: tableRowFadeIn 0.4s var(--anim-ease-spring) forwards;
}

.demo-table-row:nth-child(1) { animation-delay: 0.1s; }
.demo-table-row:nth-child(2) { animation-delay: 0.2s; }
.demo-table-row:nth-child(3) { animation-delay: 0.3s; }

.demo-table-row:last-child {
  border-bottom: none;
}

.data-stream-demo {
  margin-top: 8px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  max-height: 120px;
  overflow-y: auto;
}

.stream-item {
  padding: 6px 12px;
  border-bottom: 1px solid var(--color-border);
  font-size: 12px;
  color: var(--color-text-secondary);
}

.stream-item:last-child {
  border-bottom: none;
}

.stream-item.data-stream-item.new {
  position: relative;
  background-color: rgba(96, 165, 250, 0.1);
  animation: fadeInItem 0.5s var(--anim-ease-out) forwards;
}

.stream-item.data-stream-item.new::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  width: 2px;
  height: 2px;
  background: var(--particle-color);
  border-radius: 50%;
  opacity: 0;
  animation: injectParticle 0.8s ease-out forwards;
  animation-delay: 0.1s;
}

/* 演示模式样式覆盖 */
.demo-reduced-motion * {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}

.demo-battery-saving .fancy-animation,
.demo-battery-saving .logo,
.demo-battery-saving .skeleton {
  animation: none !important;
  transition: none !important;
}

/* 响应式 */
@media (max-width: 768px) {
  .demo-panel {
    width: 320px;
    max-height: 500px;
  }
  
  .demo-test-grid {
    grid-template-columns: 1fr;
  }
}

/* 滚动条样式 */
.demo-panel::-webkit-scrollbar {
  width: 4px;
}

.demo-panel::-webkit-scrollbar-track {
  background: transparent;
}

.demo-panel::-webkit-scrollbar-thumb {
  background: var(--color-border-strong);
  border-radius: 2px;
}
</style>
