# 文档导航

> **注意**: 本文档已重新组织，请访问以下链接获取详细信息：

## 📖 文档指南

- **[配置指南](./configuration-guide.md)** - 详细的配置文件使用说明
- **[命令行指南](./cli-guide.md)** - 完整的 CLI 命令参考

## 🚀 快速开始

### 1. 安装 S2R

```bash
npm install -g s2r
```

### 2. 生成 API 客户端

```bash
# 从 URL 生成
s2r generate https://petstore.swagger.io/v2/swagger.json

# 从本地文件生成
s2r generate ./swagger.json --output ./src/api
```

### 3. 创建可发布的项目

```bash
# 创建完整的 NPM 包项目
s2r create my-api-client https://api.example.com/swagger.json
```

### 4. 启动 Mock 服务

```bash
# 启动 Mock 服务器
s2r mock swagger.json --port 3001
```

## 📚 更多资源

- [配置指南](./configuration-guide.md) - 学习如何配置 S2R
- [命令行指南](./cli-guide.md) - 掌握所有 CLI 命令
- [快速开始](./getting-started.md) - 新手入门教程
- [高级用法](./advanced.md) - 高级功能和最佳实践
- [示例项目](../examples/) - 完整的使用示例