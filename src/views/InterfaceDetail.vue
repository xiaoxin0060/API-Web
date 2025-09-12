<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getInterface, invokeInterfaceRaw } from '@/api/interfaces'
import { useAuthStore } from '@/stores/auth'
import { cancelRequest } from '@/api/client'
import { pageUserInterfaceInfo } from '@/api/userInterfaceInfo'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const id = ref(Number(route.params.id))
const info = ref(null)
const loading = ref(false)
const invokeLoading = ref(false)
const paramsText = ref('{}')
const requestIdRef = ref(null)
const result = ref('')
const meta = ref({ status: null, durationMs: null })
const respHeaders = ref(null)
const activeTab = ref('test')
const leftQuota = ref(null)

const isAdmin = computed(() => auth.user?.userRole === 'admin')

// 最近 5 次参数本地记忆
const historyList = ref([])
function loadHistory() {
  try {
    const key = `iface_params_${id.value}`
    const arr = JSON.parse(localStorage.getItem(key) || '[]')
    if (Array.isArray(arr)) historyList.value = arr.slice(0, 5)
  } catch { historyList.value = [] }
}
function saveHistory(payload) {
  try {
    const key = `iface_params_${id.value}`
    const text = JSON.stringify(payload)
    const set = new Set([text, ...historyList.value])
    const arr = Array.from(set).slice(0, 5)
    historyList.value = arr
    localStorage.setItem(key, JSON.stringify(arr))
  } catch {}
}
function applyHistory(text) {
  try {
    paramsText.value = JSON.stringify(JSON.parse(text), null, 2)
  } catch {
    paramsText.value = text
  }
}

const methodTypeMap = {
  'GET': 'success',
  'POST': 'primary', 
  'PUT': 'warning',
  'DELETE': 'danger'
}

async function fetchDetail() {
  loading.value = true
  try {
    const resp = await getInterface(id.value)
    if (resp?.code === 0) {
      info.value = resp.data
      // 预填充示例请求
      if (resp.data?.exampleRequest) {
        try {
          paramsText.value = JSON.stringify(JSON.parse(resp.data.exampleRequest), null, 2)
        } catch {
          paramsText.value = resp.data.exampleRequest
        }
      }
      try {
        const params = { interfaceInfoId: id.value, current: 1, pageSize: 1 }
        if (auth.user && auth.user.id) Object.assign(params, { userId: auth.user.id })
        const quotaResp = await pageUserInterfaceInfo(params)
        if (quotaResp?.code === 0) {
          leftQuota.value = quotaResp.data.records?.[0]?.leftNum ?? null
        }
      } catch {}
    } else {
      ElMessage.error(resp?.message || '加载失败')
    }
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e.message)
  } finally {
    loading.value = false
  }
}

async function onInvoke() {
  if (!info.value) return
  
  invokeLoading.value = true
  result.value = ''
  try {
    let parsed = {}
    if (paramsText.value?.trim()) {
      parsed = JSON.parse(paramsText.value)
    }
    const rid = `invoke_${id.value}_${Date.now()}`
    requestIdRef.value = rid
    const resp = await invokeInterfaceRaw(id.value, parsed, { requestId: rid })
    const data = resp?.data?.data ?? resp?.data
    meta.value = { status: resp.status, durationMs: resp.durationMs }
    respHeaders.value = resp.headers
    result.value = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
    // 保存历史
    saveHistory(parsed)
    ElMessage.success('调用成功')
  } catch (e) {
    result.value = ''
    if (e.name === 'SyntaxError') {
      ElMessage.error('请求参数格式错误，请检查JSON格式')
    } else {
      ElMessage.error(e?.response?.data?.message || e.message || '调用失败')
    }
  } finally {
    invokeLoading.value = false
    requestIdRef.value = null
  }
}

function formatJson() {
  try {
    const parsed = JSON.parse(paramsText.value)
    paramsText.value = JSON.stringify(parsed, null, 2)
    ElMessage.success('格式化成功')
  } catch {
    ElMessage.error('JSON格式错误')
  }
}

function cancelInvoke() {
  if (requestIdRef.value) {
    cancelRequest(requestIdRef.value)
    invokeLoading.value = false
    ElMessage.info('已取消调用')
  }
}

async function copyResult() {
  try {
    await navigator.clipboard.writeText(result.value || '')
    ElMessage.success('已复制响应结果')
  } catch {
    ElMessage.error('复制失败')
  }
}

