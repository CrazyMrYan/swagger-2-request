# S2R Petstore 示例

这是一个使用 s2r（swagger-2-request）工具的完整示例，展示了如何：

- 使用 s2r 从 Swagger/OpenAPI 文档生成 TypeScript API 客户端
- 在 Vue 3 + Ant Design Vue 应用中调用生成的 API
- 实现宠物管理功能（查看、添加宠物）

## 功能特性

- 📋 **宠物列表**：查看所有宠物，支持按状态筛选
- ➕ **添加宠物**：通过表单添加新宠物
- 🎨 **现代 UI**：使用 Ant Design Vue 组件库
- 🔧 **类型安全**：完整的 TypeScript 支持
- 🚀 **开发友好**：Vite 热重载开发体验

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 重新生成 API（可选）

如果需要更新 API 客户端：

```bash
npm run generate-api
```

## 项目结构

```
src/
├── api/                 # 生成的 API 客户端
│   ├── api.ts          # API 函数
│   ├── types.ts        # TypeScript 类型定义
│   ├── client.ts       # HTTP 客户端配置
│   └── index.ts        # 导出文件
├── App.vue             # 主应用组件
├── main.ts             # 应用入口
└── vite-env.d.ts       # Vite 类型声明
```

## 使用的技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Ant Design Vue** - 企业级 UI 组件库
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 快速的前端构建工具
- **s2r** - Swagger/OpenAPI 到 TypeScript 的代码生成器

## API 数据源

本示例使用 [Petstore API](https://petstore.swagger.io/v2/swagger.json) 作为数据源，这是一个标准的 Swagger 示例 API。

## 主要功能说明

### 宠物列表
- 支持查看所有宠物
- 可按状态筛选（可用、待定、已售）
- 显示宠物图片、名称、分类、状态和标签

### 添加宠物
- 表单验证
- 支持上传图片 URL
- 可设置宠物分类和标签
- 添加成功后自动刷新列表

## 开发说明

这个示例展示了如何在实际项目中使用 s2r 工具：

1. **API 生成**：使用 `s2r generate` 命令从 Swagger 文档生成类型安全的 API 客户端
2. **类型安全**：所有 API 调用都有完整的 TypeScript 类型支持
3. **错误处理**：包含完善的错误处理和用户反馈
4. **现代开发**：使用 Vue 3 Composition API 和现代前端开发最佳实践