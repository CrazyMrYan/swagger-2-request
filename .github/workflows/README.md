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

**重要：使用前必须手动配置以下设置**

1. **启用 GitHub Pages**：
   - 进入仓库设置 → Pages
   - Source 选择 "GitHub Actions"
   - 点击保存

2. **配置 Actions 权限**：
   - 进入仓库设置 → Actions → General
   - 在 "Workflow permissions" 部分选择 "Read and write permissions"
   - 勾选 "Allow GitHub Actions to create and approve pull requests"
   - 点击保存

3. **验证权限设置**：
   - 确保工作流有 `contents: read`、`pages: write`、`id-token: write` 权限
   - 这些权限已在工作流文件中预配置

### 访问地址

部署成功后，文档将在以下地址可访问：
`https://<username>.github.io/s2r/`

### 注意事项

- VitePress 配置中已设置 `base: '/s2r/'` 以适配 GitHub Pages
- 使用 pnpm 作为包管理器
- 支持 `lastUpdated` 功能（通过 `fetch-depth: 0` 获取完整历史）

### 故障排除

#### 常见错误及解决方案

**1. "Resource not accessible by integration" 错误**：
- 进入仓库设置 → Actions → General
- 将 "Workflow permissions" 改为 "Read and write permissions"
- 勾选 "Allow GitHub Actions to create and approve pull requests"
- 重新运行工作流

**2. "Get Pages site failed" 错误**：
- 确保你有仓库的管理员权限
- 手动启用 Pages：设置 → Pages → Source 选择 "GitHub Actions"
- 保存设置后重新运行工作流

**3. "HttpError: Not Found" 错误**：
- 检查仓库是否为公开仓库（私有仓库需要 GitHub Pro）
- 确认仓库名称和分支名称正确
- 验证 VitePress 配置中的 base 路径设置

**4. 部署成功但页面无法访问**：
- 检查 VitePress 配置中的 `base` 设置是否正确
- 确认 GitHub Pages 域名格式：`https://username.github.io/repository-name/`