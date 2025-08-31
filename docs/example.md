# 完整示例

本页面提供了 S2R 在实际项目中的完整使用示例，展示两种主要使用场景的最佳实践。

## 📦 场景一：项目直接集成

### React + TypeScript 项目

**1. 项目结构**
```
my-react-app/
├── src/
│   ├── api/           # S2R 生成的 API 客户端
│   ├── components/
│   ├── hooks/         # 自定义 API hooks
│   └── utils/
├── .s2r.json         # S2R 配置文件
└── package.json
```

**2. 配置文件 `.s2r.json`**
```json
{
  "swagger": {
    "source": "https://api.myapp.com/swagger.json"
  },
  "generation": {
    "outputDir": "./src/api",
    "typescript": true,
    "clientName": "ApiClient"
  },
  "request": {
    "baseURL": "https://api.myapp.com",
    "timeout": 10000
  }
}
```

**3. 生成 API 客户端**
```bash
# 生成 API 客户端
s2r generate

# 添加到 package.json scripts
npm pkg set scripts.api:generate="s2r generate"
npm pkg set scripts.api:generate:clean="s2r generate --clean"
```

**4. 创建 API hooks**
```typescript
// src/hooks/useApi.ts
import { useState, useEffect } from 'react';
import { userListGet, userCreatePost } from '../api';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await userListGet();
        setUsers(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const createUser = async (userData) => {
    try {
      const response = await userCreatePost({ data: userData });
      setUsers(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  return { users, loading, error, createUser };
};
```

**5. 在组件中使用**
```tsx
// src/components/UserList.tsx
import React from 'react';
import { useUsers } from '../hooks/useApi';

const UserList: React.FC = () => {
  const { users, loading, error, createUser } = useUsers();

  const handleCreateUser = async () => {
    try {
      await createUser({
        name: 'New User',
        email: 'user@example.com'
      });
      alert('用户创建成功！');
    } catch (error) {
      alert('创建失败：' + error.message);
    }
  };

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误：{error.message}</div>;

  return (
    <div>
      <h2>用户列表</h2>
      <button onClick={handleCreateUser}>创建用户</button>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name} - {user.email}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
```

## 🏗️ 场景二：NPM 包发布与使用

### 创建和发布 NPM 包

**1. 创建 NPM 包项目**
```bash
# 创建 API 客户端包
s2r create my-company-api https://api.company.com/swagger.json \
  --name @company/api-client \
  --version 1.0.0 \
  --description "Company API Client" \
  --author "Your Name <your.email@company.com>"

cd my-company-api
```

**2. 生成的项目结构**
```
my-company-api/
├── src/
│   ├── api/           # 生成的 API 函数
│   ├── types/         # TypeScript 类型定义
│   ├── client.ts      # HTTP 客户端配置
│   └── index.ts       # 导出入口
├── dist/              # 构建输出
├── package.json       # 包配置
├── tsconfig.json      # TypeScript 配置
├── .s2r.json         # S2R 配置
└── README.md          # 使用文档
```

**3. 自定义包配置**
```json
// package.json
{
  "name": "@company/api-client",
  "version": "1.0.0",
  "description": "Company API Client",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "api:update": "s2r generate && npm run build",
    "prepublishOnly": "npm run build"
  },
  "peerDependencies": {
    "axios": "^1.0.0"
  }
}
```

**4. 构建和发布**
```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 发布到 NPM
npm publish

# 发布到私有注册表
npm publish --registry https://npm.company.com
```

### 在多个项目中使用 NPM 包

**项目 A：React 管理后台**
```bash
# 安装 API 客户端包
npm install @company/api-client axios
```

```tsx
// src/services/api.ts
import { userListGet, userCreatePost, apiClient } from '@company/api-client';

// 配置 API 客户端
apiClient.setBaseURL(process.env.REACT_APP_API_URL);
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 导出配置好的 API 函数
export { userListGet, userCreatePost };
```

```tsx
// src/pages/UserManagement.tsx
import React, { useState, useEffect } from 'react';
import { userListGet, userCreatePost } from '../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await userListGet();
        setUsers(response.data);
      } catch (error) {
        console.error('加载用户失败:', error);
      }
    };
    
    loadUsers();
  }, []);
  
  return (
    <div>
      <h1>用户管理</h1>
      {/* 用户列表组件 */}
    </div>
  );
};

export default UserManagement;
```

**项目 B：Vue 移动端应用**
```bash
# 安装 API 客户端包
npm install @company/api-client axios
```

