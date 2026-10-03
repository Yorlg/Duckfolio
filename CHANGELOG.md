# 2.4.36 (2026-10-03)

### 新增

- 增加按 `vX.Y.Z` 标签发布 GitHub Release 的工作流，只使用 GitHub 自动生成的源码压缩包，发布说明取自对应版本的 CHANGELOG。

### 安全

- 将 Next.js 升级至 16.3.6；更新已发布修复版本的传递依赖，移除 DOCX 导入依赖链中的旧版 lodash。`braces@3.0.3` 的上游修复尚未发布，继续跟踪。

### 文档

- 更新 README 的运行要求、部署、后台配置及发布说明。

# 2.4.35 (2026-10-03)

### 依赖

- 更新项目依赖与锁文件；适配新版 Plate 拖拽接口，在缺少拖拽节点时阻止列和表格行的放置。

# 2.4.34 (2026-10-02)

### 新增

- 公开页面与后台支持中英文切换；后台支持上传 PNG 头像和 Logo。
- 接入 Vercel Web Analytics 采集；后台首页可通过服务端接口展示最近 30 天的浏览量、访客数和热门页面（需配置访问令牌）。
- 后台基础资料支持以骨架预览选择经典或极简首页布局，未配置时使用经典布局。

### 变更

- 两种首页布局的社交入口统一为紧凑图标行，保留平台名称的无障碍标签和悬停提示；邮件链接直接打开邮件应用。
- 后台站点配置改为分组导航与单组编辑视图，保存入口移至顶部。
- 头像配色随站点配置保存并在首屏输出；更新头像时重新取色，旧配置取色期间显示加载状态。
- 顶部导航“链接”更名为“友链”，沿用 `/links` 路径；友链由站长在后台维护。
- 移除布局层重复的页面切换动画，避免后台整体位移。

# 2.4.17 (2026-07-05)

### 优化

- 优化移动端滑动切换菜单判定逻辑，去掉过早的方向锁定机制

# 2.4.16 (2026-07-05)

### 优化

- 重构移动端左右滑动切换菜单机制，改用原生 touch 事件替代 framer-motion drag，避免惯性计算导致误触
- 增加方向锁定，垂直滑动不再干扰页面滚动
- 博客文章详情页禁用滑动导航，防止阅读和查看代码时误触

# 2.4.15 (2026-07-05)

### 修复

- 修复管理后台移动端菜单溢出问题flex 响应式布局
- 修复中文文章 slug 导致 404 的问题，`getPostBySlug` 增加 URL 解码处理
- 文章详情页添加 `dynamic = 'force-dynamic'`，支持动态发布的文章即时访问

# 2.4.14 (2026-07-03)

### 新增

- 管理后台新增「媒体资源」页面，支持查看、上传、删除媒体文件
- 后台右上角操作按钮改为 DropdownMenu 下拉菜单

### 变更

- 编辑文章时插入的图片不再立即提交到仓库，改为在浏览器内暂存（blob URL），点击「发布」时才批量上传并替换为最终链接

### 修复

- 修复 AI 配置弹窗中模型下拉列表鼠标滚轮无法滚动的问题。

# 2.4.13 (2026-07-03)

### 新增

- 管理后台新增密码验证

### 修复

- 修复 AI 配置弹窗中模型下拉列表鼠标滚轮无法滚动的问题

# 2.4.12 (2026-07-02)

### 变更

- 社交链接和项目链接的图标配置改为可视化图标选择器，并继续兼容旧的内联 SVG 配置。
- 图标选择器改为可搜索、可分页的网格预览，并扩充内置图标库。
- 默认平台配置改为保存图标名称，不再保存内联 SVG 字符串。

### 移除

- 移除自定义字体加载配置和未使用的字体资源。

# 2.4.11 (2026-07-02)

### 新增

- `platform-config.json` 支持配置 Projects 页面分组和项目列表。
- `/admin` 站点配置新增项目分组和项目列表的可视化编辑。

### 变更

- Projects 页面改为读取配置数据，默认仅保留 `WebSSH` 项目。

# 2.4.10 (2026-07-02)

### 变更

- Projects 页面分类标题改用本地 `Roboto Condensed` 字体文件，进一步贴近参考页面效果。

# 2.4.9 (2026-07-02)

### 变更

- 调整 Projects 页面分组标题和项目列表的间距，避免项目卡片与大标题过度重叠。

# 2.4.8 (2026-07-02)

### 变更

- 接入 `Inter`、`DM Mono` 和 `Bad Script` 字体，并补齐 `font-sans`、`font-mono`、`font-wisper` 字体令牌。
- Projects 页面分类标题明确使用加载后的 `Inter` 字体。

