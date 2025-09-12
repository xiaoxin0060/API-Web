# 小新API平台 - 前端项目

基于 Vue 3 + Vite + Element Plus 构建的现代化API管理平台前端项目，参考 Postman、Apifox 等主流API平台设计理念。

## 🚀 技术栈

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite 7.1.5
- **UI库**: Element Plus 
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **HTTP客户端**: Axios
- **工具库**: dayjs (日期处理)
- **图标**: Element Plus Icons

## 📦 项目结构

```
src/
├── api/                    # API 接口模块
│   ├── client.js          # Axios 客户端配置
│   ├── auth.js            # 认证相关接口
│   ├── interfaces.js      # 接口管理接口
│   ├── posts.js           # 帖子相关接口
│   └── users.js           # 用户管理接口
├── assets/                # 静态资源
├── components/            # 公共组件（已清理）
├── router/                # 路由配置
│   └── index.js
├── stores/                # Pinia 状态管理
│   └── auth.js            # 认证状态
├── views/                 # 页面组件
│   ├── Login.vue          # 登录页
│   ├── Register.vue       # 注册页
│   ├── InterfaceList.vue  # 接口列表
│   ├── InterfaceDetail.vue # 接口详情/测试
│   ├── InterfaceForm.vue  # 接口新建/编辑
│   ├── PostList.vue       # 帖子列表
│   ├── PostDetail.vue     # 帖子详情
│   ├── PostForm.vue       # 帖子新建/编辑
│   ├── Profile.vue        # 个人中心
│   ├── AdminUsers.vue     # 用户管理
│   └── NotFound.vue       # 404页面
├── App.vue                # 根组件
└── main.js                # 入口文件
```

## 🎨 设计特色

### 1. 现代化UI设计
- 参考 Postman/Apifox 设计风格
- Element Plus 组件库保证一致性
- 响应式布局，支持移动端
- 渐变色品牌设计

### 2. 专业的API测试界面
- 左右分栏布局：文档 + 测试
- 代码高亮显示
- JSON 格式化功能
- 实时测试结果展示

### 3. 完整的权限控制
- 基于角色的访问控制 (RBAC)
- 路由级权限校验
- 管理员功能独立
- 自动登录状态维护

## 🔧 功能模块

### 认证系统
- ✅ 用户登录/注册
- ✅ 登录状态自动恢复
- ✅ 权限路由守卫
- ✅ 登出功能

### 接口管理
- ✅ 接口列表（分页、搜索、筛选）
  - 支持按名称、方法、状态、分类搜索
  - 支持多种筛选条件组合
- ✅ 接口详情（文档 + 在线测试）
  - 左侧：完整接口文档展示
  - 右侧：参数输入和测试功能
- ✅ 接口CRUD（管理员权限）
- ✅ 接口上线/下线（管理员权限）
- ✅ 在线接口调用测试

### 社区功能
- ✅ 帖子列表/详情
- ✅ 帖子发布/编辑
- ✅ 帖子管理

### 个人中心
- ✅ AK/SK 密钥管理（脱敏显示）
- ✅ 管理员密钥重置功能

### 用户管理（管理员）
- ✅ 用户列表/分页
- ✅ 用户删除

## 🎯 核心优化

### 1. 搜索功能修复
**问题**：之前错误理解后端接口，实际后端支持多种搜索参数
**解决**：
- 正确使用后端 `/api/interfaceInfo/list` 接口的 `name`、`method`、`status`、`category` 等参数
- 实现多条件组合搜索
- 添加重置功能

### 2. UI/UX 重构
**参考对象**：Postman、Apifox、Swagger UI
**改进**：
- 专业的API平台视觉设计
- 双栏布局（文档+测试）
- 方法标签颜色编码（GET-绿色，POST-蓝色，PUT-橙色，DELETE-红色）
- 代码编辑器样式优化

### 3. 组件库集成
- 完整集成 Element Plus
- 统一的消息提示
- 专业的表格和表单组件
- 图标系统完善

## 🚀 运行说明

### 环境要求
- Node.js >= 20.19.0
- npm 或 pnpm

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```
访问：http://localhost:5173

### 生产构建
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

## 🔗 后端对接

### API 代理配置
项目配置了开发环境代理：
```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8101',
      changeOrigin: true,
    },
  },
}
```

### 后端要求
- 后端服务运行在 `http://localhost:8101`
- 所有API路径以 `/api` 开头
- 支持CORS或使用代理

### 接口对应关系
- 用户认证：`/api/user/*`
- 接口管理：`/api/interfaceInfo/*`
- 帖子管理：`/api/post/*`
- 用户管理：`/api/user/*`

## 👥 用户角色

### 普通用户
- 查看接口列表和详情
- 在线测试接口
- 发布和管理自己的帖子
- 查看个人AK/SK

### 管理员 (userRole === 'admin')
- 普通用户所有权限
- 新建/编辑/删除接口
- 接口上线/下线管理
- 用户管理
- 重置用户AK/SK

## 🎨 界面预览

### 登录页面
- 左右分栏设计
- 品牌介绍 + 登录表单
- 表单验证和错误提示
- 响应式适配

### 接口列表
- 专业的数据表格
- 多条件搜索筛选
- 状态标签和方法标识
- 分页和操作按钮

### 接口详情
- Postman风格的双栏布局
- 左侧：完整文档展示
- 右侧：在线测试工具
- JSON格式化和代码高亮

## 🔄 下一步优化建议

1. **代码分割优化**：当前打包体积较大，建议使用动态导入
2. **国际化支持**：添加 vue-i18n 支持多语言
3. **主题定制**：支持暗色模式切换
4. **更多测试功能**：
   - Headers 自定义
   - 历史记录
   - 测试用例保存
5. **性能优化**：
   - 虚拟滚动（大数据量）
   - 请求缓存
   - 懒加载

## 📄 许可证

MIT License
