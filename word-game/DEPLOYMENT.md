# 🚀 Vercel 部署指南

## 部署准备

### 1. 确保项目可以正常构建
```bash
npm run build
```

如果构建成功，你会看到 `build` 文件夹生成。

### 2. 测试本地构建版本（可选）
```bash
npx serve -s build -l 3000
```

## 方法一：通过 Vercel CLI（推荐）

### 1. 安装 Vercel CLI
```bash
npm install -g vercel
```

### 2. 登录 Vercel
```bash
vercel login
```
- 会打开浏览器或显示一个链接
- 使用你的 GitHub、GitLab 或 Google 账户登录

### 3. 部署项目
在项目根目录执行：
```bash
# 首次部署（预览版本）
vercel

# 部署到生产环境
vercel --prod

# 或使用我们配置的脚本
npm run deploy-preview  # 预览版本
npm run deploy         # 生产版本
```

### 4. 首次部署配置
首次部署时，Vercel 会询问：
- Set up and deploy "word-game"? → `Y`
- Which scope do you want to deploy to? → 选择你的账户
- Link to existing project? → `N`
- What's your project's name? → `word-game-gaokao` (或你喜欢的名字)
- In which directory is your code located? → `./` (当前目录)

## 方法二：通过 GitHub + Vercel Dashboard

### 1. 将代码推送到 GitHub
```bash
git init
git add .
git commit -m "Initial commit: 魂斗罗风格背单词应用"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/word-game-gaokao.git
git push -u origin main
```

### 2. 连接 Vercel
1. 访问 [vercel.com](https://vercel.com)
2. 用 GitHub 账户登录
3. 点击 "New Project"
4. 选择你的 GitHub 仓库
5. 配置项目设置：
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

### 3. 部署
点击 "Deploy" 按钮，Vercel 会自动：
- 安装依赖
- 运行构建
- 部署到 CDN

## 部署配置详解

### vercel.json 配置说明
```json
{
  "name": "word-game-gaokao",
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

这个配置确保：
- 使用 `@vercel/static-build` 构建器
- 输出目录为 `build`
- 正确处理 React Router 的路由（如果以后添加）
- 静态资源正确映射

### 环境变量（如果需要）
如果项目需要环境变量，在 Vercel Dashboard 中：
1. 进入项目设置
2. 点击 "Environment Variables"
3. 添加变量，例如：
   - `REACT_APP_VERSION`: `1.0.0`
   - `REACT_APP_BUILD_DATE`: `2024-01-01`

## 部署后的 URL

部署成功后，你会得到：
- **预览 URL**: `https://word-game-gaokao-git-main-username.vercel.app`
- **生产 URL**: `https://word-game-gaokao.vercel.app`

## 自定义域名

### 1. 在 Vercel Dashboard 中
1. 进入项目设置
2. 点击 "Domains"
3. 添加你的自定义域名
4. 按照提示配置 DNS

### 2. DNS 配置示例
如果你有域名 `mywordgame.com`：
- 添加 CNAME 记录：`www` → `cname.vercel-dns.com`
- 或添加 A 记录：`@` → `76.76.19.61`

## 持续部署

### GitHub 集成
一旦连接了 GitHub，每次推送到 `main` 分支都会自动部署到生产环境。

### 分支预览
- 推送到其他分支会创建预览部署
- 每个 Pull Request 都会有独立的预览 URL

## 性能优化

### 1. 构建优化
```bash
# 分析构建包大小
npm run build
npx bundle-analyzer build/static/js/*.js
```

### 2. Vercel 自动优化
Vercel 自动提供：
- 全球 CDN 分发
- 自动压缩（Gzip/Brotli）
- 图片优化
- 缓存优化

## 监控和分析

### 1. Vercel Analytics
在 Vercel Dashboard 中启用 Analytics 来监控：
- 页面访问量
- 性能指标
- 用户地理分布

### 2. 性能监控
应用已集成 `web-vitals`，会自动收集：
- Core Web Vitals
- 首次内容绘制（FCP）
- 最大内容绘制（LCP）
- 累积布局偏移（CLS）

## 故障排除

### 常见问题

1. **构建失败**
   ```bash
   # 检查本地构建
   npm run build
   
   # 检查依赖
   npm audit
   npm audit fix
   ```

2. **404 错误**
   - 确保 `vercel.json` 配置了路由重写
   - 检查静态文件路径

3. **样式问题**
   - 确保 CSS 文件正确导入
   - 检查字体文件是否正确加载

4. **LocalStorage 问题**
   - HTTPS 环境下 LocalStorage 工作正常
   - 确保错误处理正确实现

### 日志查看
```bash
# 查看部署日志
vercel logs YOUR_DEPLOYMENT_URL

# 实时日志
vercel logs --follow
```

## 成本估算

Vercel 免费计划包括：
- 100GB 带宽/月
- 无限静态网站
- 自动 HTTPS
- 全球 CDN

对于这个静态单词学习应用，免费计划完全足够。

## 部署清单

- [ ] 项目可以正常构建 (`npm run build`)
- [ ] 安装 Vercel CLI (`npm install -g vercel`)
- [ ] 登录 Vercel 账户 (`vercel login`)
- [ ] 配置项目名称和设置
- [ ] 部署到预览环境测试
- [ ] 部署到生产环境
- [ ] 测试所有功能正常工作
- [ ] 配置自定义域名（可选）
- [ ] 启用监控和分析（可选）

---

**祝你部署成功！** 🎉

如果遇到问题，可以查看 [Vercel 官方文档](https://vercel.com/docs) 或在项目 Issues 中提问。