

# 🦆 Duckfolio

**Duckfolio** 是一个简洁、现代、有趣的个人主页模板。

本项目旨在为开发者、设计师或创作者提供一个清爽、易于维护的在线名片，快速展示你的个人信息、社交链接与博客等内容。  
同时也展示了如何使用现代 Web 技术（Next.js、TailwindCSS、Shadcn UI 等）构建轻量级的静态网站。

---

## ✨ 项目特色

- 🚀 使用 **Next.js 16 + Turbopack**，极速开发体验
- 🎨 采用 **Tailwind CSS 4** 实现原子化、响应式布局
- 🌗 支持 **深色/浅色主题自动切换**
- 💫 利用 **Framer Motion** 增添自然平滑的过渡动画
- 🧩 使用 **Shadcn UI** 构建现代交互组件
- 🧠 通过 **Zustand** 管理全局状态（如主题）
- 📱 完全响应式，适配移动端和大屏设备
- 🧼 结构清晰，易于维护和定制

---

## 🖼️ 页面预览

### 首页 - Profile  
![Preview](https://blog.yorlg.it/wp-content/uploads/2025/05/Duckfolio-Profile.png)

### 链接页 - Links  
![Preview](https://blog.yorlg.it/wp-content/uploads/2025/05/Duckfolio-Links.png)

---

## 🛠️ 使用技术

| 技术                                                      | 用途         |
| --------------------------------------------------------- | ------------ |
| [Next.js](https://nextjs.org/)                            | 框架         |
| [Turbopack](https://turbo.build/pack)                     | 构建工具     |
| [Tailwind CSS](https://tailwindcss.com/)                  | 样式框架     |
| [Shadcn UI](https://ui.shadcn.com/ )                      | 无障碍组件库 |
| [Framer Motion](https://www.framer.com/motion/)           | 动画库       |
| [Zustand](https://github.com/pmndrs/zustand)              | 状态管理     |
| [next-themes](https://github.com/pacocoursey/next-themes) | 主题切换     |
| [Lucide Icons](https://lucide.dev/)                       | 图标         |

---

## 🚀 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/Yorlg/Duckfolio.git
cd duckfolio

# 安装依赖
pnpm install

# 项目打包
pnpm build

# 启动服务器
pnpm dev
```

本地访问：

- 站点首页：`http://localhost:3000`
- 管理后台：`http://localhost:3000/admin`

## 后台配置

真实密钥不要提交到仓库，也不要放到 `NEXT_PUBLIC_*` 变量里。生产环境请在部署平台的 Environment Variables / Secrets 中配置：

```bash
GITHUB_TOKEN=your_github_token
GITHUB_REPO=owner/repo
GITHUB_BRANCH=deploy
ADMIN_PASSWORD=your_admin_password
```

可选 AI 配置：

```bash
AI_GATEWAY_API_KEY=your_ai_api_key
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
```

说明：

- `GITHUB_BRANCH` 未配置时默认使用 `deploy`。
- `GITHUB_TOKEN` 建议使用 Fine-grained token，只给目标仓库 `Contents: Read and write` 权限。
- 没有 GitHub 写入配置时，后台不会在本地 `main` 工作区创建或删除 `posts` 目录。
- 本地开发可以复制 `.env.example` 为 `.env.local`，`.env*` 文件已被忽略，只有 `.env.example` 会提交。

## 发布机制

点击 `/admin` 的发布或更新后，服务端接口会把文章写入：

```text
posts/{slug}.md
```

文章文件会提交到 `GITHUB_REPO` 的 `GITHUB_BRANCH`。建议你自己使用 `deploy` 分支存放文章，这样别人 fork 或使用 `main` 分支时不会同步你的个人文章。

## 部署

当前支持 Vercel 和 ~~Cloudflare Workers~~。详细说明见：

- [docs/deploy-to-Vercel.md](docs/deploy-to-Vercel.md)
- ~~[docs/deploy-to-Cloudflare.md](docs/deploy-to-Cloudflare.md)~~

关键要求：

- 部署平台必须支持 Next.js 服务端 API。
- 生产分支应与 `GITHUB_BRANCH` 保持一致，例如都使用 `deploy`。
- ~~Cloudflare 不能使用纯静态导出，需要使用 Workers / OpenNext 方式部署。~~

## 常用命令

```bash
pnpm dev
pnpm build
pnpm start
```