```typescript
// src/composables/useApi.ts
import { ref } from 'vue';
import { productListGet, orderCreatePost, apiClient } from '@company/api-client';

// 配置移动端 API
apiClient.setBaseURL(process.env.VUE_APP_API_URL);
apiClient.defaults.timeout = 5000; // 移动端较短超时时间

export const useProducts = () => {
  const products = ref([]);
  const loading = ref(false);
  
  const fetchProducts = async () => {
    loading.value = true;
    try {
      const response = await productListGet();
      products.value = response.data;
    } catch (error) {
      console.error('获取商品失败:', error);
    } finally {
      loading.value = false;
    }
  };
  
  return { products, loading, fetchProducts };
};
```

**项目 C：Node.js 后端服务**
```bash
# 安装 API 客户端包
npm install @company/api-client axios
```

```typescript
// src/services/externalApi.ts
import { reportDataGet, syncDataPost, apiClient } from '@company/api-client';

// 配置服务端 API
apiClient.setBaseURL(process.env.EXTERNAL_API_URL);
apiClient.defaults.headers.common['User-Agent'] = 'Internal-Service/1.0';

// 定时同步数据
export const syncExternalData = async () => {
  try {
    const reportData = await reportDataGet({ 
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    });
    
    // 处理数据并同步到内部系统
    await syncDataPost({ data: reportData.data });
    
    console.log('数据同步成功');
  } catch (error) {
    console.error('数据同步失败:', error);
    throw error;
  }
};
```

## ⚙️ 高级配置

### 客户端配置

```typescript
import { apiClient } from './src/api';

// 设置基础配置
apiClient.setBaseURL('https://api.example.com');
apiClient.setHeader('Authorization', 'Bearer your-token');
apiClient.setTimeout(10000); // 10秒超时

// 设置请求拦截器
apiClient.interceptors.request.use((config) => {
  console.log('发送请求:', config.url);
  return config;
});

// 设置响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    console.log('收到响应:', response.status);
    return response;
  },
  (error) => {
    console.error('请求失败:', error.message);
    return Promise.reject(error);
  }
);
```

### 错误处理最佳实践

```typescript
import { ApiError } from './src/api/types';

// 统一错误处理
const handleApiError = (error: any) => {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        console.error('认证失败，请重新登录');
        // 跳转到登录页
        break;
      case 403:
        console.error('权限不足');
        break;
      case 404:
        console.error('资源不存在');
        break;
      case 500:
        console.error('服务器内部错误');
        break;
      default:
        console.error('API 调用失败:', error.message);
    }
  } else {
    console.error('网络错误:', error.message);
  }
};

// 在业务代码中使用
try {
  const pets = await petFindByStatusGet({ status: 'available' });
} catch (error) {
  handleApiError(error);
}
```

## 🧪 Mock 服务

### 启动 Mock 服务器

```bash
# 基础启动
s2r mock https://petstore.swagger.io/v2/swagger.json

# 指定端口和配置
s2r mock ./swagger.json --port 3001 --cors --delay 500

# 使用自定义 Mock 数据
s2r mock ./swagger.json --mock-data ./mock-data.json
```

### Mock 数据配置

```json
{
  "Pet": {
    "id": "{{random.number}}",
    "name": "{{random.words}}",
    "status": "{{random.arrayElement(['available', 'pending', 'sold']}}",
    "photoUrls": ["{{image.imageUrl}}"]
  }
}
```

## 📦 在不同框架中使用

### React 项目

```typescript
import React, { useEffect, useState } from 'react';
import { petFindByStatusGet } from './api';
import type { Pet } from './api/types';

const PetList: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const result = await petFindByStatusGet({ status: 'available' });
        setPets(result);
      } catch (error) {
        console.error('获取宠物列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  if (loading) return <div>加载中...</div>;

  return (
    <div>
      {pets.map(pet => (
        <div key={pet.id}>
          <h3>{pet.name}</h3>
          <p>状态: {pet.status}</p>
        </div>
      ))}
    </div>
  );
};
```

### Vue 项目

```vue
<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else>
      <div v-for="pet in pets" :key="pet.id" class="pet-item">
        <h3>{{ pet.name }}</h3>
        <p>状态: {{ pet.status }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { petFindByStatusGet } from './api';
import type { Pet } from './api/types';

const pets = ref<Pet[]>([]);
const loading = ref(true);

const fetchPets = async () => {
  try {
    const result = await petFindByStatusGet({ status: 'available' });
    pets.value = result;
  } catch (error) {
    console.error('获取宠物列表失败:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchPets);
</script>
```

