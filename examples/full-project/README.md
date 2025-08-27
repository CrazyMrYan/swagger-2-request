# 完整项目示例

这是一个完整的 PetStore API 客户端项目示例，展示了如何在真实项目中使用 Swagger-2-Request 工具生成和使用 TypeScript API 客户端。

## 🚀 快速开始

### 1. 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

### 2. 生成 API 客户端

```bash
# 从 PetStore Swagger JSON 生成 API 客户端
pnpm run generate

# 这会在 src/api/ 目录下生成以下文件：
# ├── index.ts     - 主入口文件
# ├── types.ts     - TypeScript 类型定义
# ├── api.ts       - API 函数
# ├── client.ts    - API 客户端配置
# └── utils.ts     - 工具函数
```

### 3. 运行示例

```bash
# 开发模式运行（带热重载）
pnpm run dev

# 构建并运行
pnpm run build
pnpm start
```

### 4. 启动 Mock 服务器

```bash
# 启动 Mock 服务器用于开发和测试
pnpm run mock

# 访问 Swagger UI
open http://localhost:3001/docs
```

### 5. 运行测试

```bash
# 运行所有测试
pnpm run test

# 运行测试并查看覆盖率
pnpm run test --coverage

# 监控模式运行测试
pnpm run test --watch
```

## 📁 项目结构

```
full-project/
├── src/
│   ├── api/                 # 生成的 API 客户端（通过 s2r generate 生成）
│   │   ├── index.ts         # 主入口，导出所有 API 函数和类型
│   │   ├── types.ts         # TypeScript 类型定义
│   │   ├── api.ts           # API 函数实现
│   │   ├── client.ts        # API 客户端类
│   │   └── utils.ts         # 工具函数
│   ├── tests/               # 测试文件
│   │   ├── setup.ts         # 测试环境设置
│   │   └── index.test.ts    # 主要测试文件
│   └── index.ts             # 项目主入口
├── dist/                    # 构建输出目录
├── package.json             # 项目配置
├── tsconfig.json            # TypeScript 配置
├── vitest.config.ts         # 测试配置
├── .eslintrc.js             # ESLint 配置
├── .gitignore               # Git 忽略文件
└── README.md                # 项目说明
```

## 💡 核心功能演示

### 1. 基础 API 使用

```typescript
import { petsGet, petsPost, petsPetIdGet } from './api';

// 获取宠物列表
const pets = await petsGet({ limit: 10 });

// 创建新宠物
const newPet = await petsPost({
  name: '小白',
  tag: '可爱'
});

// 获取指定宠物
const pet = await petsPetIdGet('123');
```

### 2. 客户端实例使用

```typescript
import { APIClient, createAPIClient } from './api';

// 使用默认客户端
import { apiClient } from './api';
apiClient.setHeader('Authorization', 'Bearer your-token');

// 创建自定义客户端
const client = createAPIClient({
  baseURL: 'https://api.example.com',
  preset: 'production'
});
```

### 3. 拦截器配置

```typescript
import { 
  createAuthInterceptor,
  createRetryInterceptor,
  createLogInterceptors,
  createErrorHandlerInterceptor
} from './api';

const client = new APIClient({
  interceptors: {
    request: [
      createAuthInterceptor({
        type: 'bearer',
        token: 'your-token'
      }),
      createLogInterceptors({ logRequests: true }).request
    ],
    response: [
      createRetryInterceptor({
        maxRetries: 3,
        delay: 1000
      }),
      createErrorHandlerInterceptor({
        enableTransform: true
      })
    ]
  }
});
```

## 📊 服务类示例

### PetStoreService - 基础服务

提供基础的 PetStore API 操作：

- ✅ **getAllPets()** - 获取宠物列表
- ✅ **createPet()** - 创建新宠物
- ✅ **getPetById()** - 获取指定宠物
- ✅ **batchOperations()** - 批量操作演示

### AdvancedPetStoreService - 高级服务

展示高级功能和配置：

- 🔐 **自定义认证拦截器**
- 🔄 **智能重试机制**
- 📝 **详细日志记录**
- ❌ **统一错误处理**
- 📊 **性能监控**

## 🧪 测试覆盖

项目包含完整的测试套件：

- **单元测试** - 测试各个服务方法
- **集成测试** - 测试服务初始化和配置
- **性能测试** - 验证响应时间
- **错误处理测试** - 测试各种错误场景
- **Mock 测试** - 使用 Vitest Mock 功能