async function copyCurl() {
  try {
    const url = '/api/interfaceInfo/invoke'
    const body = hasValidSchema.value ? formModel.value : (paramsText.value || '{}')
    const payload = JSON.stringify({ id: id.value, userRequestParams: typeof body === 'string' ? JSON.parse(body) : body })
    const curl = `curl -X POST '${url}' -H 'Content-Type: application/json' --data '${payload.replace(/'/g, "'\''")}'`
    await navigator.clipboard.writeText(curl)
    ElMessage.success('已复制 cURL')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

function goEdit() {
  router.push(`/interfaces/${id.value}/edit`)
}

watch(() => route.params.id, (v) => { id.value = Number(v); fetchDetail() })
onMounted(() => {
  fetchDetail()
  // 检查是否有hash跳转到测试区域
  if (window.location.hash === '#test') {
    activeTab.value = 'test'
  }
  loadHistory()
})
</script>

<template>
  <div class="interface-detail" v-loading="loading">
    <div v-if="info" class="detail-container">
      <!-- 接口头部信息 -->
      <el-card class="header-card" shadow="never">
        <div class="interface-header">
          <div class="header-left">
            <div class="interface-title">
              <el-tag 
                :type="methodTypeMap[info.method] || 'info'" 
                size="large"
                class="method-tag"
              >
                {{ info.method }}
              </el-tag>
              <h1>{{ info.name }}</h1>
            </div>
            <p class="interface-desc">{{ info.description || '暂无描述' }}</p>
            <div class="interface-url">
              <el-icon><Link /></el-icon>
              <code>{{ info.url || '暂无接口地址' }}</code>
            </div>
          </div>
          <div class="header-right" v-if="isAdmin">
            <el-button type="primary" @click="goEdit">
              <el-icon><Edit /></el-icon>
              编辑接口
            </el-button>
          </div>
        </div>
        
        <!-- 接口状态和基本信息 -->
        <el-divider />
        <div class="interface-meta">
          <div class="meta-item">
            <span class="meta-label">状态：</span>
            <el-tag :type="info.status === 1 ? 'success' : 'danger'">
              {{ info.status === 1 ? '在线' : '下线' }}
            </el-tag>
          </div>
          <div class="meta-item" v-if="info.category">
            <span class="meta-label">分类：</span>
            <el-tag type="info">{{ info.category }}</el-tag>
          </div>
          <div class="meta-item" v-if="info.version">
            <span class="meta-label">版本：</span>
            <el-text>{{ info.version }}</el-text>
          </div>
          <div class="meta-item" v-if="info.price">
            <span class="meta-label">价格：</span>
            <el-text type="warning">{{ info.price }} 元/次</el-text>
          </div>
        </div>
      </el-card>

      <!-- 主要内容区域 -->
      <div class="content-area">
        <!-- 左侧测试 -->
        <div class="left-panel">
          <el-card shadow="never">
            <template #header>
              <div class="card-header">
                <el-icon><Monitor /></el-icon>
                <span>在线测试</span>
              </div>
            </template>
            
            <div class="test-content">
              <!-- 请求参数输入 -->
              <div class="param-section">
                <div class="section-header">
                  <h4>请求参数</h4>
                  <div class="actions">
                    <el-select v-if="historyList.length" placeholder="历史参数" size="small" style="width: 200px" @change="applyHistory">
                      <el-option v-for="(h,idx) in historyList" :key="idx" :label="`历史 #${idx+1}`" :value="h" />
                    </el-select>
                    <el-button size="small" @click="formatJson">
                      <el-icon><Setting /></el-icon>
                      格式化
                    </el-button>
                  </div>
                </div>
                <el-input
                  v-model="paramsText"
                  type="textarea"
                  :rows="12"
                  placeholder="请输入JSON格式的请求参数"
                  class="param-input"
                />
              </div>
              
              <!-- 发送按钮 -->
              <div class="send-section">
                <div class="send-actions">
                  <el-button 
                    type="primary" 
                    size="large"
                    :disabled="info.status !== 1 || (leftQuota !== null && leftQuota <= 0)"
                    :loading="invokeLoading"
                    @click="onInvoke"
                  >
                    <el-icon><Position /></el-icon>
                    {{ invokeLoading ? '发送中...' : '发送请求' }}
                  </el-button>
                  <el-button 
                    v-if="invokeLoading"
                    type="warning" 
                    size="large"
                    @click="cancelInvoke"
                  >
                    取消
                  </el-button>
                </div>
                <el-text type="info" v-if="info.status !== 1">接口已下线，无法调用</el-text>
                <el-text type="warning" v-else-if="leftQuota !== null && leftQuota <= 0">剩余额度为 0，请联系管理员增配</el-text>
              </div>
              
              <!-- 响应结果 -->
              <div class="response-section" v-if="result || meta.status">
                <h4>响应结果</h4>
                <div class="meta-bar">
                  <el-tag size="small" type="info">状态：{{ meta.status ?? '-' }}</el-tag>
                  <el-tag size="small" type="success">耗时：{{ meta.durationMs ?? '-' }}ms</el-tag>
                  <el-button size="small" @click="copyResult">复制结果</el-button>
                  <el-button size="small" @click="copyCurl">复制 cURL</el-button>
                </div>
                <div class="response-container">
                  <pre class="response-body">{{ result }}</pre>
                </div>
                <div class="headers" v-if="respHeaders">
                  <h5>响应头</h5>
                  <pre class="code-block">{{ JSON.stringify(respHeaders, null, 2) }}</pre>
                </div>
              </div>
            </div>
          </el-card>
        </div>
        
        <!-- 右侧文档 -->
        <div class="right-panel">
          <el-card shadow="never">
            <template #header>
              <div class="card-header">
                <el-icon><Document /></el-icon>
                <span>接口文档</span>
              </div>
            </template>
            
            <el-tabs v-model="activeTab">
              <el-tab-pane label="文档" name="doc">
                <div class="doc-content">
                  <!-- 基本信息 -->
                  <div class="doc-section">
                    <h3>接口信息</h3>
                    <el-descriptions :column="1" border>
                      <el-descriptions-item label="接口名称">{{ info.name }}</el-descriptions-item>
                      <el-descriptions-item label="请求方法">
                        <el-tag :type="methodTypeMap[info.method]">{{ info.method }}</el-tag>
                      </el-descriptions-item>
                      <el-descriptions-item label="接口地址">
                        <code>{{ info.url || '暂无接口地址' }}</code>
                      </el-descriptions-item>
                      <el-descriptions-item label="接口描述">
                        {{ info.description || '暂无描述' }}
                      </el-descriptions-item>
                    </el-descriptions>
                  </div>
                  
                  <!-- 请求参数 -->
                  <div class="doc-section" v-if="info.requestParams">
                    <h3>请求参数</h3>
                    <el-input 
                      type="textarea" 
                      :rows="6" 
                      :value="info.requestParams"
                      readonly
                    />
                  </div>
                  
                  <!-- 请求头 -->
                  <div class="doc-section" v-if="info.requestHeader">
                    <h3>请求头</h3>
                    <el-input 
                      type="textarea" 
                      :rows="4" 
                      :value="info.requestHeader"
                      readonly
                    />
                  </div>
                  
                  <!-- 响应示例 -->
                  <div class="doc-section" v-if="info.exampleResponse">
                    <h3>响应示例</h3>
                    <pre class="code-block">{{ info.exampleResponse }}</pre>
                  </div>
                  
                  <!-- 详细文档 -->
                  <div class="doc-section" v-if="info.documentation">
                    <h3>详细说明</h3>
                    <div class="documentation" v-html="info.documentation.replace(/\n/g, '<br>')"></div>
                  </div>
                </div>
              </el-tab-pane>
              
              <el-tab-pane label="Schema" name="schema">
                <div class="schema-content">
                  <div class="doc-section" v-if="info.requestSchema">
                    <h3>请求Schema</h3>
                    <pre class="code-block">{{ info.requestSchema }}</pre>
                  </div>
                  
                  <div class="doc-section" v-if="info.responseSchema">
                    <h3>响应Schema</h3>
                    <pre class="code-block">{{ info.responseSchema }}</pre>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </div>
        
      </div>
    </div>
  </div>
</template>

<style scoped>
.interface-detail {
  max-width: 1600px;
  margin: 0 auto;
}

.detail-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.header-card {
  background: var(--surface-color);
}

.interface-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.interface-title {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.method-tag {
  font-weight: 600;
  font-size: 14px;
}

.interface-title h1 {
  margin: 0;
  font-size: 28px;
  color: var(--text-primary);
}

.interface-desc {
  color: var(--text-secondary);
  margin: 0 0 12px 0;
  font-size: 16px;
}

.interface-url {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--accent);
}

.interface-url code {
  background: var(--surface-muted);
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Monaco', 'Courier New', monospace;
}

.interface-meta {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.content-area {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  min-height: 600px;
}

.left-panel, .right-panel {
  background: var(--surface-color);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.doc-content, .schema-content {
  max-height: 600px;
  overflow-y: auto;
}

.doc-section {
  margin-bottom: 24px;
}

.doc-section h3 {
  margin: 0 0 12px 0;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
}

.code-block {
  background: var(--surface-muted);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 16px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  overflow-x: auto;
  margin: 0;
}

.documentation {
  line-height: 1.6;
  color: var(--text-secondary);
}

.test-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.param-section {
  flex: 1;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h4 {
  margin: 0;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
}

.param-input {
  font-family: 'Monaco', 'Courier New', monospace;
}

.response-section {
  margin-top: 16px;
}

.response-section h4 {
  margin: 0 0 12px 0;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
}

.response-container {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  max-height: 300px;
  overflow: auto;
}

.response-body {
  color: var(--text-primary);
  background: transparent;
  border: none;
  padding: 16px;
  margin: 0;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-all;
}

.send-actions {
  display: flex;
  gap: 12px;
  width: 100%;
}

.meta-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.headers {
  margin-top: 12px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .content-area {
    grid-template-columns: 1fr;
  }
}

/* 深色代码主题样式 */
:deep(.el-input__wrapper) {
  font-family: 'Monaco', 'Courier New', monospace;
}
</style>


