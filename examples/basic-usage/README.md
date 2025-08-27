# 基础使用示例

这个示例展示了如何使用 Swagger-2-Request 工具生成和使用 TypeScript API 客户端。

## 步骤 1: 安装工具

```bash
# 全局安装 CLI 工具
npm install -g swagger-2-request

# 或者在项目中本地安装
npm install --save-dev swagger-2-request
```

## 步骤 2: 生成 API 客户端

```bash
# 从 Swagger JSON 文件生成 API 客户端
s2r generate ../petstore.json --output ./src/api

# 或者从远程 URL 生成
s2r generate https://petstore.swagger.io/v2/swagger.json --output ./src/api
```

生成后的目录结构：
```
src/api/
├── index.ts        # 主入口文件
├── types.ts        # TypeScript 类型定义
├── api.ts          # API 函数
├── client.ts       # API 客户端配置
└── utils.ts        # 工具函数
```

## 步骤 3: 使用生成的 API 客户端

### 基础用法

```typescript
import { petsGet, petsPost, petsPetIdGet } from './src/api';

// 获取宠物列表
async function getPets() {
  try {
    const pets = await petsGet({ limit: 10 });
    console.log('宠物列表:', pets);
  } catch (error) {
    console.error('获取失败:', error);
  }
}

// 创建新宠物
async function createPet() {
  try {
    const newPet = await petsPost({
      name: '小白',
      tag: '可爱'
    });
    console.log('创建成功:', newPet);
  } catch (error) {
    console.error('创建失败:', error);
  }
}

// 获取特定宠物
async function getPetById(id: string) {
  try {
    const pet = await petsPetIdGet(id);
    console.log('宠物信息:', pet);
  } catch (error) {
    console.error('获取失败:', error);
  }
}
```

### 使用客户端实例

```typescript
import { APIClient, createAPIClient } from './src/api';

// 使用默认客户端
import { apiClient } from './src/api';

// 配置认证
apiClient.setHeader('Authorization', 'Bearer your-token-here');

// 或者创建自定义客户端
const customClient = createAPIClient({
  baseURL: 'https://your-api.com',
  timeout: 30000,
  preset: 'production', // 使用生产环境预设
});
```

### 类型安全

```typescript
import type { Pet, NewPet, PetsGetParams } from './src/api';

// 类型安全的参数
const params: PetsGetParams = {
  limit: 20
};

// 类型安全的请求数据
const petData: NewPet = {
  name: '小黑',
  tag: '聪明'
};

// 类型安全的响应
const pets: Pet[] = await petsGet(params);
```

## 步骤 4: 高级配置

### 拦截器配置

```typescript
import { 
  createInterceptorConfig,
  createAuthInterceptor,
  createRetryInterceptor,
  createLogInterceptors
} from './src/api';

const client = new APIClient({
  baseURL: 'https://api.example.com',
  interceptors: createInterceptorConfig({
    auth: {
      type: 'bearer',
      token: 'your-jwt-token'
    },
    retry: {
      maxRetries: 3,
      delay: 1000,
      delayFactor: 2
    },
    logging: {
      logRequests: true,
      logResponses: true,
      level: 'info'
    }
  })
});
```

### 错误处理

```typescript
import { formatErrorMessage } from './src/api';

try {
  const result = await petsGet();
} catch (error) {
  // 使用内置的错误格式化
  const message = formatErrorMessage(error);
  console.error('API 错误:', message);
  
  // 或者自定义错误处理
  if (error.status === 401) {
    console.log('需要重新登录');
  } else if (error.status === 429) {
    console.log('请求过于频繁');
  }
}
```

## 步骤 5: 开发工具

### Mock 服务器

```bash
# 启动 Mock 服务器进行开发
s2r mock ../petstore.json --port 3001

# 访问 Swagger UI
open http://localhost:3001/docs
```

### AI 文档生成

```bash
# 生成 AI 友好文档
s2r ai-docs ../petstore.json --output ./docs/api-ai.md --preset developer
```

## 最佳实践

1. **环境配置**：根据不同环境使用不同的预设配置
2. **错误处理**：统一的错误处理策略
3. **类型安全**：充分利用 TypeScript 类型系统
4. **拦截器**：合理使用拦截器处理通用逻辑
5. **文档**：定期更新和维护 API 文档

## 常见问题

### Q: 如何更新 API 客户端？
A: 重新运行 `s2r generate` 命令即可更新生成的代码。

### Q: 如何自定义请求配置？
A: 通过 `options` 参数传入自定义配置：
```typescript
await petsGet(params, {
  timeout: 5000,
  headers: { 'X-Custom': 'value' }
});
```

### Q: 如何处理文件上传？
A: 生成的客户端支持 FormData：
```typescript
const formData = new FormData();
formData.append('file', file);
await uploadFile(formData);
```

## 下一步

- 查看 [拦截器示例](../interceptors-demo/) 了解高级功能
- 查看 [完整项目示例](../full-project/) 了解实际应用