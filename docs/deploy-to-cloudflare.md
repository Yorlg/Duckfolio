# 🚀 部署指南：将 Duckfolio 部署至 Cloudflare

本指南将帮助你将 Duckfolio 部署到 Cloudflare 网络。本项目利用 Cloudflare Workers 进行托管，并使用 R2 存储桶来加速数据读取。

> **ℹ️ 部署前说明：关于 R2 存储与额度**
>
> 本项目所使用的 OpenNext 要求必须使用 Cloudflare R2 存储服务。Cloudflare 为此提供了 10 GB 的存储额度，如果你之前没有接触过 R2，那么通常情况下你不需要担心超出额度而扣款，但是如果你有接触过 R2，请**务必**先检查一下是否仍有足够的免费额度部署 Duckfolio。在没有足够免费额度部署 Duckfolio 的情况下，可能会**产生存储费用**！  
>
> 因未及时检查而导致误扣款，本项目作者和相关贡献者概不负责。
> 
> 本项目大概会使用 5-50 MB 的 R2 存储。

---

## 🛠️ 准备工作

在开始之前，请确保你的电脑环境满足以下要求：
* 已安装 [Node.js](https://nodejs.org/)。
* 已安装 `pnpm` 包管理器。
* 拥有一个 [Cloudflare](https://dash.cloudflare.com/) 账号。

## 📝 部署步骤

### 第一步：登录 Cloudflare CLI

在项目根目录下打开终端，运行以下命令以授权本地工具访问你的 Cloudflare 账号：

```bash
pnpx wrangler login
```

*终端会弹出一个浏览器窗口，请点击“Allow”进行授权。授权成功后，终端会提示 `Successfully logged in`。*

### 第二步：创建 R2 存储桶

我们需要创建一个名为 `duckfolio-cache` 的存储桶来存放缓存数据。运行以下命令：

```bash
pnpx wrangler r2 bucket create duckfolio-cache
```

🚨 **重要提示：** 在运行该命令时，终端可能会询问你：
`Would you like Wrangler to add it on your behalf?`

请务必选择 **No**（按下 **N** 键）。
因为我们的配置文件 `wrangler.toml` 中已经预设好了绑定配置，不需要 Wrangler 自动修改文件，否则可能会导致配置冲突。

### 第三步：修改配置文件

找到项目目录下的 `public/platform-config.json` 文件，将你的公开信息填写到对应的栏位。

### 第四步：执行部署

确认配置无误后，运行以下命令将项目构建并发布到 Cloudflare：

```bash
pnpm run deploy
```

等待命令执行完毕，终端会输出一个访问链接（通常以 `*.workers.dev` 结尾）。

### 第五步：绑定域名（推荐）

默认的 `workers.dev` 链接可能不够个性化。你可以将其绑定到自己的域名，使其成为真正的个人主页：

1.  登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)，进入你刚才创建的 **Worker (duckfolio)** 详情页。
2.  点击顶部菜单的 **"Settings" (设置)** -> **"Triggers" (触发器)**。
3.  在 **"Custom Domains" (自定义域)** 区域，点击 "Add Custom Domain"。
4.  输入你想要使用的域名（例如 `yourname.com`）并保存。
    * *注意：该域名必须托管在 Cloudflare DNS 下才能自动生效。*

---

## 💡 给 Fork 用户的小建议

如果你是从 GitHub Fork 了本仓库：

建议你在完成 **第三步**（修改 `public/platform-config.json`）后，将改动 **Commit (提交)** 到你自己的 Fork 仓库中。

这样做的好处是：
1.  **保存配置：** 你的个性化配置会被保存下来，不会丢失。
2.  **方便更新：** 当原仓库（Upstream）更新代码时，你可以拉取更新，同时保留你自己的配置文件，只需处理简单的冲突即可。

---
