# 基础使用示例

本页面提供了 S2R 的基础使用示例，帮助您快速上手。

## 安装和配置

### 安装 S2R

```bash
# 全局安装
npm install -g s2r

# 项目安装
npm install --save-dev s2r
```

### 准备 Swagger 文档

您可以使用任何有效的 Swagger/OpenAPI 文档：

```bash
# 使用公开的 Petstore API
curl -o petstore.json https://petstore.swagger.io/v2/swagger.json

# 或者使用您自己的 API 文档
curl -o api.json https://your-api.com/swagger.json
```

## 代码生成

### 基础代码生成

```bash
# 生成到默认目录
s2r generate ./petstore.json

# 生成到指定目录
s2r generate ./petstore.json --output ./src/api

# 从 URL 生成
s2r generate https://petstore.swagger.io/v2/swagger.json --output ./src/api
```

### 生成结果

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

### 导入和基础使用

```typescript
// 导入 API 函数
import { 
  petGet, 
  petPost, 
  petPut, 
  petDelete,
  petFindByStatusGet,
  storeInventoryGet,
  userGet,
  userPost 
} from './src/api';

// 导入类型定义
import type { 
  Pet, 
  User, 
  Order, 
  ApiResponse 
} from './src/api/types';

// 导入客户端
import { APIClient, apiClient } from './src/api';
```

### Pet Store API 示例

#### 获取宠物信息

```typescript
async function getPetExample() {
  try {
    // 获取指定 ID 的宠物
    const pet = await petGet('1');
    console.log('宠物信息:', pet);
  } catch (error) {
    console.error('获取宠物失败:', error);
  }
}
```

#### 按状态查找宠物

```typescript
async function findPetsByStatus() {
  try {
    // 查找可用的宠物
    const availablePets = await petFindByStatusGet(['available']);
    console.log('可用宠物数量:', availablePets.length);
    
    // 查找已售出的宠物
    const soldPets = await petFindByStatusGet(['sold']);
    console.log('已售宠物数量:', soldPets.length);
  } catch (error) {
    console.error('查找宠物失败:', error);
  }
}
```

#### 创建新宠物

```typescript
async function createPetExample() {
  try {
    const newPet: Pet = {
      id: 0, // 通常由服务器分配
      name: 'Fluffy',
      category: {
        id: 1,
        name: 'Dogs'
      },
      photoUrls: ['https://example.com/photo1.jpg'],
      tags: [
        {
          id: 1,
          name: 'friendly'
        }
      ],
      status: 'available'
    };
    
    const createdPet = await petPost(newPet);
    console.log('创建的宠物:', createdPet);
  } catch (error) {
    console.error('创建宠物失败:', error);
  }
}
```

#### 更新宠物信息

```typescript
async function updatePetExample() {
  try {
    const updatedPet: Pet = {
      id: 1,
      name: 'Fluffy Updated',
      category: {
        id: 1,
        name: 'Dogs'
      },
      photoUrls: ['https://example.com/updated-photo.jpg'],
      tags: [
        {
          id: 1,
          name: 'friendly'
        },
        {
          id: 2,
          name: 'playful'
        }
      ],
      status: 'available'
    };
    
    const result = await petPut(updatedPet);
    console.log('更新结果:', result);
  } catch (error) {
    console.error('更新宠物失败:', error);
  }
}
```

#### 删除宠物

```typescript
async function deletePetExample() {
  try {
    await petDelete('1');
    console.log('宠物删除成功');
  } catch (error) {
    console.error('删除宠物失败:', error);
  }
}
```

### Store API 示例

#### 获取库存信息

```typescript
async function getStoreInventory() {
  try {
    const inventory = await storeInventoryGet();
    console.log('库存信息:', inventory);
    
    // 计算总数
    const totalPets = Object.values(inventory).reduce((sum, count) => sum + count, 0);
    console.log('宠物总数:', totalPets);
  } catch (error) {
    console.error('获取库存失败:', error);
  }
}
```

#### 下单购买

```typescript
async function placeOrder() {
  try {
    const order: Order = {
      id: 0,
      petId: 1,
      quantity: 1,
      shipDate: new Date().toISOString(),
      status: 'placed',
      complete: false
    };
    
    const placedOrder = await storeOrderPost(order);
    console.log('订单创建成功:', placedOrder);
  } catch (error) {
    console.error('下单失败:', error);
  }
}
```

### User API 示例

#### 创建用户

```typescript
async function createUserExample() {
  try {
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
    
    await userPost(newUser);
    console.log('用户创建成功');
  } catch (error) {
    console.error('创建用户失败:', error);
  }
}
```

#### 获取用户信息

```typescript
async function getUserExample() {
  try {
    const user = await userGet('johndoe');
    console.log('用户信息:', user);
  } catch (error) {
    console.error('获取用户失败:', error);
  }
}
```

## 客户端配置

### 使用默认客户端

```typescript
import { apiClient } from './src/api';

// 设置全局配置
apiClient.setBaseURL('https://petstore.swagger.io/v2');
apiClient.setTimeout(30000);
apiClient.setHeader('Authorization', 'Bearer your-token');

// 使用配置后的客户端调用 API
const pets = await petFindByStatusGet(['available']);
```