### 测试命令

```bash
# 运行所有测试
pnpm test

# 运行特定测试文件
pnpm test src/tests/index.test.ts

# 查看测试覆盖率
pnpm test --coverage

# 监控模式
pnpm test --watch
```

## 🛠️ 开发工具

### 代码质量

- **TypeScript** - 类型安全
- **ESLint** - 代码检查
- **Prettier** - 代码格式化（可选添加）

### 测试工具

- **Vitest** - 现代测试框架
- **Coverage** - 测试覆盖率报告
- **Mock** - API Mock 功能

### 构建工具

- **TSC** - TypeScript 编译器
- **TSX** - 开发时热重载

## 🔧 配置说明

### 环境变量

```bash
# API 基础 URL
API_BASE_URL=https://petstore.swagger.io/v2

# 认证 Token
AUTH_TOKEN=your-auth-token-here

# 运行环境
NODE_ENV=development
```

### 预设配置

项目支持多种环境预设：

- **development** - 开发环境（详细日志 + 错误处理）
- **production** - 生产环境（基础功能 + 错误监控）
- **testing** - 测试环境（快速重试 + 详细日志）
- **minimal** - 最小化配置（仅基础功能）

## 📈 性能优化

### 1. 请求优化

- **连接池复用** - 减少连接开销
- **请求压缩** - 减少传输大小
- **超时控制** - 避免长时间等待

### 2. 重试策略

- **指数退避** - 智能重试间隔
- **条件重试** - 仅对特定错误重试
- **最大重试次数** - 避免无限重试

### 3. 缓存策略

- **响应缓存** - 缓存常用数据
- **请求去重** - 避免重复请求
- **过期控制** - 自动清理过期缓存

## 🚨 错误处理

### 标准化错误格式

```typescript
interface StandardError {
  code: string;
  message: string;
  status: number;
  timestamp: string;
  details?: any;
}
```

### 错误分类处理

- **网络错误** - 连接超时、DNS 解析失败等
- **HTTP 错误** - 4xx、5xx 状态码
- **业务错误** - API 返回的业务异常
- **客户端错误** - 参数验证、类型错误等

## 📚 最佳实践

### 1. 类型安全

```typescript
// ✅ 使用生成的类型
import type { Pet, NewPet } from './api';

const pet: Pet = await petsGet();
const newPet: NewPet = { name: '小白', tag: '可爱' };
```

### 2. 错误处理

```typescript
// ✅ 统一错误处理
try {
  const result = await petsGet();
} catch (error) {
  console.error('API 调用失败:', formatErrorMessage(error));
}
```

### 3. 配置管理

```typescript
// ✅ 环境化配置
const config = {
  baseURL: process.env.API_BASE_URL,
  preset: process.env.NODE_ENV === 'production' ? 'production' : 'development'
};
```

## 🔗 相关资源

- [基础使用示例](../basic-usage/) - 入门级使用方法
- [拦截器演示](../interceptors-demo/) - 拦截器详细说明
- [Swagger-2-Request 文档](../../docs/) - 完整工具文档
- [PetStore API 文档](https://petstore.swagger.io/) - 测试 API 说明

## ❓ 常见问题

### Q: 如何更新生成的 API 客户端？

A: 重新运行生成命令：

```bash
pnpm run generate
```

### Q: 如何自定义 API 请求配置？

A: 通过 options 参数：

```typescript
await petsGet(params, {
  timeout: 5000,
  headers: { 'X-Custom': 'value' }
});
```

### Q: 如何处理文件上传？

A: 使用 FormData：

```typescript
const formData = new FormData();
formData.append('file', file);
await uploadFile(formData);
```

### Q: 如何在不同环境使用不同配置？

A: 使用环境变量和预设：

```typescript
const preset = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const client = createAPIClient({ preset });
```

## 🎯 下一步

1. **自定义扩展** - 根据项目需求扩展功能
2. **性能监控** - 集成 APM 工具监控 API 性能
3. **缓存策略** - 实现合适的缓存机制
4. **错误监控** - 集成错误追踪服务
5. **文档维护** - 定期更新 API 文档

通过这个完整示例，你可以快速了解如何在真实项目中使用 Swagger-2-Request 工具，并根据自己的需求进行定制和扩展。