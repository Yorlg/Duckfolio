# 将 Duckfolio 部署到 Vercel

本文档将指导您将 Next.js 项目 [Duckfolio](https://github.com/Yorlg/Duckfolio) 部署到 Vercel，并确保切换至正确的 `deploy` 分支。

> ⚠️ **注意**：请确保您已拥有 GitHub 和 Vercel 账户。

## 部署步骤

### 1. Fork 仓库

- 访问 Duckfolio 的 GitHub 仓库。
- 点击右上角“Fork”按钮，将仓库复制到您的 GitHub 账户。

### 2. 切换到 `deploy` 分支

- 进入您 Fork 后的仓库页面。
- 点击分支切换器，选择并切换到 **`deploy`** 分支。

### 3. 修改配置文件

- 打开 `public/platform-config.json` 文件。
- 根据您的需求修改配置内容（例如用户名、社交链接等），并保存更改。

### 4. 登录 Vercel

- 访问 [Vercel](https://vercel.com/)。
- 点击右上角 **“Login”**，使用您的 GitHub 账户授权登录。

### 5. 创建新项目

- 登录后，在 Vercel 仪表板点击 **“New Project”**。
- 选择您 Fork 的 Duckfolio 仓库。
- 确保使用的是 `deploy` 分支，然后点击 **“Import”**。
- 保持默认配置（或根据需要修改），点击 **“Deploy”** 开始部署。

### 6. 部署完成与预览

* 部署完成后，您将获得一个 `.vercel.app` 的预览链接。
* 可以通过该链接访问您的 Duckfolio 页面。

### 7. 配置自定义域名

- 在 Vercel 项目仪表板中，点击项目进入设置。
- 进入 **“Domains”**（域名）选项卡。
- 添加您拥有的自定义域名，并根据提示完成 DNS 配置。