### 创建自定义客户端

```typescript
import { APIClient } from './src/api';

const customClient = new APIClient({
  baseURL: 'https://my-api.example.com',
  timeout: 15000,
  headers: {
    'Authorization': 'Bearer custom-token',
    'X-Custom-Header': 'value'
  }
});

// 使用自定义客户端
const response = await customClient.request({
  method: 'GET',
  url: '/custom-endpoint'
});
```

## 错误处理

### 基础错误处理

```typescript
async function handleErrors() {
  try {
    const pet = await petGet('999999'); // 不存在的 ID
  } catch (error: any) {
    if (error.response) {
      // HTTP 错误响应
      console.error('HTTP 错误:', error.response.status);
      console.error('错误消息:', error.response.data);
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

### 使用错误处理工具

```typescript
import { formatErrorMessage } from './src/api';

async function betterErrorHandling() {
  try {
    const pet = await petGet('invalid-id');
  } catch (error) {
    const message = formatErrorMessage(error);
    console.error('友好的错误消息:', message);
    
    // 根据错误类型处理
    if (error.response?.status === 404) {
      console.log('宠物不存在，可能已被删除');
    } else if (error.response?.status === 401) {
      console.log('需要登录认证');
    }
  }
}
```

## 参数验证

### 自动参数过滤

```typescript
// S2R 会自动过滤无效参数
const pets = await petFindByStatusGet({
  status: ['available'],
  invalidParam: 'this-will-be-filtered' // 这个参数会被自动过滤掉
});
```

### 使用验证工具

```typescript
import { validateRequestData } from './src/api';

async function validateExample() {
  try {
    const petData = {
      name: 'Test Pet',
      status: 'available',
      invalidField: 'test' // 会被验证器标记
    };
    
    const validatedData = validateRequestData(petData);
    const pet = await petPost(validatedData);
  } catch (error) {
    console.error('数据验证失败:', error);
  }
}
```

## TypeScript 类型支持

### 完整类型提示

```typescript
// 享受完整的 TypeScript 类型支持
const pet: Pet = {
  // IDE 会提供智能提示
  id: 1,
  name: '', // 必填字段
  category: {
    id: 1,
    name: ''
  },
  photoUrls: [], // 必填字段
  tags: [
    {
      id: 1,
      name: ''
    }
  ],
  status: 'available' // 枚举类型，只能是 'available' | 'pending' | 'sold'
};
```

### 泛型支持

```typescript
// API 响应类型
type PetResponse = ApiResponse<Pet>;
type PetListResponse = ApiResponse<Pet[]>;

// 使用泛型类型
async function typedResponse(): Promise<Pet[]> {
  const response = await petFindByStatusGet(['available']);
  return response; // 返回类型自动推断为 Pet[]
}
```

## 实用技巧

### 1. 批量操作

```typescript
async function batchOperations() {
  try {
    // 并发获取多个宠物
    const petIds = ['1', '2', '3'];
    const pets = await Promise.all(
      petIds.map(id => petGet(id))
    );
    
    console.log('获取到的宠物:', pets);
  } catch (error) {
    console.error('批量操作失败:', error);
  }
}
```

### 2. 条件查询

```typescript
async function conditionalQuery() {
  // 根据不同条件查询
  const status = process.env.NODE_ENV === 'development' 
    ? ['available', 'pending'] 
    : ['available'];
    
  const pets = await petFindByStatusGet(status);
  console.log(`找到 ${pets.length} 只宠物`);
}
```

### 3. 数据转换

```typescript
// 转换 API 数据为业务对象
function transformPetData(pet: Pet) {
  return {
    id: pet.id,
    displayName: pet.name,
    isAvailable: pet.status === 'available',
    categoryName: pet.category?.name || '未分类',
    tagNames: pet.tags?.map(tag => tag.name) || []
  };
}

async function getTransformedPets() {
  const pets = await petFindByStatusGet(['available']);
  const transformedPets = pets.map(transformPetData);
  return transformedPets;
}
```

## 环境配置

### 开发环境

```typescript
// development.ts
export const config = {
  baseURL: 'http://localhost:3001', // 本地 Mock 服务器
  timeout: 10000,
  debug: true
};
```

### 生产环境

```typescript
// production.ts
export const config = {
  baseURL: 'https://api.production.com',
  timeout: 30000,
  debug: false
};
```

### 动态配置

```typescript
import { APIClient } from './src/api';

const getConfig = () => {
  const isDev = process.env.NODE_ENV === 'development';
  
  return {
    baseURL: isDev 
      ? 'http://localhost:3001' 
      : 'https://api.production.com',
    timeout: isDev ? 10000 : 30000,
    headers: {
      'X-Environment': isDev ? 'development' : 'production'
    }
  };
};

const client = new APIClient(getConfig());
```

这些示例展示了 S2R 生成的代码的基础使用方法。通过这些示例，您可以快速开始使用生成的 API 客户端，并根据实际需求进行调整和扩展。