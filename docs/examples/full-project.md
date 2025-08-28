# 完整项目示例

这是一个完整的项目示例，展示如何在真实项目中使用 S2R 生成和集成 TypeScript API 客户端。

## 项目概述

本示例基于实际的 examples/full-project 目录，展示了：

- 🚀 **API 客户端生成**: 从 OpenAPI 3.1 文档生成完整的 TypeScript 客户端
- 🎭 **Mock 服务器**: 集成 Swagger UI 的本地开发服务器
- 🧪 **测试集成**: 使用 Vitest 的完整测试套件
- 📦 **TypeScript 配置**: 现代 TypeScript 项目配置
- 🔧 **开发工具**: ESLint、构建脚本等完整工具链

## 快速开始

### 1. 项目设置

```bash
# 克隆或复制示例项目
cp -r examples/full-project my-api-project
cd my-api-project

# 安装依赖
pnpm install
```

### 2. 生成 API 客户端

```bash
# 使用项目测试 API（OpenAPI 3.1）
pnpm run generate

# 这会生成以下文件结构：
# src/api/
# ├── index.ts          # 主入口文件
# ├── types.ts          # TypeScript 类型定义
# ├── api.ts            # API 函数实现
# ├── client.ts         # API 客户端配置
# └── utils.ts          # 工具函数
```

### 3. 启动开发环境

```bash
# 启动 Mock 服务器
pnpm run mock

# 在另一个终端运行开发服务器
pnpm run dev
```

### 4. 访问和测试

- **Swagger UI**: `http://localhost:3001/docs`
- **Mock API**: `http://localhost:3001/*`
- **健康检查**: `http://localhost:3001/health`

## 项目结构

```
full-project/
├── src/
│   ├── api/                    # 生成的 API 客户端
│   │   ├── index.ts           # 导出所有 API 函数和类型
│   │   ├── types.ts           # TypeScript 类型定义
│   │   ├── api.ts             # API 函数实现
│   │   ├── client.ts          # 客户端配置
│   │   └── utils.ts           # 工具函数
│   ├── tests/                  # 测试文件
│   │   └── index.test.ts      # 主要测试用例
│   └── index.ts               # 项目主入口
├── dist/                      # 构建输出
├── package.json              # 项目配置
├── tsconfig.json             # TypeScript 配置
├── vitest.config.ts          # 测试配置
└── README.md                 # 项目说明
```

## 核心功能演示

### 1. 基础 API 调用

```typescript
import { 
  // 基于实际 API 结构的函数名
  apiUsersGet,           // GET /api/users
  apiUsersPost,          // POST /api/users
  apiUsersUserIdGet,     // GET /api/users/{userId}
  apiUsersUserIdPut,     // PUT /api/users/{userId}
  apiUsersUserIdDelete   // DELETE /api/users/{userId}
} from './api';

// 获取用户列表
const users = await apiUsersGet();

// 创建新用户
const newUser = await apiUsersPost({
  name: '张三',
  email: 'zhangsan@example.com'
});

// 获取指定用户
const user = await apiUsersUserIdGet('123');

// 更新用户信息
const updatedUser = await apiUsersUserIdPut('123', {
  name: '李四',
  email: 'lisi@example.com'
});

// 删除用户
await apiUsersUserIdDelete('123');
```

### 2. 类型安全的数据处理

```typescript
import type { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest,
  ApiResponse 
} from './api/types';

// 享受完整的类型提示
const createUser = async (userData: CreateUserRequest): Promise<User> => {
  try {
    const response = await apiUsersPost(userData);
    return response;
  } catch (error) {
    console.error('创建用户失败:', error);
    throw error;
  }
};

// 类型安全的数据验证
const validateUser = (user: User): boolean => {
  return user.name.length > 0 && 
         user.email.includes('@') && 
         user.id > 0;
};
```

### 3. 客户端配置和拦截器

```typescript
import { APIClient, apiClient } from './api';

// 配置默认客户端
apiClient.setBaseURL('https://api.example.com');
apiClient.setHeader('Authorization', 'Bearer your-token');
apiClient.setTimeout(30000);

// 创建自定义客户端
const prodClient = new APIClient({
  baseURL: 'https://api.production.com',
  timeout: 30000,
  headers: {
    'Authorization': 'Bearer prod-token',
    'X-Environment': 'production'
  }
});

// 使用环境变量配置
const envClient = new APIClient({
  baseURL: process.env.API_BASE_URL || 'http://localhost:3001',
  timeout: parseInt(process.env.API_TIMEOUT || '10000'),
  headers: {
    'X-Client-Version': process.env.npm_package_version
  }
});
```

