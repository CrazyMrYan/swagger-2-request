# 快速开始

本指南将帮助您在几分钟内开始使用 S2R，从安装到生成第一个 API 客户端。

## 安装

### 全局安装 CLI

```bash
npm install -g s2r
```

### 在项目中安装

```bash
# npm
npm install --save-dev s2r

# pnpm
pnpm add -D s2r

# yarn
yarn add -D s2r
```

## 生成第一个 API 客户端

### 1. 使用公开的 Swagger 文档

```bash
# 使用 Petstore 示例 API
s2r generate https://petstore.swagger.io/v2/swagger.json --output ./src/api
```

### 2. 使用本地 Swagger 文件

```bash
s2r generate ./swagger.json --output ./src/api
```

### 3. 生成结果

生成后的目录结构：

```
src/api/
├── index.ts          # 主入口文件
├── types.ts          # TypeScript 类型定义
├── api.ts            # API 函数实现
├── client.ts         # API 客户端配置
└── utils.ts          # 工具函数
```

## 使用生成的代码

### 基础用法

```typescript
import { petGet, petPost, storeInventoryGet } from './src/api';
import type { Pet, ApiResponse } from './src/api/types';

// 获取宠物信息
const pet = await petGet('123');

// 创建新宠物
const newPet: Pet = {
  id: 1,
  name: 'fluffy',
  category: { id: 1, name: 'Dogs' },
  photoUrls: ['https://example.com/photo.jpg'],
  tags: [{ id: 1, name: 'friendly' }],
  status: 'available'
};

const response = await petPost(newPet);

// 获取库存信息
const inventory = await storeInventoryGet();
```

### 使用 API 客户端

```typescript
import { APIClient, apiClient } from './src/api';

// 使用默认客户端
const pets = await apiClient.request({
  method: 'GET',
  url: '/pet/findByStatus',
  params: { status: 'available' }
});

// 创建自定义客户端
const customClient = new APIClient({
  baseURL: 'https://my-api.example.com',
  timeout: 30000,
  headers: {
    'Authorization': 'Bearer your-token'
  }
});
```

## 验证生成结果

### 1. 检查类型定义

```typescript
import type { Pet, User, Order } from './src/api/types';

// 享受完整的类型提示和检查
const pet: Pet = {
  // IDE 会提供智能提示
};
```

### 2. 运行 TypeScript 检查

```bash
npx tsc --noEmit
```

### 3. 测试 API 调用

```typescript
// test.ts
import { petFindByStatusGet } from './src/api';

async function test() {
  try {
    const pets = await petFindByStatusGet(['available']);
    console.log('找到宠物数量:', pets.length);
  } catch (error) {
    console.error('API 调用失败:', error);
  }
}

test();
```

## 配置选项

### 使用命令行选项

```bash
# 清理输出目录
s2r generate ./swagger.json --output ./src/api --clean

# 仅生成类型定义
s2r generate ./swagger.json --output ./src/api --types-only

# 启用详细日志
s2r generate ./swagger.json --output ./src/api --verbose
```

### 使用配置文件

创建 `s2r.config.js`：

```javascript
export default {
  swagger: {
    source: './swagger.json'
  },
  generation: {
    outputDir: './src/api',
    typescript: true,
    functionNaming: 'pathMethod',
    includeComments: true,
    generateTypes: true,
    cleanOutput: true
  }
};
```

然后运行：

```bash
s2r generate --config ./s2r.config.js
```

## 常见问题

### Q: 生成的函数名如何确定？

A: 函数名基于 **路径 + HTTP 方法** 生成：
- `GET /pet/{petId}` → `petPetIdGet`
- `POST /user` → `userPost`
- `DELETE /store/order/{orderId}` → `storeOrderOrderIdDelete`

### Q: 如何处理路径参数？

A: 路径参数会作为函数的第一个参数：

```typescript
// GET /pet/{petId}
const pet = await petPetIdGet('123');

// DELETE /store/order/{orderId}
await storeOrderOrderIdDelete('456');
```

### Q: 如何处理查询参数？

A: 查询参数通过对象传递：

```typescript
// GET /pet/findByStatus?status=available
const pets = await petFindByStatusGet({ status: ['available'] });

// GET /pet/findByTags?tags=tag1,tag2
const pets = await petFindByTagsGet({ tags: ['tag1', 'tag2'] });
```

### Q: 生成的代码支持哪些功能？

A: 生成的代码包含：
- ✅ 完整的 TypeScript 类型定义
- ✅ 参数验证和过滤
- ✅ 错误处理
- ✅ 拦截器支持
- ✅ 自定义配置
- ✅ Tree-shaking 支持

## 下一步

恭喜！您已经成功生成了第一个 API 客户端。接下来您可以：

- [了解更多配置选项](./configuration.md)
- [学习拦截器系统](../advanced/interceptors.md)
- [查看完整示例项目](../examples/full-project.md)
- [启动 Mock 服务器](../examples/mock-server.md)