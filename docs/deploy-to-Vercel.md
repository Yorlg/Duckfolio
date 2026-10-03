# Deploy To Vercel

Duckfolio 的 `/admin` 发布机制已经不依赖第三方 CMS。后台会通过服务端 API 读取环境变量，然后使用 GitHub Contents API 把文章写入目标仓库分支的 `posts/*.md`，把站点配置写入 `public/platform-config.json`。

## 必要条件

生产环境必须支持：

- Next.js Route Handlers，也就是 `/api/admin/*` 这些服务端接口。
- 服务端环境变量或密钥。
- 服务器端出站请求到 `api.github.com`。
- 部署平台监听 `GITHUB_BRANCH` 对应分支的提交并重新构建站点。

需要配置的环境变量：

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

`GITHUB_TOKEN` 建议使用 Fine-grained token，只给目标仓库 `Contents: Read and write` 权限。不要把这些值写进仓库，也不要放到 `NEXT_PUBLIC_*`。

## 配置步骤

1. 在 Vercel 导入 GitHub 仓库。
2. 把生产分支设置为你用于发布内容的分支，例如 `deploy`。
3. 在 Project Settings 的 Environment Variables 中配置上面的变量。
4. 构建命令使用 `pnpm build`，输出保持 Next.js 默认配置。

若要在 `/admin` 首页直接查看最近 30 天的 Web Analytics 数据，先在 Vercel 项目中启用 Web Analytics，再到 [Account Tokens](https://vercel.com/account/tokens) 创建 Vercel API Access Token（优先选择对应项目的 Scope），创建时复制一次性展示的值。在该项目的 Environment Variables 中将其保存为 `VERCEL_TOKEN`；这是本项目读取密钥的变量名，Vercel 不会自动生成或注入 token。在项目设置中启用 System Environment Variables 后，`VERCEL_PROJECT_ID` 会自动注入；否则手动配置。使用 Full Account 范围的 token 查询团队项目时还需配置 `VERCEL_TEAM_ID`；项目或团队范围的 token 通常可由 Vercel 根据 Scope 识别。不要使用 `NEXT_PUBLIC_` 前缀。未配置或请求失败时后台会显示明确错误，不会显示虚假的零值。

## 注意点

- 后台写入的是 `GITHUB_BRANCH`。如果 Vercel 生产分支仍是 `main`，文章会写到 `deploy`，但线上站点不会更新。
- Vercel 会对 Git 分支 push 和生产分支合并创建部署；所以后台提交到 `deploy` 后，项目也要监听并部署 `deploy`。
- 修改环境变量后需要重新部署，旧部署不会自动拿到新值。

## 参考

- https://vercel.com/docs/deployments/git
- https://vercel.com/docs/environment-variables
