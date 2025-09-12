<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import { getPost } from '@/api/posts'
import WelcomeAnimation from '@/components/Welcome/WelcomeAnimation.vue'

const route = useRoute()
const id = ref(Number(route.params.id))
const post = ref(null)
const loading = ref(false)
const error = ref('')
const showBackToTop = ref(false)

async function fetchDetail() {
  loading.value = true
  error.value = ''
  try {
    const resp = await getPost(id.value)
    if (resp?.code === 0) {
      post.value = resp.data
    } else {
      error.value = resp?.message || '加载失败'
    }
  } catch (e) {
    error.value = e?.response?.data?.message || e.message
  } finally {
    loading.value = false
  }
}

function handleScroll() {
  showBackToTop.value = window.scrollY > 300
}

function backToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(() => route.params.id, (v) => { id.value = Number(v); fetchDetail() })

onMounted(() => {
  fetchDetail()
  window.addEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="post-detail-container">
    <WelcomeAnimation v-if="loading" type="loading" message="正在加载帖子详情" subtitle="精彩内容即将呈现" />
    <p v-if="error" class="error-message anim-fade-in-up">{{ error }}</p>
    
    <div v-if="post" class="card anim-fade-in-up">
      <h2 class="post-title">帖子 #{{ post.id }}</h2>
      
      <div class="info-section anim-fade-in-up">
        <div class="row">
          <div class="label">年龄</div><div>{{ post.age }}</div>
          <div class="label">性别</div><div>{{ post.gender }}</div>
          <div class="label">学历</div><div>{{ post.education }}</div>
          <div class="label">地区</div><div>{{ post.place }}</div>
          <div class="label">职业</div><div>{{ post.job }}</div>
          <div class="label">联系方式</div><div>{{ post.contact }}</div>
        </div>
      </div>
      
      <div class="content-section anim-fade-in-up">
        <p class="content">{{ post.content }}</p>
      </div>
      
      <div v-if="post.photo" class="photo-section anim-fade-in-up">
        <img :src="post.photo" alt="photo" class="post-photo" />
      </div>
      
      <div class="meta-section anim-fade-in-up">
        <div class="meta">{{ dayjs(post.createTime).format('YYYY-MM-DD HH:mm') }}</div>
      </div>
    </div>

    <!-- 返回顶部按钮 -->
    <button 
      v-if="showBackToTop"
      @click="backToTop"
      class="back-to-top"
      :class="{ 'visible': showBackToTop }"
    >
      ↑
    </button>
  </div>
</template>

<style scoped>
.post-detail-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  font-size: 1.125rem;
  color: var(--color-text-secondary);
}

.error-message {
  color: #ef4444;
  font-size: 14px;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 0.5rem;
  border: 1px solid rgba(239, 68, 68, 0.2);
  text-align: center;
}

.card { 
  border: 1px solid var(--color-border); 
  border-radius: 1rem; 
  padding: 2rem; 
  background: var(--color-bg-secondary);
  box-shadow: var(--color-shadow-md);
}

.post-title {
  font-size: 1.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 2rem 0;
  text-align: center;
}

.info-section,
.content-section,
.photo-section,
.meta-section {
  margin-bottom: 2rem;
}

.row { 
  display: grid; 
  grid-template-columns: 100px 1fr; 
  gap: 1rem 1.5rem; 
  font-size: 1rem; 
  color: var(--color-text-primary);
  background: var(--color-bg-tertiary);
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid var(--color-border);
}

.label { 
  color: var(--color-text-secondary);
  font-weight: 500;
}

.content {
  font-size: 1.125rem;
  line-height: 1.7;
  color: var(--color-text-primary);
  background: var(--color-bg-tertiary);
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid var(--color-border);
  margin: 0;
}

.post-photo {
  max-width: 100%;
  border-radius: 0.75rem;
  box-shadow: var(--color-shadow-md);
  border: 1px solid var(--color-border);
}

.meta {
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: 0.875rem;
  padding: 1rem;
  background: var(--color-bg-tertiary);
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
}

/* 【动画37】返回顶部按钮浮现 */
.back-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: var(--color-accent-blue);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  font-weight: bold;
  box-shadow: var(--color-shadow-lg);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s var(--anim-ease-out);
  pointer-events: none;
  z-index: 1000;
}

.back-to-top.visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: all;
}

.back-to-top:hover {
  background: var(--color-accent-blue-hover);
  transform: translateY(-2px);
  box-shadow: var(--color-shadow-xl);
}

/* 【动画1】渐进式空间浮现 */
.anim-fade-in-up {
  animation: fadeInUp 0.6s var(--anim-ease-spring) forwards;
}

.anim-fade-in-up:nth-child(1) { animation-delay: 0s; }
.anim-fade-in-up:nth-child(2) { animation-delay: 0.1s; }
.anim-fade-in-up:nth-child(3) { animation-delay: 0.2s; }
.anim-fade-in-up:nth-child(4) { animation-delay: 0.3s; }
.anim-fade-in-up:nth-child(5) { animation-delay: 0.4s; }

.info-section.anim-fade-in-up { animation-delay: 0.1s; }
.content-section.anim-fade-in-up { animation-delay: 0.2s; }
.photo-section.anim-fade-in-up { animation-delay: 0.3s; }
.meta-section.anim-fade-in-up { animation-delay: 0.4s; }

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
  .post-detail-container {
    padding: 1rem;
  }
  
  .card {
    padding: 1.5rem;
  }
  
  .row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .post-title {
    font-size: 1.5rem;
  }
  
  .back-to-top {
    bottom: 1rem;
    right: 1rem;
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1rem;
  }
}
</style>


