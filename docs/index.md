---
layout: home

hero:
  name: "S2R"
  text: "Swagger to Request"
  tagline: 从 Swagger/OpenAPI 2.0-3.1 文档自动生成 TypeScript API 客户端
  image:
    src: /logo.svg
    alt: S2R
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/basic-usage

features:
  - icon: 🎯
    title: 类型安全
    details: 自动生成完整的 TypeScript 类型定义，提供编译时类型检查和智能代码提示
  - icon: 🚀
    title: 全版本支持
    details: 完整支持 OpenAPI 2.0、3.0、3.1 所有版本，智能版本检测和解析
  - icon: 🔧
    title: 强大拦截器
    details: 内置认证、重试、日志、错误处理等拦截器，支持自定义扩展
  - icon: 🎭
    title: Mock 服务器
    details: 集成 Swagger UI 的 Mock 服务器，支持自定义响应和延迟模拟
  - icon: 📦
    title: NPM 包发布
    details: 一键生成并发布 NPM 包，支持多种格式和自定义配置
  - icon: 🤖
    title: AI 友好文档
    details: 转换为 LLM 优化的文档格式，提升 AI 理解和处理能力
  - icon: ⚡
    title: 智能命名
    details: 基于 URL + HTTP Method 的智能命名规则，代码可读性更强
  - icon: 🛡️
    title: 参数验证
    details: 基于 API 定义的自动参数验证和过滤，确保请求数据正确性
---

## 为什么选择 S2R？

S2R 是一个现代化的 API 客户端生成工具，专为 TypeScript 开发者设计。它不仅能生成类型安全的 API 客户端代码，还提供了完整的开发工具链。

### 🎯 开发体验优先

- **智能代码生成**: 自动生成符合 TypeScript 最佳实践的代码
- **完整类型支持**: 从参数到响应的全链路类型安全
- **IDE 友好**: 完美的代码提示和自动补全支持

### 🔧 生产级特性

- **拦截器系统**: 认证、重试、日志、错误处理一应俱全
- **配置驱动**: 灵活的配置系统，适应各种项目需求
- **扩展性强**: 支持自定义拦截器和模板

### 🚀 现代化工具链

- **多格式输出**: ESM、CJS、UMD 多种模块格式
- **构建集成**: 无缝集成现代构建工具
- **CI/CD 友好**: 完善的 CLI 工具支持自动化流程

## 快速体验

```bash
# 安装 CLI 工具
npm install -g s2r

# 生成 API 客户端
s2r generate https://petstore.swagger.io/v2/swagger.json --output ./src/api

# 启动 Mock 服务器
s2r mock https://petstore.swagger.io/v2/swagger.json --port 3001
```

## 社区与支持

<div style="display: flex; gap: 12px; margin-top: 24px;">
  <a href="https://github.com/CrazyMrYan/s2r" target="_blank">
    <img src="https://img.shields.io/github/stars/CrazyMrYan/s2r?style=social" alt="GitHub Stars">
  </a>
  <a href="https://github.com/CrazyMrYan/s2r/blob/main/LICENSE" target="_blank">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License">
  </a>
  <a href="https://www.npmjs.com/package/s2r" target="_blank">
    <img src="https://img.shields.io/npm/v/s2r.svg" alt="NPM Version">
  </a>
</div>