# 2.4.7 (2026-07-02)

### 修复

- 修复 Projects 页面左侧锚点导航 `sticky` 不生效的问题。

# 2.4.6 (2026-07-02)

### 变更

- Projects 页面左侧锚点导航改为内容分组自动生成，并贴近页面左侧使用粘性定位。
- Projects 页面分组标题调整为更轻的浅色描边样式。

# 2.4.5 (2026-07-02)

### 变更

- Projects 页面左侧分类默认仅显示三条杠，鼠标移入或键盘聚焦后展开锚点列表。
- 管理后台操作结果改为浮层 Message 提示，不再直接占用页面内容区域显示。

# 2.4.4 (2026-07-01)

### 新增

- 新增 `/projects` 页面，并在右上角导航和移动端滑动导航中加入 `Projects`。
- AI 设置支持根据已填写的 API Key 和 Base URL 自动读取 OpenAI-compatible `/models` 模型列表。

### 变更

- 右上角导航从全大写改为常规标题样式。
- 发布文章成功后先将新文章合并进列表，再延迟刷新远端列表，避免 GitHub Contents API 短暂返回旧数据导致新文章消失。

### 修复

- 修复文章列表接口中单篇 Markdown 读取失败会导致整个列表接口返回 500 的问题。

# 2.4.3 (2026-07-01)

### 修复

- 修复发布成功切回文章列表后，自动刷新列表再次清空成功提示的问题。
- 修复发布后删除同一篇文章时，因为残留编辑状态导致页面跳回发布文章页的问题。

# 2.4.2 (2026-07-01)

### 修复

- 修复发布文章成功后提示被文章列表刷新清空的问题，发布成功后会保留成功提示并自动返回文章列表。
- 修复新建文章输入标题时，文章路径只自动填充首个字符的问题；现在会持续同步标题生成路径，直到用户手动修改文章路径。

# 2.4.1 (2026-07-01)

### 修复

- 修复 `.gitignore` 中 `posts/` 规则误伤 `src/app/api/admin/posts/route.ts`，导致 Vercel 部署后 `/api/admin/posts` 直接命中 404 的问题。

# 2.4.0 (2026-07-01)

### 新增

- `/admin` 文章列表支持编辑、删除、公开/草稿切换和文章查看。
- 新增 `/api/admin/posts` 的完整 CRUD 能力：列表、单篇读取、发布/更新、状态切换、删除。
- 新增 Vercel 部署文档 `docs/deploy-to-Vercel.md`。
- ~~新增 Cloudflare Workers 部署文档 `docs/deploy-to-Cloudflare.md`~~。
- 新增后台接口响应安全解析，避免 Vercel 返回 HTML 时前端显示 JSON 解析异常。

### 变更

- 将 `AdminPanel.tsx` 拆分为文章编辑、文章列表、站点配置、首页概览、通知栈和公共控件等模块。
- 所有 `/api/admin/*` 路由强制动态执行并禁用缓存，降低 Vercel 部署环境下接口被静态化或缓存误判的风险。
- README 部署说明改为 Vercel / ~~Cloudflare Workers~~，并移除旧 Netlify 说明。
- 管理后台菜单按钮样式改为明确的 active / inactive 状态。
- 首页概览移除“浏览数据”和“访问数据”占位模块。

### 修复

- 修复错误管理员口令或部署返回 HTML 时显示 `Unexpected token '<'` 的问题。
- 修复文章保存成功但响应结果为空时的前端类型问题。
- 修复 Turbopack 构建时本地路径追踪范围过大的警告。

### 移除

- 移除旧 Netlify 部署文档 `docs/deploy-to-netlify.md`。
- 移除 `.gitignore` 中的 Netlify 目录忽略项。

# 2.3.0 (2026-7-1)

### 新增

- 新增 `/admin` 管理后台，支持文章发布、编辑、删除及站点配置管理
  - 文章通过 GitHub API 提交到指定仓库分支（默认 `deploy`）
  - 支持草稿（draft）标记，草稿文章不在前台展示
  - 支持平台配置（platform-config）在线编辑
- 新增基于 Plate.js 的富文本编辑器（`/editor`），包含完整插件体系
  - 基础节点、列表、表格、代码块、数学公式、媒体、表情、提及等
  - 拖拽、固定/浮动工具栏、斜杠命令、评论、建议
  - Markdown 导入导出、DOCX 导出
- 新增 AI 写作能力（AI Copilot），支持生成、编辑、评论等命令
  - 兼容 OpenAI 及 AI Gateway 两种接入方式
