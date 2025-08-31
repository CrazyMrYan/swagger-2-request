---
layout: home

hero:
  name: "S2R"
  text: "Swagger to Request"
  tagline: 从 OpenAPI 文档生成类型安全的 TypeScript API 客户端
  actions:
    - theme: brand
      text: 快速开始
      link: /getting-started
    - theme: alt
      text: 查看示例
      link: /example

features:
  - icon: ⚡
    title: 快速集成
    details: 一条命令直接生成 API 客户端到项目中，立即开始使用
  - icon: 📦
    title: NPM 包发布
    details: 生成完整的 NPM 包项目，支持团队共享和版本管理
  - icon: 🎯
    title: 类型安全
    details: 完整的 TypeScript 支持，编译时错误检查，告别运行时错误
  - icon: 🛠️
    title: 开发友好
    details: 内置 Mock 服务器、拦截器支持、AI 文档生成等开发工具
---

# 为什么选择 S2R？

**S2R** 是专为现代 TypeScript 开发设计的 API 客户端生成器，帮助开发者从 Swagger/OpenAPI 文档快速生成类型安全的 API 客户端。

## 🎯 两种使用方式，满足不同需求

### 方式一：直接集成到项目

适合：**单个项目使用，快速开发**

```bash
# 直接生成到项目中
s2r generate https://api.example.com/swagger.json --output ./src/api

# 立即使用
import { userListGet, userPost } from './src/api';
const users = await userListGet();
```

**优势：**
- ⚡ 零配置，立即可用
- 🔄 支持增量更新
- 🎨 完全可定制

### 方式二：生成 NPM 包

适合：**多项目共享，团队协作**

```bash
# 创建 NPM 包项目
s2r create my-api-client https://api.example.com/swagger.json
cd my-api-client && npm publish

# 在其他项目中安装使用
npm install my-api-client
import { userListGet } from 'my-api-client';
```

**优势：**
- 📦 标准 NPM 包结构
- 🔄 版本管理和更新
- 👥 团队共享和复用

## ✨ 核心优势

- **🚀 零学习成本** - 支持 OpenAPI 2.0-3.1，一条命令搞定
- **🎯 类型安全** - 完整的 TypeScript 类型定义
- **🛠️ 开发体验** - Mock 服务器、拦截器、AI 文档
- **📈 生产就绪** - 错误处理、重试机制、性能优化