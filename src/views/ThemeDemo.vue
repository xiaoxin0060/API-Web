<template>
  <div class="theme-demo">
    <div class="demo-header">
      <h1>深色主题组件展示</h1>
      <p class="demo-description">基于工业级深色主题规范的Vue 3组件库展示</p>
    </div>

    <div class="demo-section">
      <Card hoverable>
        <template #header>
          <h3>按钮组件</h3>
        </template>
        <div class="button-grid">
          <Button type="primary">主要按钮</Button>
          <Button type="secondary">次要按钮</Button>
          <Button type="success">成功按钮</Button>
          <Button type="warning">警告按钮</Button>
          <Button type="destructive">删除按钮</Button>
          <Button type="info">信息按钮</Button>
          
          <Button type="primary" size="large">大号按钮</Button>
          <Button type="primary" size="small">小号按钮</Button>
          <Button type="primary" :loading="true">加载中</Button>
          <Button type="primary" :disabled="true">禁用状态</Button>
        </div>
      </Card>
    </div>

    <div class="demo-section">
      <Card hoverable>
        <template #header>
          <h3>输入框组件</h3>
        </template>
        <div class="input-grid">
          <Input 
            v-model="formData.name"
            label="用户名"
            placeholder="请输入用户名"
          />
          <Input 
            v-model="formData.email"
            type="email"
            label="邮箱"
            placeholder="请输入邮箱地址"
          />
          <Input 
            v-model="formData.error"
            label="错误状态"
            placeholder="这是一个错误示例"
            error="邮箱格式不正确"
          />
          <Input 
            v-model="formData.helper"
            label="帮助文本"
            placeholder="带有帮助文本的输入框"
            helper="这是一段帮助文本"
          />
          <Input 
            label="禁用状态"
            placeholder="禁用的输入框"
            :disabled="true"
          />
        </div>
      </Card>
    </div>

    <div class="demo-section">
      <Card hoverable>
        <template #header>
          <h3>徽章组件</h3>
        </template>
        <div class="badge-grid">
          <div class="badge-row">
            <Badge>默认</Badge>
            <Badge type="primary">主要</Badge>
            <Badge type="success">成功</Badge>
            <Badge type="warning">警告</Badge>
            <Badge type="error">错误</Badge>
            <Badge type="info">信息</Badge>
          </div>
          <div class="badge-row">
            <Badge size="small">小号</Badge>
            <Badge size="medium">中号</Badge>
            <Badge size="large">大号</Badge>
          </div>
          <div class="badge-row">
            <Badge :dot="true"></Badge>
            <Badge type="success" :dot="true"></Badge>
            <Badge type="warning" :dot="true"></Badge>
            <Badge type="error" :dot="true"></Badge>
          </div>
        </div>
      </Card>
    </div>

    <div class="demo-section">
      <Card hoverable>
        <template #header>
          <h3>卡片展示</h3>
        </template>
        <div class="cards-grid">
          <Card class="demo-card">
            <h4>简单卡片</h4>
            <p>这是一个简单的卡片内容，用于展示基本的卡片样式。</p>
          </Card>
          
          <Card hoverable class="demo-card">
            <template #header>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>带头部的卡片</span>
                <Badge type="success">新</Badge>
              </div>
            </template>
            <p>这是一个带有头部的卡片，展示了更复杂的布局。</p>
            <template #footer>
              <div style="text-align: right;">
                <Button type="primary" size="small">查看详情</Button>
              </div>
            </template>
          </Card>

          <Card hoverable class="demo-card">
            <template #header>
              <span>状态卡片</span>
            </template>
            <div class="status-content">
              <div class="status-item">
                <Badge type="success" :dot="true"></Badge>
                <span>系统运行正常</span>
              </div>
              <div class="status-item">
                <Badge type="warning" :dot="true"></Badge>
                <span>部分功能维护中</span>
              </div>
              <div class="status-item">
                <Badge type="error" :dot="true"></Badge>
                <span>发现1个错误</span>
              </div>
            </div>
          </Card>
        </div>
      </Card>
    </div>

    <div class="demo-section">
      <Card hoverable>
        <template #header>
          <h3>表格展示</h3>
        </template>
        <div class="table-wrapper">
          <table class="demo-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>用户名</th>
                <th>邮箱</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in demoUsers" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <Badge :type="user.status === 'active' ? 'success' : 'warning'">
                    {{ user.status === 'active' ? '活跃' : '待审核' }}
                  </Badge>
                </td>
                <td>
                  <Button type="info" size="small" style="margin-right: 0.5rem;">编辑</Button>
                  <Button type="destructive" size="small">删除</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>

    <div class="demo-section">
      <Card hoverable>
        <template #header>
          <h3>颜色规范</h3>
        </template>
        <div class="colors-grid">
          <div class="color-group">
            <h4>背景色</h4>
            <div class="color-row">
              <div class="color-item" style="background: var(--color-bg-primary)">
                <span>主背景</span>
                <code>--color-bg-primary</code>
              </div>
              <div class="color-item" style="background: var(--color-bg-secondary)">
                <span>次级背景</span>
                <code>--color-bg-secondary</code>
              </div>
              <div class="color-item" style="background: var(--color-bg-tertiary)">
                <span>三级背景</span>
                <code>--color-bg-tertiary</code>
              </div>
            </div>
          </div>

          <div class="color-group">
            <h4>文字色</h4>
            <div class="color-row">
              <div class="color-item" style="background: var(--color-text-primary); color: var(--color-bg-primary)">
                <span>主要文字</span>
                <code>--color-text-primary</code>
              </div>
              <div class="color-item" style="background: var(--color-text-secondary); color: var(--color-bg-primary)">
                <span>次要文字</span>
                <code>--color-text-secondary</code>
              </div>
              <div class="color-item" style="background: var(--color-text-tertiary); color: var(--color-bg-primary)">
                <span>三级文字</span>
                <code>--color-text-tertiary</code>
              </div>
            </div>
          </div>

          <div class="color-group">
            <h4>强调色</h4>
            <div class="color-row">
              <div class="color-item" style="background: var(--color-accent-blue)">
                <span>主强调色</span>
                <code>--color-accent-blue</code>
              </div>
              <div class="color-item" style="background: var(--color-success)">
                <span>成功色</span>
                <code>--color-success</code>
              </div>
              <div class="color-item" style="background: var(--color-warning); color: var(--color-bg-primary)">
                <span>警告色</span>
                <code>--color-warning</code>
              </div>
              <div class="color-item" style="background: var(--color-error)">
                <span>错误色</span>
                <code>--color-error</code>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Card from '@/components/Card.vue'