- 新增媒体上传与管理 API（`/api/media`、`/api/admin/media`）
- 新增 `.env.example` 环境变量模板
- 新增 Vercel 与 Cloudflare Workers 部署文档

### 变更

- `src/lib/config.ts` 改为运行时读取 `platform-config.json`，并提供兜底配置
- `src/lib/blog.ts` 新增 draft 字段支持，草稿文章自动过滤
- `src/app/not-found.tsx` 改用统一的 `renderMarkdownToHtml` 渲染 404 内容
- `src/app/layout.tsx` 移除 Inter 字体加载
- `RootLayoutClient` 在 `/admin` 路径下隐藏导航与页脚，使用全宽布局
- `next.config.ts` 重写 rewrites 规则，新增 turbopack root 配置
- `components.json` 调整组件别名路径（`@/components`、`@/components/ui`）
- `globals.css` 新增 `@theme inline` 主题变量映射及完整 CSS 变量定义
- Node 引擎要求提升至 `>=22.22.1`，pnpm 要求 `>=11`

### 移除

- 移除 Netlify 部署方案及 Decap CMS（原 `admin/index.html`、`config.yml`）
- 移除 `allowedDeprecatedVersions` 与 `onlyBuiltDependencies` 配置

### 样式与代码规范

- 全局将 Tailwind 任意值语法 `text-[var(--theme-primary)]` 规范化为 `text-(--theme-primary)`
- 将 `h-4 w-4` 统一为 `size-4`，`bg-gradient-to-r` 改为 `bg-linear-to-r`
- `dropdown-menu.tsx` 将 `data-[disabled]` 简化为 `data-disabled`，`min-w-[8rem]` 改为 `min-w-32`
- 新增 `eslint-plugin-better-tailwindcss` 规范 Tailwind 类名写法

# 2.2.0 (2025-5-10)

### 新增

- 新增 404 页面处理，提供友好的错误提示
- 新增 Cloudflare Workers 部署指南文档
- 新增 Vercel 部署支持及文档
- 新增动态配置更新支持（Node.js 运行时）

### 变更

- 主分支拆分部署方式，移除 Cloudflare Pages 的部署流程
- 移除边缘运行时配置
- 优化配置获取逻辑，简化 Node.js 运行时逻辑
- 更新组件路径并简化主题样式
- 移除不必要的图片远程模式配置
- 优化自定义鼠标的速度计算逻辑
- 更新部署分支为 `deploy`，后端分支从 `deploy` 更新为 `main`
- 精简 Node.js 引擎版本约束

### 移除

- 移除 Docker 版本的支持
- 移除 Docker 镜像构建和推送工作流
- 移除 `netlify.toml` 中的多余配置
- 移除 `wrangler` 配置文件

### 依赖

- 升级 `next` 从 15.3.1 → 16.2.6
- 升级 `wrangler` 从 4.51.0 → 4.59.1
- 升级 `postcss` 从 8.5.6 → 8.5.10

# 2.1.0 (2025-5-06)

### 新增

- 新增根据头像自动生成主题色功能
- 新增自定义光标组件
- 使用 View Transitions API 优化主题切换效果，增加视图过渡动画
- 新增移动设备支持和滑动事件处理
- 新增环境变量支持和配置初始化功能
- 增加 Cloudflare Pages 支持
- 增加 Avatar 来源白名单，支持开箱即用的 URL 形式 Avatar
- 增加示例用的简单 Docker Compose 配置文件
- 增加 Cloudflare Pages 部署教程文档

### 变更

- 重构配置管理结构，替换 `profile.json` 并更新相关逻辑
- 重组组件结构并更新配置
- 优化移动端显示效果
- 优化 Dockerfile
- 更新 Docker 部署说明，添加配置文件挂载选项
- 更新文档和配置，增强 Docker 部署说明及配置文件读取逻辑
- 工作流改进

### 修复

- 修复部署 Cloudflare Pages 失败的问题
- 修复若干 Bug

# 2.0.0 (2025-5-05)

### 新增

- 项目初始化，基于 Next.js + React + Tailwind CSS 构建
- 替换 Radix UI 为 Shadcn UI
- 优化主页布局和动画效果
- 添加 Dockerfile 和 GitHub Actions 工作流以构建和部署 Docker 镜像
- 更新 README，添加 Docker 部署说明
- 将配置文件提取到 `public` 目录下方便更改
- 合并 GitHub Action Workflow 以节省构建时间
- 构建用 Workflow 支持手动触发执行
