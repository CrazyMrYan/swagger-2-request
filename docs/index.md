---
layout: home

hero:
  name: "S2R"
  text: "Swagger to Request"
  tagline: 从 OpenAPI 文档快速生成 TypeScript API 客户端
  actions:
    - theme: brand
      text: 快速开始
      link: /getting-started
    - theme: alt
      text: 查看示例
      link: /example

features:
  - icon: 🎯
    title: 类型安全
    details: 自动生成 TypeScript 类型定义，完整的编译时检查
  - icon: 🚀
    title: 开箱即用
    details: 支持 OpenAPI 2.0-3.1，一条命令生成完整客户端
  - icon: 🎭
    title: Mock 服务
    details: 内置 Mock 服务器，集成 Swagger UI 界面
  - icon: 📦
    title: 一键发布
    details: 生成并发布 NPM 包，支持团队共享
---

## 快速体验

```bash
# 安装
npm install -g s2r

# 生成客户端
s2r generate https://petstore.swagger.io/v2/swagger.json

# 启动 Mock 服务
s2r mock https://petstore.swagger.io/v2/swagger.json
```