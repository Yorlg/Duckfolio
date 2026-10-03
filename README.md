# Duckfolio

基于 Next.js 16 的个人主页、博客和内容管理后台。公开页面包括首页、友链、博客与项目；`/admin` 可编辑站点配置、管理文章和媒体。

## 功能

- 首页可在经典布局与极简名片间切换；站点名称、头像、简介、社交入口可在后台维护。
- 上传头像后提取主题色并写入配置，首屏直接使用该配色；支持浅色、深色主题和中英文切换。
- 博客支持草稿、Markdown 编辑与媒体上传；站点配置和文章可通过 GitHub Contents API 写入指定分支。
- 友链由站长在后台管理；项目分组可在后台编辑。
- Vercel Web Analytics 采集站点访问；后台概览可读取最近 30 天的访问数据（需另配 Vercel API token）。

## 环境要求与本地运行

- Node.js `>=22.22.1`
- pnpm `>=11`（项目使用 `pnpm@11.2.2`）

```bash
git clone https://github.com/Yorlg/Duckfolio.git
cd Duckfolio
pnpm install --frozen-lockfile
cp .env.example .env.local # Windows 可手动复制
pnpm dev
```

访问 `http://localhost:3000`；后台位于 `http://localhost:3000/admin`。`pnpm build` 构建，`pnpm start` 启动构建产物。

## 配置和发布文章

复制 `.env.example` 并在本地设置以下服务端变量；部署时改在平台环境变量中设置，**不要提交真实密钥**，也不要使用 `NEXT_PUBLIC_*` 前缀：

```dotenv
GITHUB_TOKEN=your_fine_grained_token
GITHUB_REPO=owner/repo
GITHUB_BRANCH=deploy
ADMIN_PASSWORD=your_admin_password
```

`GITHUB_TOKEN` 建议只授予目标仓库 `Contents: Read and write` 权限。后台写入 `GITHUB_BRANCH` 指定分支的 `posts/*.md` 和 `public/platform-config.json`；只有目标分支被部署时，线上内容才会更新。未配置 GitHub 写入时，后台仅允许本地保存配置和媒体，不会在本地工作区创建或删除文章。上传头像、Logo 限 PNG，最大 5 MB；上传头像后仍需保存站点配置。

默认资料在 `public/platform-config.json`，翻译词典在 `locales/zh-CN.yaml` 与 `locales/en.yaml`。站点自定义资料和文章正文不会自动翻译。

可选的 AI 和 Web Analytics 环境变量见 `.env.example` 与 [Vercel 部署指南](docs/deploy-to-Vercel.md)。**访问数据采集无需额外 token**；仅在 `/admin` 直接读取 Vercel Analytics 数据时需创建 Vercel Access Token 并配置 `VERCEL_TOKEN`。未配置时后台显示明确提示。

## 部署

[Vercel 部署指南](docs/deploy-to-Vercel.md)。站点依赖 Next.js 服务端 API，不是纯静态导出。推荐用 `deploy` 分支部署，将个人文章留在该分支；生产分支应与 `GITHUB_BRANCH` 对齐。

## Releases 与安全更新

[Releases](https://github.com/Yorlg/Duckfolio/releases) 由 `vX.Y.Z` 标签触发，版本必须与 `package.json` 和 `CHANGELOG.md` 的首条记录一致。仅发布 GitHub 自动生成的 **Source code (zip)** 与 **Source code (tar.gz)**，不上传额外资产。更新流程：先将变更合并到目标发布分支，再创建并推送对应版本标签；GitHub Actions 自动从该版本的 Changelog 提取说明并创建 Release。

依赖审查可使用 `pnpm --registry=https://registry.npmjs.org audit`。不要将 Dependabot PR 的标题等同于实际修复：合并前应检查锁文件中易受攻击的版本是否确实移除。`braces@3.0.3` 的 [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) 目前没有已发布的修复版本；继续跟踪上游，不通过虚假的版本覆盖或关闭警告声称修复。