## 开发工作流

### 1. API 开发流程

```bash
# 1. 获取最新的 API 文档
curl -o api-docs.json https://carty-harp-backend-test.xiaotunqifu.com/v3/api-docs

# 2. 重新生成客户端代码
pnpm run generate

# 3. 运行类型检查
pnpm run typecheck

# 4. 启动 Mock 服务器进行开发
pnpm run mock

# 5. 运行测试验证
pnpm run test
```

### 2. 测试策略

```typescript
// tests/index.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { apiUsersGet, apiUsersPost } from '../api';

describe('API 客户端测试', () => {
  beforeAll(async () => {
    // 测试前设置
    process.env.API_BASE_URL = 'http://localhost:3001';
  });

  it('应该能够获取用户列表', async () => {
    const users = await apiUsersGet();
    expect(Array.isArray(users)).toBe(true);
  });

  it('应该能够创建新用户', async () => {
    const newUser = await apiUsersPost({
      name: '测试用户',
      email: 'test@example.com'
    });
    
    expect(newUser.name).toBe('测试用户');
    expect(newUser.email).toBe('test@example.com');
    expect(newUser.id).toBeDefined();
  });

  it('应该处理 API 错误', async () => {
    try {
      await apiUsersUserIdGet('invalid-id');
    } catch (error: any) {
      expect(error.response?.status).toBe(404);
    }
  });
});
```

### 3. 错误处理模式

```typescript
import { formatErrorMessage } from './api';

// 统一错误处理函数
const handleApiError = (error: any) => {
  if (error.response) {
    // HTTP 错误响应
    switch (error.response.status) {
      case 401:
        // 处理认证失败
        window.location.href = '/login';
        break;
      case 403:
        // 处理权限不足
        alert('您没有权限执行此操作');
        break;
      case 404:
        // 处理资源不存在
        console.warn('请求的资源不存在');
        break;
      case 500:
        // 处理服务器错误
        alert('服务器内部错误，请稍后重试');
        break;
      default:
        alert(`请求失败: ${formatErrorMessage(error)}`);
    }
  } else if (error.request) {
    // 网络错误
    alert('网络连接失败，请检查网络设置');
  } else {
    // 其他错误
    console.error('未知错误:', error.message);
  }
};

// 在 API 调用中使用
const fetchUserSafely = async (userId: string) => {
  try {
    return await apiUsersUserIdGet(userId);
  } catch (error) {
    handleApiError(error);
    return null;
  }
};
```

## 实际使用场景

### 1. React 集成

```typescript
// hooks/useUsers.ts
import { useState, useEffect } from 'react';
import { apiUsersGet, type User } from '../api';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await apiUsersGet();
        setUsers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
};
```

### 2. Vue 集成

```typescript
// composables/useUsers.ts
import { ref, onMounted } from 'vue';
import { apiUsersGet, type User } from '../api';

export const useUsers = () => {
  const users = ref<User[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const fetchUsers = async () => {
    try {
      loading.value = true;
      error.value = null;
      users.value = await apiUsersGet();
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  onMounted(fetchUsers);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers
  };
};
```

### 3. Node.js 服务端

```typescript
// server/api-service.ts
import { APIClient } from '../api';

class ApiService {
  private client: APIClient;

  constructor() {
    this.client = new APIClient({
      baseURL: process.env.API_BASE_URL!,
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
        'User-Agent': 'Server/1.0.0'
      },
      timeout: 30000
    });
  }

  async getUsers() {
    return this.client.request({
      method: 'GET',
      url: '/api/users'
    });
  }

  async createUser(userData: any) {
    return this.client.request({
      method: 'POST',
      url: '/api/users',
      data: userData
    });
  }
}

export const apiService = new ApiService();
```

## 部署和生产环境

### 1. 环境配置

```javascript
// config/environments.js
const config = {
  development: {
    API_BASE_URL: 'http://localhost:3001',
    API_TIMEOUT: 10000,
    LOG_LEVEL: 'debug'
  },
  staging: {
    API_BASE_URL: 'https://api-staging.example.com',
    API_TIMEOUT: 15000,
    LOG_LEVEL: 'info'
  },
  production: {
    API_BASE_URL: 'https://api.example.com',
    API_TIMEOUT: 30000,
    LOG_LEVEL: 'error'
  }
};

export default config[process.env.NODE_ENV || 'development'];
```

