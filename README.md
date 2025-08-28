# S2R - Quick Start Guide

## 概述

s2r 是一个强大的工具，可以从 Swagger/OpenAPI 2.0-3.1 文档自动生成 TypeScript API 客户端代码，支持 Mock 服务、AI 友好文档转换和 NPM 包发布。

## 核心特性

✅ **全面支持**: 支持 OpenAPI 2.0-3.1 所有版本  
✅ **自动代码生成**: 从 Swagger JSON 生成类型安全的 TypeScript API 客户端  
✅ **智能命名**: URL + HTTP Method 的命名规则 (如 `apiUsersGet`)  
✅ **参数过滤**: 基于 API 定义的自动参数验证和过滤  
✅ **自定义拦截器**: 支持请求/响应拦截器配置  
✅ **Mock 服务**: 内置 Mock 服务器 + Swagger UI  
✅ **NPM 包支持**: 一键发布到 NPM  
✅ **AI 友好文档**: 转换为 LLM 优化的文档格式  

## 安装

```bash
# 全局安装 CLI
npm install -g s2r

# 或者在项目中安装
npm install --save-dev s2r
```

## 快速开始

### 1. 生成 API 客户端

```bash
# 从本地文件生成
s2r generate ./swagger.json --output ./src/api

# 从 URL 生成
s2r generate https://api.example.com/swagger.json --output ./src/api

# 使用配置文件
s2r generate --config ./swagger2request.config.js
```

### 2. 使用生成的代码

```typescript
import { apiUsersGet, apiUsersPost } from './src/api';
import type { User, CreateUserRequest } from './src/api';

// GET /api/users
const users = await apiUsersGet({ 
  page: 1, 
  limit: 10 
});

// POST /api/users
const newUser = await apiUsersPost({
  name: 'John Doe',
  email: 'john@example.com'
});
```

### 3. 启动 Mock 服务

```bash
# 启动 Mock 服务
s2r mock ./swagger.json --port 3001

# 带 Swagger UI
s2r mock ./swagger.json --port 3001 --ui
```

访问 `http://localhost:3001/docs` 查看 Swagger UI 界面。

## 配置文件示例

### swagger2request.config.js

```javascript
module.exports = {
  // Swagger 源配置
  swagger: {
    source: './api-docs.json', // 支持文件路径或 URL
    version: '3.0.0'
  },
  
  // 代码生成配置
  generation: {
    outputDir: './src/api',
    typescript: true,
    functionNaming: 'pathMethod', // pathMethod | operationId
    includeComments: true,
    generateTypes: true,
    cleanOutput: true
  },
  
  // 运行时配置
  runtime: {
    baseURL: process.env.API_BASE_URL || 'https://api.example.com',
    timeout: 10000,
    validateParams: true,
    filterParams: true
  },
  
  // 拦截器配置
  interceptors: {
    request: [
      {
        name: 'auth',
        handler: './interceptors/auth.js'
      }
    ],
    response: [
      {
        name: 'errorHandler', 
        handler: './interceptors/error.js'
      }
    ]
  },
  
  // Mock 服务配置
  mock: {
    enabled: true,
    port: 3001,
    delay: 200, // 模拟网络延迟
    ui: true,   // 启用 Swagger UI
    customResponses: './mock/custom-responses.json'
  },
  
  // NPM 包配置
  package: {
    name: '@company/api-client',
    version: '1.0.0',
    description: 'Generated API client for company APIs',
    repository: 'https://github.com/company/api-client',
    private: false,
    publishConfig: {
      registry: 'https://npm.company.com' // 私有 NPM 源
    }
  }
};
```

### 自定义拦截器示例

#### auth.js - 认证拦截器
```javascript
module.exports = {
  onRequest: (config) => {
    // 添加认证 token
    const token = process.env.API_TOKEN || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  
  onRequestError: (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
};
```

#### error.js - 错误处理拦截器
```javascript
module.exports = {
  onResponse: (response) => {
    return response;
  },
  
  onResponseError: (error) => {
    if (error.response?.status === 401) {
      // 处理认证失败
      window.location.href = '/login';
    } else if (error.response?.status >= 500) {
      // 处理服务器错误
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
};
```

## 生成的代码结构

```
src/api/
├── index.ts           # 主入口文件
├── types.ts           # TypeScript 类型定义
├── api.ts             # API 函数
├── client.ts          # API 客户端配置
└── utils.ts           # 工具函数
```

### 生成代码示例

#### types.ts
```typescript
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface UsersGetParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive';
}
```