import Button from '@/components/Button.vue'
import Input from '@/components/Input.vue'
import Badge from '@/components/Badge.vue'

const formData = ref({
  name: '',
  email: '',
  error: 'invalid-email',
  helper: ''
})

const demoUsers = ref([
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', status: 'active' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', status: 'pending' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', status: 'active' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', status: 'pending' }
])
</script>

<style scoped>
.theme-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: var(--color-text-primary);
}

.demo-header {
  text-align: center;
  margin-bottom: 3rem;
}

.demo-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--color-accent-blue), var(--color-accent-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.demo-description {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.demo-section {
  margin-bottom: 2rem;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  align-items: center;
}

.input-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.badge-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.badge-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.demo-card {
  min-height: 200px;
}

.status-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 0.75rem;
  border: 1px solid var(--color-border);
}

.demo-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-bg-secondary);
}

.demo-table th {
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  font-weight: 600;
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--color-table-border);
}

.demo-table td {
  padding: 1rem;
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-table-border);
}

.demo-table tr:hover {
  background: var(--color-row-hover);
}

.colors-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.color-group h4 {
  margin-bottom: 1rem;
  color: var(--color-text-primary);
}

.color-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.color-item {
  padding: 1.5rem 1rem;
  border-radius: 0.5rem;
  color: white;
  text-align: center;
  border: 1px solid var(--color-border);
}

.color-item span {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.color-item code {
  display: block;
  font-size: 0.75rem;
  opacity: 0.8;
  font-family: 'Monaco', 'Consolas', monospace;
}

@media (max-width: 768px) {
  .theme-demo {
    padding: 1rem;
  }
  
  .demo-header h1 {
    font-size: 2rem;
  }
  
  .button-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }
  
  .input-grid {
    grid-template-columns: 1fr;
  }
  
  .cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
