# 基本用法

本文档详细介绍如何使用 S2R 生成的 API 客户端代码，包括函数调用、类型使用、错误处理等。

## 函数命名规则

S2R 使用 **路径 + HTTP 方法** 的命名规则生成函数名：

### 命名规则说明

| Swagger 定义 | 生成的函数名 | 说明 |
|--------------|-------------|------|
| `GET /pet/{petId}` | `petPetIdGet` | 路径转驼峰 + HTTP方法 |
| `POST /user` | `userPost` | 简单路径 + HTTP方法 |
| `PUT /pet` | `petPut` | 简单路径 + HTTP方法 |
| `DELETE /store/order/{orderId}` | `storeOrderOrderIdDelete` | 多级路径 + 参数 + HTTP方法 |
| `GET /api/v1/users` | `apiV1UsersGet` | 带版本的API路径 |

### 函数参数顺序

1. **路径参数**（如果有）
2. **请求体数据**（POST/PUT/PATCH）
3. **查询参数对象**（如果有）
4. **请求选项**（可选）

## 基本 API 调用

### GET 请求

```typescript
import { petPetIdGet, storeInventoryGet } from './src/api';

// 简单 GET 请求
const inventory = await storeInventoryGet();

// 带路径参数的 GET 请求
const pet = await petPetIdGet('123');

// 带查询参数的 GET 请求
const pets = await petFindByStatusGet({
  status: ['available', 'pending']
});
```

### POST 请求

```typescript
import { petPost, userPost } from './src/api';
import type { Pet, User } from './src/api/types';

// 创建宠物
const newPet: Pet = {
  id: 0,
  name: 'Fluffy',
  category: { id: 1, name: 'Dogs' },
  photoUrls: ['https://example.com/photo.jpg'],
  tags: [{ id: 1, name: 'friendly' }],
  status: 'available'
};

const createdPet = await petPost(newPet);

// 创建用户
const newUser: User = {
  id: 0,
  username: 'johndoe',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'password123',
  phone: '+1234567890',
  userStatus: 1
};

const result = await userPost(newUser);
```

### PUT 请求

```typescript
import { petPut } from './src/api';
import type { Pet } from './src/api/types';

// 更新宠物信息
const updatedPet: Pet = {
  id: 123,
  name: 'Fluffy Updated',
  category: { id: 1, name: 'Dogs' },
  photoUrls: ['https://example.com/updated-photo.jpg'],
  tags: [{ id: 1, name: 'friendly' }, { id: 2, name: 'playful' }],
  status: 'available'
};

const result = await petPut(updatedPet);
```

### DELETE 请求

```typescript
import { petPetIdDelete, storeOrderOrderIdDelete } from './src/api';

// 删除宠物
await petPetIdDelete('123');

// 删除订单
await storeOrderOrderIdDelete('456');
```

## 类型安全

### 使用生成的类型

```typescript
import type { 
  Pet, 
  User, 
  Order, 
  ApiResponse,
  PetStatus 
} from './src/api/types';

// 享受完整的类型提示
const pet: Pet = {
  id: 1,
  name: 'Buddy',
  category: {
    id: 1,
    name: 'Dogs'
  },
  photoUrls: ['url1', 'url2'],
  tags: [
    { id: 1, name: 'friendly' }
  ],
  status: 'available' as PetStatus // 枚举类型
};

// 类型检查
const validatePet = (pet: Pet): boolean => {
  return pet.name.length > 0 && pet.photoUrls.length > 0;
};
```

### 响应类型推断

```typescript
// 返回类型自动推断
const pets = await petFindByStatusGet(['available']); // pets: Pet[]
const pet = await petPetIdGet('123'); // pet: Pet
const inventory = await storeInventoryGet(); // inventory: Record<string, number>
```

## 错误处理

### 基本错误处理

```typescript
import { petPetIdGet, formatErrorMessage } from './src/api';

async function handleErrors() {
  try {
    const pet = await petPetIdGet('999999'); // 不存在的 ID
    console.log('Pet found:', pet);
  } catch (error: any) {
    if (error.response) {
      // HTTP 错误响应
      console.error('HTTP 错误:', error.response.status);
      console.error('错误数据:', error.response.data);
      
      // 使用格式化错误消息
      const message = formatErrorMessage(error);
      console.error('友好错误消息:', message);
      
    } else if (error.request) {
      // 网络错误
      console.error('网络错误:', error.message);
    } else {
      // 其他错误
      console.error('未知错误:', error.message);
    }
  }
}
```

### 特定状态码处理

```typescript
async function handleSpecificErrors() {
  try {
    const pet = await petPetIdGet('123');
  } catch (error: any) {
    switch (error.response?.status) {
      case 404:
        console.log('宠物不存在');
        break;
      case 401:
        console.log('需要身份验证');
        // 重定向到登录页面
        break;
      case 403:
        console.log('权限不足');
        break;
      case 500:
        console.log('服务器内部错误');
        break;
      default:
        console.log('其他错误:', error.message);
    }
  }
}
```

## 客户端配置

### 使用默认客户端

