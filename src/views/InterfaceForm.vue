<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { addInterface, updateInterface, getInterface } from '@/api/interfaces'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const isEdit = route.name === 'interface-edit'
const id = isEdit ? Number(route.params.id) : null

const form = ref({
  name: '', description: '', url: '', providerUrl: '', method: 'GET',
  requestParams: '', requestHeader: '', responseHeader: '',
  category: '', tags: '', version: '',
  requestSchema: '', responseSchema: '',
  authType: '', authConfig: '', timeout: 0, retryCount: 0, rateLimit: 0, price: 0,
  documentation: '', exampleRequest: '{\n}', exampleResponse: '',
})
const loading = ref(false)
const msg = ref('')

async function load() {
  if (!isEdit) return
  loading.value = true
  try {
    const resp = await getInterface(id)
    if (resp?.code === 0) {
      Object.assign(form.value, resp.data || {})
    } else {
      msg.value = resp?.message || '加载失败'
    }
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  loading.value = true
  msg.value = ''
  try {
    const payload = { ...form.value }
    const resp = isEdit ? await updateInterface({ ...payload, id }) : await addInterface(payload)
    if (resp?.code === 0) {
      ElMessage.success(isEdit ? '已保存' : '已创建')
      router.push('/interfaces')
    } else {
      msg.value = resp?.message || '提交失败'
    }
  } catch (e) {
    msg.value = e?.response?.data?.message || e.message
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="iface-form">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <h2>{{ isEdit ? '编辑接口' : '新建接口' }}</h2>
          <div class="actions">
            <el-button type="primary" :loading="loading" @click="onSubmit">{{ loading ? '提交中...' : '提交' }}</el-button>
            <el-button @click="router.back()">取消</el-button>
          </div>
        </div>
      </template>

      <el-form label-width="120px" :model="form">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="名称" required>
              <el-input v-model="form.name" placeholder="请输入接口名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="方法" required>
              <el-select v-model="form.method" placeholder="请选择请求方法">
                <el-option label="GET" value="GET" />
                <el-option label="POST" value="POST" />
                <el-option label="PUT" value="PUT" />
                <el-option label="DELETE" value="DELETE" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" :rows="2" /></el-form-item>
        
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="平台URL (对外展示)" required>
              <el-input v-model="form.url" placeholder="例如 /api/xxx" />
              <div class="field-tip">向用户展示的接口调用地址</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="真实URL (内部配置)">
              <el-input v-model="form.providerUrl" placeholder="例如 https://real-api.internal.com" />
              <div class="field-tip">真实提供服务的地址，仅内部使用，不对用户暴露</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="请求头"><el-input v-model="form.requestHeader" type="textarea" :rows="2" placeholder="JSON 或文本" /></el-form-item>
        <el-form-item label="响应头"><el-input v-model="form.responseHeader" type="textarea" :rows="2" placeholder="JSON 或文本" /></el-form-item>
        <el-form-item label="请求参数"><el-input v-model="form.requestParams" type="textarea" :rows="4" placeholder="JSON 或键值描述" /></el-form-item>

        <el-row :gutter="12">
          <el-col :span="6"><el-form-item label="分类"><el-input v-model="form.category" /></el-form-item></el-col>
          <el-col :span="6"><el-form-item label="标签"><el-input v-model="form.tags" /></el-form-item></el-col>
          <el-col :span="6"><el-form-item label="版本"><el-input v-model="form.version" /></el-form-item></el-col>
        </el-row>

        <el-row :gutter="12">
          <el-col :span="6"><el-form-item label="超时(ms)"><el-input-number v-model="form.timeout" :min="0" /></el-form-item></el-col>
          <el-col :span="6"><el-form-item label="重试次数"><el-input-number v-model="form.retryCount" :min="0" /></el-form-item></el-col>
          <el-col :span="6"><el-form-item label="限流QPS"><el-input-number v-model="form.rateLimit" :min="0" /></el-form-item></el-col>
          <el-col :span="6"><el-form-item label="价格"><el-input-number v-model="form.price" :min="0" :step="0.01" /></el-form-item></el-col>
        </el-row>

        <el-form-item label="认证类型"><el-input v-model="form.authType" /></el-form-item>
        <el-form-item label="认证配置"><el-input v-model="form.authConfig" type="textarea" :rows="2" /></el-form-item>

        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="请求Schema">
              <el-input v-model="form.requestSchema" type="textarea" :rows="6" placeholder="JSON Schema" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Schema 预览">
              <pre class="code-block">{{ (() => { try { return JSON.stringify(JSON.parse(form.requestSchema||'{}'), null, 2) } catch { return '无效 JSON' } })() }}</pre>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="响应Schema">
              <el-input v-model="form.responseSchema" type="textarea" :rows="6" placeholder="JSON Schema" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Schema 预览">
              <pre class="code-block">{{ (() => { try { return JSON.stringify(JSON.parse(form.responseSchema||'{}'), null, 2) } catch { return '无效 JSON' } })() }}</pre>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="文档"><el-input v-model="form.documentation" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="示例请求"><el-input v-model="form.exampleRequest" type="textarea" :rows="4" /></el-form-item>
        <el-form-item label="示例响应"><el-input v-model="form.exampleResponse" type="textarea" :rows="4" /></el-form-item>
      </el-form>
      <div class="actions-bottom"><el-button type="primary" :loading="loading" @click="onSubmit">{{ loading ? '提交中...' : '提交' }}</el-button></div>
      <p v-if="msg" class="error-message">{{ msg }}</p>
    </el-card>
  </div>
</template>

<style scoped>
.iface-form { max-width: 1200px; margin: 0 auto; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.actions { display: flex; gap: 12px; }
.actions-bottom { margin-top: 12px; }
.code-block { background: var(--surface-muted); border: 1px solid var(--border-color); border-radius: 6px; padding: 12px; font-family: 'Monaco', 'Courier New', monospace; max-height: 240px; overflow: auto; }
.error-message {
  color: #ef4444;
  font-size: 14px;
  margin: 8px 0;
}

.field-tip {
  font-size: 12px;
  color: var(--color-text-tertiary);
  margin-top: 4px;
  line-height: 1.4;
}
</style>


