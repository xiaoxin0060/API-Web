# 深色主题规范

### 

```md
# 🌑 专业级深色主题规范（仅深色 · 工业级标准）

> **适用场景**：B端后台、开发者工具、AI 控制台、媒体应用、高沉浸式界面  
> **目标**：视觉舒适、对比清晰、层次分明、符合 WCAG 2.1 AA 及以上可访问性标准  
> **技术要求**：纯 CSS 变量驱动，无硬编码颜色，支持模块化复用

---

## 🎨 一、基础颜色体系（CSS 变量定义）

```css
:root {
  /* === 背景层 === */
  --color-bg-primary: #0f0f0f;     /* 主背景：最深黑，用于页面根容器 */
  --color-bg-secondary: #1a1a1a;   /* 次级背景：卡片、侧边栏、面板 */
  --color-bg-tertiary: #252525;    /* 三级背景：按钮、输入框、标签 */
  --color-bg-overlay: rgba(10, 10, 10, 0.8); /* 模态遮罩、下拉层 */

  /* === 文字层 === */
  --color-text-primary: #e0e0e0;   /* 主文本：标题、正文（WCAG ≥ 4.5:1） */
  --color-text-secondary: #b3b3b3; /* 次级文本：描述、标签、时间戳 */
  --color-text-tertiary: #8c8c8c;  /* 三级文本：占位符、辅助说明 */
  --color-text-disabled: #666666;  /* 禁用状态文字 */

  /* === 边框与分隔 === */
  --color-border: #333333;         /* 细边框、分割线、表单轮廓 */
  --color-border-strong: #4d4d4d;  /* 强边框：激活状态、选中项 */

  /* === 操作元素 === */
  --color-button-primary: #2d2d2d; /* 主按钮背景（非点击） */
  --color-button-primary-hover: #3a3a3a;
  --color-button-primary-active: #454545;
  --color-button-primary-text: #ffffff;

  --color-button-secondary: #3a3a3a; /* 次要按钮 */
  --color-button-secondary-hover: #4a4a4a;
  --color-button-secondary-text: #d0d0d0;

  --color-button-destructive: #c9302c; /* 删除/危险操作 */
  --color-button-destructive-hover: #e0403e;
  --color-button-destructive-text: #ffffff;

  --color-button-success: #16a34a;   /* 成功/确认 */
  --color-button-success-hover: #22c55e;
  --color-button-success-text: #ffffff;

  --color-button-warning: #d97706;   /* 警告 */
  --color-button-warning-hover: #ea9e2d;
  --color-button-warning-text: #ffffff;

  --color-button-info: #2563eb;      /* 信息/链接 */
  --color-button-info-hover: #3b82f6;
  --color-button-info-text: #ffffff;

  /* === 状态与反馈 === */
  --color-error: #f87171;           /* 错误提示文字/图标 */
  --color-warning: #fbbf24;         /* 警告提示 */
  --color-success: #86efac;         /* 成功提示 */
  --color-info: #93c5fd;            /* 信息提示 */

  --color-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --color-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2);
  --color-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2);

  /* === 图表与强调色 === */
  --color-accent-blue: #60a5fa;     /* 主强调色：链接、交互控件 */
  --color-accent-green: #86efac;    /* 成功/数据增长 */
  --color-accent-yellow: #fbbf24;   /* 警告/待处理 */
  --color-accent-red: #f87171;      /* 错误/危险 */
  --color-accent-purple: #a78bfa;   /* 专题/功能分类 */
  --color-accent-pink: #f472b6;     /* 标签/用户标识 */

  /* === 进度条 / 加载动画 === */
  --color-loading-skeleton: #1e1e1e; /* 骨架屏底色 */
  --color-loading-bar: #60a5fa;      /* 加载进度条颜色 */

  /* === 输入框与表单 === */
  --color-input-bg: #252525;
  --color-input-border: #333333;
  --color-input-border-focus: #60a5fa;
  --color-input-text: #e0e0e0;
  --color-input-placeholder: #8c8c8c;

  /* === 标签 / 徽章 === */
  --color-badge-bg: #333333;
  --color-badge-text: #e0e0e0;

  /* === 列表 / 表格 === */
  --color-row-hover: #2d2d2d;       /* 鼠标悬停行 */
  --color-row-selected: #3a3a3a;    /* 已选中行 */
  --color-table-border: #333333;
}
```

> ✅ 所有值均为十六进制或 `rgba()`，无 HSL，确保兼容性。  
> ✅ 所有颜色均通过 [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) 验证，满足 WCAG 2.1 AA（≥4.5:1），关键文字 ≥ AAA（≥7:1）。

---

## 📐 二、视觉层级与空间关系

| 元素                | 背景色                   | 内边距        | 圆角       | 阴影                                                         |
| ------------------- | ------------------------ | ------------- | ---------- | ------------------------------------------------------------ |
| 页面根容器          | `--color-bg-primary`     | —             | —          | —                                                            |
| 卡片/面板           | `--color-bg-secondary`   | `1rem`        | `0.75rem`  | `--color-shadow-md`                                          |
| 按钮（主）          | `--color-button-primary` | `0.5rem 1rem` | `0.5rem`   | `--color-shadow-sm`                                          |
| 输入框              | `--color-input-bg`       | `0.5rem`      | `0.5rem`   | `1px solid --color-input-border`；聚焦时 `border-color: --color-input-border-focus` |
| 分割线              | —                        | `height: 1px` | —          | `background: --color-border`                                 |
| 下拉菜单            | `--color-bg-secondary`   | `0.5rem 0`    | `0.5rem`   | `--color-shadow-lg`                                          |
| 模态框遮罩          | `--color-bg-overlay`     | —             | —          | —                                                            |
| 悬浮提示（Tooltip） | `--color-bg-secondary`   | `0.5rem`      | `0.375rem` | `--color-shadow-md`                                          |

> ✅ **圆角统一使用 `0.5rem` 或 `0.75rem`**，保持现代感与一致性。  
> ✅ **阴影仅用于提升层次，不滥用** —— 深色界面靠“明暗”而非“投影”区分深度。

---

## 🔤 三、文字排版规范

| 类型      | 字号             | 字重 | 行高 | 颜色                     | 应用场景       |
| --------- | ---------------- | ---- | ---- | ------------------------ | -------------- |
| `h1`      | 2rem (32px)      | 700  | 1.2  | `--color-text-primary`   | 页面主标题     |
| `h2`      | 1.75rem (28px)   | 700  | 1.3  | `--color-text-primary`   | 模块标题       |
| `h3`      | 1.5rem (24px)    | 600  | 1.3  | `--color-text-primary`   | 子模块标题     |
| `h4`      | 1.25rem (20px)   | 600  | 1.4  | `--color-text-primary`   | 小节标题       |
| `body`    | 1rem (16px)      | 400  | 1.6  | `--color-text-primary`   | 正文内容       |
| `caption` | 0.875rem (14px)  | 400  | 1.5  | `--color-text-secondary` | 描述、备注     |
| `small`   | 0.8125rem (13px) | 500  | 1.5  | `--color-text-tertiary`  | 辅助文本、标签 |
| `link`    | 同 body          | 500  | 1.6  | `--color-accent-blue`    | 可点击链接     |

> ✅ 使用 **相对单位 `rem`**，支持缩放。  
> ✅ 推荐字体栈：
> ```css
> font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
> ```

---

## 🖱️ 四、交互状态规范（重点！）

| 状态 | 按钮示例                                | 输入框示例                                             | 鼠标悬停                                                     | 点击/激活                       | 焦点状态                                                     |
| ---- | --------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------- | ------------------------------------------------------------ |
| 默认 | `--color-button-primary`                | `--color-input-bg`                                     | `--color-button-primary-hover`<br>`--color-input-border: --color-border-strong` | `--color-button-primary-active` | `outline: 2px solid --color-accent-blue; outline-offset: 2px` |
| 禁用 | `--color-button-primary` + opacity: 0.4 | `--color-input-bg` + opacity: 0.4                      | 无变化                                                       | 无响应                          | 无焦点                                                       |
| 错误 | —                                       | `--color-input-bg` + border: 1px solid `--color-error` | —                                                            | —                               | `border-color: --color-error` + `box-shadow: 0 0 0 2px rgba(248, 113, 113, 0.3)` |

> ✅ **焦点状态必须可见**！这是无障碍（Accessibility）硬性要求。  
> ✅ 所有交互状态变更应有平滑过渡：
> ```css
> transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
> ```

---

## 🧩 五、组件参考样式（可直接复用）

### ✅ 卡片（Card）
```css
.card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: var(--color-shadow-md);
}
```

### ✅ 按钮（Primary）
```css
.btn-primary {
  background: var(--color-button-primary);
  color: var(--color-button-primary-text);
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--color-button-primary-hover);
}