#### api.ts
```typescript
import { apiClient } from './client';
import { filterQueryParams, validateRequestBody, createRequestConfig } from './utils';
import type * as Types from './types';

/**
 * Get list of users
 * GET /api/users
 */
export async function apiUsersGet(
  params?: Types.ApiUsersGetParams,
  options?: Types.RequestOptions
): Promise<Types.ApiUsersGetResponse> {
  const url = '/api/users';

  const config = {
    method: 'GET' as const,
    url,
    params: params ? filterQueryParams(params, ['page', 'limit', 'search', 'status']) : undefined,
    ...options,
  };

  const response = await apiClient.request(config);
  return response.data;
}

/**
 * Create a new user
 * POST /api/users
 */
export async function apiUsersPost(
  data: Types.ApiUsersPostRequest,
  options?: Types.RequestOptions
): Promise<Types.ApiUsersPostResponse> {
  const url = '/api/users';

  const config = {
    method: 'POST' as const,
    url,
    data,
    ...options,
  };

  const response = await apiClient.request(config);
  return response.data;
}

/**
 * Get user by ID
 * GET /api/users/{id}
 */
export async function apiUsersIdGet(
  id: number,
  options?: Types.RequestOptions
): Promise<Types.ApiUsersIdGetResponse> {
  const url = `/api/users/${id}`;

  const config = {
    method: 'GET' as const,
    url,
    ...options,
  };

  const response = await apiClient.request(config);
  return response.data;
}
```

## 高级用法

### 1. 发布到 NPM

```bash
# 生成并发布包
s2r publish ./swagger.json --name @company/api-client --version 1.0.0

# 使用配置文件发布
s2r publish --config ./swagger2request.config.js
```

### 2. 生成 AI 友好文档

```bash
# 转换为 Markdown 格式
s2r ai-docs ./swagger.json --output ./docs/api.md --format markdown

# 转换为 JSON 格式
s2r ai-docs ./swagger.json --output ./docs/api.json --format json
```

### 3. 自定义模板

```bash
# 使用自定义模板
s2r generate ./swagger.json --template ./templates/custom --output ./src/api
```

### 4. 批量处理

```bash
# 处理多个 API 文档
s2r batch --config ./batch.config.js
```

## 集成示例

### React 项目集成

```typescript
// src/api/config.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 10000
});

// 请求拦截器
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

```typescript
// src/hooks/useUsers.ts
import { useQuery, useMutation } from 'react-query';
import { apiUsersGet, apiUsersPost } from '../api';

export function useUsers(params?: UsersGetParams) {
  return useQuery(['users', params], () => apiUsersGet(params));
}

export function useCreateUser() {
  return useMutation(apiUsersPost);
}
```

### Node.js 项目集成

```typescript
// src/services/api.ts
import { apiUsersGet, apiUsersPost } from '../generated/api';

export class UserService {
  async getAllUsers(filters?: UsersGetParams) {
    try {
      return await apiUsersGet(filters);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  }
  
  async createUser(userData: CreateUserRequest) {
    try {
      return await apiUsersPost(userData);
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }
}
```

## 最佳实践

### 1. 项目结构建议

```
my-project/
├── src/
│   ├── api/              # 生成的 API 代码
│   ├── services/         # 业务逻辑层
│   ├── hooks/            # React hooks (如适用)
│   └── components/
├── swagger2request.config.js
├── api-docs.json
└── package.json
```

### 2. 版本管理

```json
{
  "scripts": {
    "api:generate": "s2r generate --config swagger2request.config.js",
    "api:mock": "s2r mock --config swagger2request.config.js",
    "api:publish": "s2r publish --config swagger2request.config.js",
    "precommit": "npm run api:generate && git add src/api/"
  }
}
```

### 3. CI/CD 集成

```yaml
# .github/workflows/api-client.yml
name: API Client Generation

on:
  push:
    paths:
      - 'api-docs.json'
      - 'swagger2request.config.js'

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install -g s2r
      - run: s2r generate --config swagger2request.config.js
      
      - name: Commit generated code
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add src/api/
          git commit -m "Auto-generate API client" || exit 0
          git push
```

## 故障排除

### 常见问题

#### 1. 生成失败
```bash
# 检查 Swagger 文档是否有效
s2r validate ./swagger.json

# 启用详细日志
s2r generate ./swagger.json --verbose
```

#### 2. 类型错误
```bash
# 重新生成类型定义
s2r generate ./swagger.json --types-only

# 检查 TypeScript 配置
tsc --noEmit
```

#### 3. Mock 服务问题
```bash
# 检查端口是否被占用
lsof -i :3001

# 使用不同端口
s2r mock ./swagger.json --port 3002
```

## 社区和支持

- 📖 [完整文档](https://s2r.dev)
- 🐛 [报告问题](https://github.com/CrazyMrYan/s2r/issues)
- 💬 [讨论区](https://github.com/CrazyMrYan/s2r/discussions)
- 📧 [邮件支持](mailto:support@s2r.dev)

## 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情。