# GitHub Actions 工作流说明

## deploy-docs.yml

这个工作流用于自动部署 VitePress 文档到 GitHub Pages。

### 触发条件

- 推送到 `main` 或 `master` 分支且修改了 `docs/` 目录下的文件
- 对 `main` 或 `master` 分支创建 Pull Request 且修改了 `docs/` 目录下的文件
- 手动触发 (workflow_dispatch)

### 工作流程

1. **构建阶段**：
   - 检出代码
   - 设置 pnpm 和 Node.js 环境
   - 安装依赖
   - 构建 VitePress 文档
   - 上传构建产物

2. **部署阶段**（仅在推送到主分支时执行）：
   - 部署到 GitHub Pages

### 配置要求

1. **启用 GitHub Pages**：
   - 进入仓库设置 → Pages
   - Source 选择 "GitHub Actions"

2. **权限设置**：
   - 工作流已配置必要的权限
   - 确保仓库设置中允许 GitHub Actions 写入

### 访问地址

部署成功后，文档将在以下地址可访问：
`https://<username>.github.io/s2r/`

### 注意事项

- VitePress 配置中已设置 `base: '/s2r/'` 以适配 GitHub Pages
- 使用 pnpm 作为包管理器
- 支持 `lastUpdated` 功能（通过 `fetch-depth: 0` 获取完整历史）