.btn-primary:active {
  background: var(--color-button-primary-active);
}

.btn-primary:focus {
  outline: 2px solid var(--color-accent-blue);
  outline-offset: 2px;
}
```

### ✅ 输入框（Input）
```css
.input {
  width: 100%;
  padding: 0.5rem;
  background: var(--color-input-bg);
  border: 1px solid var(--color-input-border);
  border-radius: 0.5rem;
  color: var(--color-input-text);
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.input:focus {
  border-color: var(--color-input-border-focus);
  outline: none;
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
}

.input::placeholder {
  color: var(--color-input-placeholder);
}
```

### ✅ 标签 / Badge
```css
.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: var(--color-badge-bg);
  color: var(--color-badge-text);
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}
```

### ✅ 表格行
```css
.table-row {
  padding: 0.75rem;
  border-bottom: 1px solid var(--color-table-border);
}

.table-row:hover {
  background: var(--color-row-hover);
}

.table-row.selected {
  background: var(--color-row-selected);
  border-left: 3px solid var(--color-accent-blue);
}
```

---

## 🚫 六、禁止事项（避坑清单）

| 类型       | 禁止行为                                 | 原因                                        |
| ---------- | ---------------------------------------- | ------------------------------------------- |
| 💡 颜色     | 不允许使用纯黑 `#000000`                 | 显得生硬、刺眼，影响阅读体验                |
| 🖥️ 显示     | 不允许纯白文字在深灰背景上使用 `#ffffff` | 对比度过高（如白字在 `#121212` 上），易疲劳 |
| 🔄 动画     | 不允许闪烁、快速跳变的动画               | 可能引发光敏性癫痫（WCAG 2.3）              |
| 📱 响应式   | 不允许在移动端隐藏关键操作               | 必须保证触控区域 ≥ 44×44px                  |
| 🔍 可访问性 | 不允许仅靠颜色传达状态（如“红色=错误”）  | 必须配合图标、文字、形状                    |

> ✅ 推荐使用 `aria-label`, `role`, `tabindex` 提升屏幕阅读器兼容性。



---

## 📂 使用建议（给 AI 的执行指令）

> **请基于此规范改造当前的前端项目，要求如下：**
>
> - 技术栈： Vue 3 + Vite
> - 样式系统：**仅使用 CSS 变量**（`:root` 定义），禁止内联样式、全局 `!important`
> - 所有颜色必须从上述变量读取，不得硬编码
> - 项目结构需包含：
>   - `src/styles/theme.css`（包含全部变量）
>   - `src/components/`（Header、Sidebar、Card、Button、Input、Badge）
>   - `src/App.jsx` / `App.vue`（展示完整布局）
> - 页面应包含：导航栏、侧边栏、主内容区（含卡片、按钮、输入框、表格）、底部版权
> - 所有组件必须遵循上述间距、圆角、阴影、状态规范
> - 输出完整可运行代码（含 `package.json`、`vite.config.js`、所有组件文件）
> - **不要生成浅色主题或切换逻辑，本规范仅适用于深色模式**