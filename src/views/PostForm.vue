<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { addPost, updatePost, getPost } from '@/api/posts'

const route = useRoute()
const router = useRouter()
const isEdit = route.name === 'post-edit'
const id = isEdit ? Number(route.params.id) : null

const form = ref({
  age: 0, gender: 0, education: '', place: '', job: '', contact: '', loveExp: '', content: '', photo: ''
})
const loading = ref(false)
const msg = ref('')
const showErrorShake = ref(false)

async function load() {
  if (!isEdit) return
  loading.value = true
  try {
    const resp = await getPost(id)
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
    const resp = isEdit ? await updatePost({ ...payload, id }) : await addPost(payload)
    if (resp?.code === 0) {
      alert(isEdit ? '已保存' : '已创建')
      router.push('/posts')
    } else {
      msg.value = resp?.message || '提交失败'
      triggerErrorShake()
    }
  } catch (e) {
    msg.value = e?.response?.data?.message || e.message
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

onMounted(load)
</script>

<template>
  <div class="post-form-container">
    <div class="form-header anim-fade-in-up">
      <h2>{{ isEdit ? '编辑帖子' : '新建帖子' }}</h2>
    </div>
    
    <form class="form anim-fade-in-up" :class="{ 'anim-trigger-shake': showErrorShake }" @submit.prevent="onSubmit">
      <div class="row">
        <label>年龄<input class="input" type="number" v-model.number="form.age" min="0" /></label>
        <label>性别<input class="input" type="number" v-model.number="form.gender" min="0" /></label>
        <label>学历<input class="input" v-model="form.education" /></label>
        <label>地区<input class="input" v-model="form.place" /></label>
        <label>职业<input class="input" v-model="form.job" /></label>
      </div>
      <label>联系方式<input class="input" v-model="form.contact" /></label>
      <label>恋爱经历<input class="input" v-model="form.loveExp" /></label>
      <label>内容<textarea class="input" v-model="form.content" rows="5" /></label>
      <label>图片URL<input class="input" v-model="form.photo" /></label>
      <div class="actions">
        <button class="btn-primary" type="submit" :disabled="loading">
          {{ loading ? '提交中...' : '提交' }}
        </button>
      </div>
      <p v-if="msg" class="error-message">{{ msg }}</p>
    </form>
  </div>
</template>

<style scoped>
.post-form-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-header h2 {
  font-size: 1.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.form { 
  display: grid; 
  gap: 1.5rem; 
  background: var(--color-bg-secondary);
  padding: 2rem;
  border-radius: 1rem;
  border: 1px solid var(--color-border);
  box-shadow: var(--color-shadow-md);
}

.row { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); 
  gap: 1rem; 
}

label { 
  display: grid; 
  gap: 0.5rem; 
  font-weight: 500;
  color: var(--color-text-secondary);
}

.input { 
  padding: 0.75rem 1rem; 
  border: 1px solid var(--color-border); 
  border-radius: 0.5rem; 
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 1rem;
  transition: all 0.2s var(--anim-ease-out);
}

.input:focus {
  outline: none;
  border-color: var(--color-accent-blue);
}

textarea.input {
  resize: vertical;
  min-height: 120px;
}

.actions { 
  margin-top: 1rem; 
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-primary { 
  padding: 0.75rem 2rem; 
  background: var(--color-accent-blue);
  color: white;
  border: none;
  border-radius: 0.5rem; 
  cursor: pointer; 
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s var(--anim-ease-out);
}

.btn-primary:hover {
  background: var(--color-accent-blue-hover);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #ef4444;
  font-size: 14px;
  margin: 1rem 0 0 0;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 0.5rem;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* 动画样式 */
.anim-fade-in-up {
  animation: fadeInUp 0.6s var(--anim-ease-spring) forwards;
}

.anim-fade-in-up:nth-child(2) {
  animation-delay: 0.1s;
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
  .post-form-container {
    padding: 1rem;
  }
  
  .form {
    padding: 1.5rem;
  }
  
  .row {
    grid-template-columns: 1fr;
  }
  
  .actions {
    justify-content: stretch;
  }
  
  .btn-primary {
    width: 100%;
  }
}
</style>