```typescript
import { apiClient } from './src/api';

// 设置全局基础 URL
apiClient.setBaseURL('https://api.example.com');

// 设置全局超时
apiClient.setTimeout(30000);

// 设置全局请求头
apiClient.setHeader('Authorization', 'Bearer your-token');
apiClient.setHeader('X-API-Version', 'v1');

// 批量设置请求头
apiClient.setHeaders({
  'Authorization': 'Bearer your-token',
  'X-API-Version': 'v1',
  'Content-Type': 'application/json'
});
```

### 创建自定义客户端

```typescript
import { APIClient } from './src/api';

// 创建生产环境客户端
const prodClient = new APIClient({
  baseURL: 'https://api.production.com',
  timeout: 30000,
  headers: {
    'Authorization': 'Bearer prod-token',
    'X-Environment': 'production'
  }
});

// 创建开发环境客户端
const devClient = new APIClient({
  baseURL: 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'X-Environment': 'development'
  }
});

// 使用特定客户端发送请求
const response = await devClient.request({
  method: 'GET',
  url: '/pet/123'
});
```

## 参数验证和过滤

S2R 生成的代码包含自动参数验证和过滤功能：

### 查询参数过滤

```typescript
// S2R 会自动过滤无效的查询参数
const pets = await petFindByStatusGet({
  status: ['available'],
  invalidParam: 'this-will-be-ignored', // 自动过滤
  limit: 10 // 如果 API 支持会保留
});
```

### 手动验证

```typescript
import { validateRequestData, filterQueryParams } from './src/api';

// 验证请求数据
const petData = {
  name: 'Test Pet',
  status: 'available',
  invalidField: 'test'
};

try {
  const validatedData = validateRequestData(petData);
  const pet = await petPost(validatedData);
} catch (error) {
  console.error('数据验证失败:', error);
}

// 手动过滤查询参数
const queryParams = {
  status: 'available',
  limit: 10,
  invalidParam: 'test'
};

const filteredParams = filterQueryParams(queryParams, [
  { name: 'status', type: 'string' },
  { name: 'limit', type: 'number' }
]);
// 结果: { status: 'available', limit: 10 }
```

## 高级用法

### 并发请求

```typescript
import { petPetIdGet, userUsernameGet } from './src/api';

// 并发获取多个资源
async function fetchMultipleResources() {
  try {
    const [pet, user] = await Promise.all([
      petPetIdGet('123'),
      userUsernameGet('johndoe')
    ]);
    
    console.log('Pet:', pet);
    console.log('User:', user);
  } catch (error) {
    console.error('获取资源失败:', error);
  }
}

// 批量处理
async function batchProcess() {
  const petIds = ['1', '2', '3', '4', '5'];
  
  try {
    const pets = await Promise.all(
      petIds.map(id => petPetIdGet(id))
    );
    
    console.log(`成功获取 ${pets.length} 只宠物`);
  } catch (error) {
    console.error('批量处理失败:', error);
  }
}
```

### 条件请求

```typescript
// 根据环境条件调用不同的 API
async function conditionalRequest() {
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // 开发环境使用 Mock 数据
    const pets = await petFindByStatusGet(['available']);
    return pets;
  } else {
    // 生产环境调用真实 API
    const pets = await petFindByStatusGet(['available', 'pending']);
    return pets;
  }
}
```

### 数据转换

```typescript
// 转换 API 响应为业务对象
function transformPetData(pet: Pet) {
  return {
    id: pet.id,
    displayName: pet.name,
    isAvailable: pet.status === 'available',
    categoryName: pet.category?.name || '未分类',
    tagNames: pet.tags?.map(tag => tag.name) || [],
    imageUrl: pet.photoUrls[0] || '/default-pet.jpg'
  };
}

async function getTransformedPets() {
  const pets = await petFindByStatusGet(['available']);
  return pets.map(transformPetData);
}
```

## 最佳实践

### 1. 错误处理策略

```typescript
// 创建通用的错误处理函数
async function apiCall<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (error: any) {
    // 记录错误
    console.error('API 调用失败:', error);
    
    // 根据错误类型处理
    if (error.response?.status === 401) {
      // 处理认证失败
      // 重定向到登录页面或刷新 token
    }
    
    return null;
  }
}

// 使用
const pet = await apiCall(() => petPetIdGet('123'));
if (pet) {
  console.log('获取成功:', pet);
}
```

### 2. 类型安全的选项传递

```typescript
// 创建类型安全的 API 选项
interface APIOptions {
  timeout?: number;
  retries?: number;
  cache?: boolean;
}

async function safePetGet(id: string, options: APIOptions = {}) {
  return petPetIdGet(id, {
    timeout: options.timeout || 10000,
    signal: options.cache ? undefined : new AbortController().signal
  });
}
```

### 3. 环境配置管理

```typescript
// config.ts
export const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:3001',
    timeout: 10000
  },
  production: {
    baseURL: 'https://api.production.com',
    timeout: 30000
  }
};

// 使用
const config = API_CONFIG[process.env.NODE_ENV as keyof typeof API_CONFIG];
apiClient.setBaseURL(config.baseURL);
apiClient.setTimeout(config.timeout);
```

通过这些基本用法，您可以充分利用 S2R 生成的 API 客户端代码，享受类型安全、自动参数验证和完善的错误处理功能。