### 2. CI/CD 集成

```yaml
# .github/workflows/test.yml
name: Test API Client

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'pnpm'
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Generate API client
      run: pnpm run generate
    
    - name: Run type check
      run: pnpm run typecheck
    
    - name: Start Mock Server
      run: |
        pnpm run mock &
        sleep 5
    
    - name: Run tests
      run: pnpm run test
      env:
        API_BASE_URL: http://localhost:3001
```

## 性能优化

### 1. 请求优化

```typescript
// 请求缓存和去重
class RequestCache {
  private cache = new Map<string, Promise<any>>();
  private timeouts = new Map<string, NodeJS.Timeout>();

  async request<T>(key: string, requestFn: () => Promise<T>, ttl = 5000): Promise<T> {
    // 检查缓存
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    // 创建请求
    const promise = requestFn();
    this.cache.set(key, promise);

    // 设置过期时间
    const timeout = setTimeout(() => {
      this.cache.delete(key);
      this.timeouts.delete(key);
    }, ttl);
    this.timeouts.set(key, timeout);

    return promise;
  }
}

const requestCache = new RequestCache();

// 使用缓存的 API 调用
export const getCachedUsers = () => {
  return requestCache.request('users', () => apiUsersGet(), 10000);
};
```

### 2. 批量请求

```typescript
// 批量处理工具
class BatchProcessor {
  private queue: Array<{ id: string; resolve: Function; reject: Function }> = [];
  private timer: NodeJS.Timeout | null = null;

  async batchRequest(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ id, resolve, reject });

      if (!this.timer) {
        this.timer = setTimeout(() => this.processBatch(), 100);
      }
    });
  }

  private async processBatch() {
    const batch = this.queue.splice(0);
    this.timer = null;

    try {
      const ids = batch.map(item => item.id);
      const results = await this.fetchBatch(ids);
      
      batch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      batch.forEach(item => {
        item.reject(error);
      });
    }
  }

  private async fetchBatch(ids: string[]) {
    // 实现批量获取逻辑
    return Promise.all(ids.map(id => apiUsersUserIdGet(id)));
  }
}
```

## 监控和调试

### 1. 请求监控

```typescript
// 简单的性能监控
class PerformanceMonitor {
  private metrics: Array<{
    url: string;
    method: string;
    duration: number;
    status: number;
    timestamp: number;
  }> = [];

  trackRequest(url: string, method: string, duration: number, status: number) {
    this.metrics.push({
      url,
      method,
      duration,
      status,
      timestamp: Date.now()
    });

    // 保持最近 1000 条记录
    if (this.metrics.length > 1000) {
      this.metrics.shift();
    }
  }

  getStats() {
    const recent = this.metrics.filter(m => Date.now() - m.timestamp < 60000);
    
    return {
      totalRequests: recent.length,
      avgDuration: recent.reduce((sum, m) => sum + m.duration, 0) / recent.length,
      errorRate: recent.filter(m => m.status >= 400).length / recent.length,
      slowestRequest: Math.max(...recent.map(m => m.duration))
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();
```

### 2. 错误监控

```typescript
// 错误追踪
class ErrorTracker {
  private errors: Array<{
    error: any;
    context: any;
    timestamp: number;
    url: string;
  }> = [];

  trackError(error: any, context: any = {}) {
    this.errors.push({
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context,
      timestamp: Date.now(),
      url: window?.location?.href || 'server'
    });

    // 发送到错误监控服务
    this.reportError(error, context);
  }

  private async reportError(error: any, context: any) {
    try {
      // 这里可以集成 Sentry、LogRocket 等服务
      console.error('Error tracked:', { error, context });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }
}

export const errorTracker = new ErrorTracker();
```

## 最佳实践总结

### 1. 代码组织

- ✅ 使用生成的类型定义确保类型安全
- ✅ 统一错误处理机制
- ✅ 合理的缓存策略
- ✅ 环境配置管理
- ✅ 完整的测试覆盖

### 2. 性能优化

- ✅ 请求缓存和去重
- ✅ 批量请求处理
- ✅ 超时和重试机制
- ✅ 资源清理和内存管理

### 3. 监控调试

- ✅ 请求性能监控
- ✅ 错误追踪和上报
- ✅ 详细的日志记录
- ✅ 开发工具集成

通过这个完整的项目示例，您可以了解如何在真实项目中高效使用 S2R 生成的 API 客户端，并根据项目需求进行定制和优化。