# 🚀 部署指南：将 Duckfolio 部署至 Netlify

本指南将帮助你将 Duckfolio 部署到 Netlify 平台。Netlify 提供简单快速的静态网站部署服务，并支持持续集成。

---

## 🛠️ 准备工作

在开始之前，请确保你已经：
* 拥有一个 [GitHub](https://github.com/) 账号
* 拥有一个 [Netlify](https://www.netlify.com/) 账号（可使用 GitHub 登录）
* 已 Fork 本项目到你的 GitHub 账户

---

## 📝 部署步骤

### 第一步：Fork 仓库

1. 访问 [Duckfolio GitHub 仓库](https://github.com/Yorlg/Duckfolio)
2. 点击右上角的 **"Fork"** 按钮，将仓库复制到你的 GitHub 账户

### 第二步：修改配置文件

1. 在你 Fork 的仓库中，找到 `public/platform-config.json` 文件
2. 修改其中的个人信息（用户名、头像、社交链接等）
3. 提交更改到你的仓库

### 第三步：连接 Netlify

1. 访问 [Netlify](https://app.netlify.com/)
2. 点击 **"Add new site"** → **"Import an existing project"**
3. 选择 **"GitHub"** 作为 Git 提供商
4. 授权 Netlify 访问你的 GitHub 账户
5. 从列表中选择你 Fork 的 **Duckfolio** 仓库

### 第四步：配置构建设置

在配置页面中：

- **Branch to deploy**: 选择 `main` 分支
- **Build command**: `pnpm build`（应该会自动检测）
- **Publish directory**: `.next`（应该会自动检测）

点击 **"Deploy site"** 开始部署。

### 第五步：等待部署完成

- Netlify 会自动开始构建和部署你的网站
- 构建过程通常需要 2-5 分钟
- 完成后，你会获得一个 `.netlify.app` 的访问链接

### 第六步：配置自定义域名（可选）

如果你有自己的域名：

1. 在 Netlify 项目页面，进入 **"Domain settings"**
2. 点击 **"Add custom domain"**
3. 输入你的域名并按照指示配置 DNS 记录
4. Netlify 会自动为你的域名配置 HTTPS 证书

---

## 🔄 自动部署

配置完成后，每次你向 GitHub 仓库的 `main` 分支推送更改时，Netlify 都会自动重新构建和部署你的网站。

---

## ⚙️ 环境变量（如果需要）

如果你的项目需要环境变量：

1. 在 Netlify 项目页面，进入 **"Site configuration"** → **"Environment variables"**
2. 点击 **"Add a variable"**
3. 添加所需的环境变量

---

## 🐛 常见问题

### 构建失败

如果构建失败，请检查：
- 确保使用的是 Node.js 20.x 或更高版本
- 检查 `package.json` 中的依赖是否正确
- 查看构建日志以获取详细错误信息

### 页面显示 404

确保：
- **Publish directory** 设置为 `.next`
- 已正确配置 `netlify.toml` 文件
- 检查路由重定向规则

---

## 📚 更多资源

- [Netlify 官方文档](https://docs.netlify.com/)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Duckfolio GitHub 仓库](https://github.com/Yorlg/Duckfolio)

---