### Node.js 后端

```typescript
import express from 'express';
import { petFindByStatusGet, petPost } from './api';

const app = express();
app.use(express.json());

// 代理 API 请求
app.get('/api/pets', async (req, res) => {
  try {
    const { status } = req.query;
    const pets = await petFindByStatusGet({ 
      status: status as string 
    });
    res.json(pets);
  } catch (error) {
    res.status(500).json({ error: '获取宠物列表失败' });
  }
});

app.post('/api/pets', async (req, res) => {
  try {
    const result = await petPost({ data: req.body });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: '创建宠物失败' });
  }
});

app.listen(3000, () => {
  console.log('服务器运行在 http://localhost:3000');
});
```

---

## 🎯 最佳实践

### 1. 版本管理策略

**场景一：项目直接集成**
```json
// package.json
{
  "scripts": {
    "api:generate": "s2r generate",
    "api:update": "s2r generate --clean",
    "precommit": "npm run api:generate"
  }
}
```

**场景二：NPM 包发布**
```bash
# 更新 API 并发布新版本
npm run api:update
npm version patch  # 或 minor/major
npm publish

# 通知使用方更新
echo "API 客户端已更新到 v$(npm pkg get version)"
```

### 2. 错误处理统一化

```typescript
// 通用错误处理器
export const createApiErrorHandler = (context: string) => {
  return (error: any) => {
    const errorInfo = {
      context,
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      }
    };
    
    // 记录错误日志
    console.error(`[${context}] API Error:`, errorInfo);
    
    // 发送到错误监控服务
    // errorReporting.captureException(error, errorInfo);
    
    // 用户友好的错误提示
    const userMessage = getUserFriendlyErrorMessage(error);
    throw new Error(userMessage);
  };
};

// 使用示例
const handleUserApiError = createApiErrorHandler('UserManagement');

const fetchUsers = async () => {
  try {
    return await userListGet();
  } catch (error) {
    handleUserApiError(error);
  }
};
```

### 3. 类型安全增强

```typescript
// 创建类型安全的 API 包装器
import type { User, CreateUserRequest } from '@company/api-client';

export class UserService {
  static async getUsers(): Promise<User[]> {
    const response = await userListGet();
    return response.data;
  }
  
  static async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await userCreatePost({ data: userData });
    return response.data;
  }
  
  static async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const response = await userUserIdPut({ userId: id, data: userData });
    return response.data;
  }
}

// 使用类型安全的服务
const newUser = await UserService.createUser({
  name: 'John Doe',
  email: 'john@example.com'
  // TypeScript 会检查必需字段
});
```

### 4. 缓存和性能优化

```typescript
// 简单的内存缓存实现
class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl = 5 * 60 * 1000; // 5分钟
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

const apiCache = new ApiCache();

// 带缓存的 API 调用
export const getCachedUsers = async (): Promise<User[]> => {
  const cacheKey = 'users-list';
  const cached = apiCache.get<User[]>(cacheKey);
  
  if (cached) {
    console.log('返回缓存数据');
    return cached;
  }
  
  const users = await UserService.getUsers();
  apiCache.set(cacheKey, users);
  return users;
};
```

---

## 📋 总结

### 选择合适的使用方式

| 场景 | 推荐方式 | 优势 | 适用情况 |
|------|----------|------|----------|
| **单个项目** | 直接集成 | 简单快速、无额外依赖 | 小型项目、快速原型 |
| **多个项目** | NPM 包 | 统一管理、版本控制 | 企业级应用、微服务架构 |
| **团队协作** | NPM 包 | 标准化、易维护 | 多团队开发、API 变更频繁 |
| **快速验证** | 直接集成 + Mock | 快速启动、离线开发 | 概念验证、前后端并行开发 |

### 核心优势回顾

✅ **零学习成本** - 生成即用的函数，无需学习新的 API 调用方式  
✅ **完整类型安全** - 自动生成 TypeScript 类型，编译时错误检查  
✅ **开发体验优化** - IDE 智能提示、自动补全、重构支持  
✅ **团队协作友好** - 统一的 API 调用标准，减少沟通成本  
✅ **生产环境就绪** - 内置错误处理、请求拦截、性能优化

通过 S2R，您可以将更多时间专注于业务逻辑实现，而不是 API 集成的繁琐细节。
```