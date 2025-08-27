# 拦截器使用示例

这个示例展示了如何使用 Swagger-2-Request 的强大拦截器系统。

## 🔐 认证拦截器示例

### Bearer Token 认证

```typescript
import { 
  APIClient, 
  createAuthInterceptor,
  globalAuthManager 
} from '../generated/api';

// 方式 1: 直接配置拦截器
const client = new APIClient({
  baseURL: 'https://api.example.com',
  interceptors: {
    request: [
      createAuthInterceptor({
        type: 'bearer',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      })
    ]
  }
});

// 方式 2: 使用全局认证管理器
globalAuthManager.setBearerToken('your-jwt-token');

// 方式 3: 动态设置认证
const authManager = createAuthManager();
authManager.setBearerToken(await getTokenFromStorage());

const client2 = new APIClient({
  interceptors: {
    request: [authManager.createDynamicAuthInterceptor()]
  }
});
```

### API Key 认证

```typescript
// Header 中的 API Key
const apiKeyClient = new APIClient({
  interceptors: {
    request: [
      createAuthInterceptor({
        type: 'apikey',
        apiKey: {
          name: 'X-API-Key',
          value: 'your-api-key-here',
          in: 'header'
        }
      })
    ]
  }
});

// 查询参数中的 API Key
const queryApiKeyClient = new APIClient({
  interceptors: {
    request: [
      createAuthInterceptor({
        type: 'apikey',
        apiKey: {
          name: 'api_key',
          value: 'your-api-key-here',
          in: 'query'
        }
      })
    ]
  }
});
```

### Basic 认证

```typescript
const basicAuthClient = new APIClient({
  interceptors: {
    request: [
      createAuthInterceptor({
        type: 'basic',
        basic: {
          username: 'your-username',
          password: 'your-password'
        }
      })
    ]
  }
});
```

### 自定义认证逻辑

```typescript
const customAuthClient = new APIClient({
  interceptors: {
    request: [
      createAuthInterceptor({
        type: 'custom',
        custom: async (config) => {
          // 自定义认证逻辑
          const token = await refreshTokenIfNeeded();
          config.headers = {
            ...config.headers,
            'Authorization': `Custom ${token}`,
            'X-Timestamp': Date.now().toString()
          };
          return config;
        }
      })
    ]
  }
});
```

## 🔄 重试拦截器示例

### 基础重试配置

```typescript
import { 
  createRetryInterceptor, 
  retryPresets,
  RetryManager 
} from '../generated/api';

// 使用预设配置
const conservativeClient = new APIClient({
  interceptors: {
    response: [
      createRetryInterceptor(retryPresets.conservative)
    ]
  }
});

// 自定义重试配置
const customRetryClient = new APIClient({
  interceptors: {
    response: [
      createRetryInterceptor({
        maxRetries: 5,
        delay: 2000,
        delayFactor: 1.5,
        retryableStatusCodes: [408, 429, 500, 502, 503, 504],
        shouldRetry: (error) => {
          // 自定义重试逻辑
          if (error.code === 'NETWORK_ERROR') return true;
          if (error.response?.status === 429) return true;
          return false;
        }
      })
    ]
  }
});
```

### 动态重试管理

```typescript
const retryManager = new RetryManager({
  maxRetries: 3,
  delay: 1000,
  delayFactor: 2
});

// 根据环境调整重试策略
if (process.env.NODE_ENV === 'development') {
  retryManager.updateConfig({ maxRetries: 1, delay: 500 });
} else if (process.env.NODE_ENV === 'production') {
  retryManager.updateConfig(retryPresets.conservative);
}

const dynamicClient = new APIClient({
  interceptors: {
    response: [retryManager.createInterceptor()]
  }
});
```

## 📊 日志拦截器示例

### 开发环境日志

```typescript
import { 
  createLogInterceptors,
  createPerformanceLogInterceptor 
} from '../generated/api';

const devClient = new APIClient({
  interceptors: {
    request: [
      createLogInterceptors({
        logRequests: true,
        logRequestBody: true,
        level: 'debug',
        logger: (level, message, data) => {
          console.log(`[${level.toUpperCase()}] ${message}`, data);
        }
      }).request
    ],
    response: [
      createLogInterceptors({
        logResponses: true,
        logResponseBody: true,
        level: 'debug'
      }).response,
      createPerformanceLogInterceptor()
    ]
  }
});
```

### 生产环境日志

```typescript
// 生产环境只记录错误和警告
const prodClient = new APIClient({
  interceptors: {
    request: [
      createLogInterceptors({
        logRequests: false,
        level: 'warn',
        logger: (level, message, data) => {
          // 发送到日志服务
          sendToLogService({ level, message, data, timestamp: new Date().toISOString() });
        }
      }).request
    ],
    response: [
      createLogInterceptors({
        logResponses: false,
        logResponseBody: false,
        level: 'error'
      }).response
    ]
  }
});
```

### 自定义日志格式

```typescript
const customLogger = (level: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: level.toUpperCase(),
    message,
    data,
    service: 'api-client',
    environment: process.env.NODE_ENV
  };

  // 结构化日志输出
  console.log(JSON.stringify(logEntry));

  // 错误级别发送到错误监控
  if (level === 'error' && data?.requestId) {
    sendToErrorTracking(logEntry);
  }
};
```

## ❌ 错误处理拦截器示例

### 统一错误处理

```typescript
import { 
  createErrorHandlerInterceptor,
  errorHandlerPresets,
  type StandardError 
} from '../generated/api';

const errorHandlerClient = new APIClient({
  interceptors: {
    response: [
      createErrorHandlerInterceptor({
        enableTransform: true,
        enableNotification: true,
        onError: (error: StandardError) => {
          // 统一错误处理逻辑
          switch (error.code) {
            case 'UNAUTHORIZED':
              // 清除认证信息，跳转到登录页
              localStorage.removeItem('auth_token');
              window.location.href = '/login';
              break;
            
            case 'FORBIDDEN':
              // 显示权限不足提示
              showNotification('您没有权限执行此操作', 'warning');
              break;
            
            case 'RATE_LIMIT_EXCEEDED':
              // 显示频率限制提示
              showNotification('请求过于频繁，请稍后再试', 'warning');
              break;
            
            case 'NETWORK_ERROR':
              // 网络错误，可能需要重试
              showNotification('网络连接异常，请检查网络设置', 'error');
              break;
            
            default:
              // 其他错误
              showNotification(`操作失败: ${error.message}`, 'error');
          }
        },
        statusCodeMapping: {
          401: (error) => ({
            code: 'AUTHENTICATION_REQUIRED',
            message: '登录已过期，请重新登录',
            status: 401,
            timestamp: new Date().toISOString()
          }),
          403: (error) => ({
            code: 'ACCESS_DENIED',
            message: '访问被拒绝，请联系管理员',
            status: 403,
            timestamp: new Date().toISOString()
          }),
          429: (error) => ({
            code: 'RATE_LIMIT_EXCEEDED',
            message: '请求过于频繁，请稍后重试',
            status: 429,
            timestamp: new Date().toISOString()
          })
        }
      })
    ]
  }
});
```

### 业务错误处理

```typescript
const businessErrorHandler = createErrorHandlerInterceptor({
  enableTransform: true,
  onError: (error: StandardError) => {
    // 处理业务逻辑错误
    if (error.details?.businessCode) {
      const businessCode = error.details.businessCode;
      
      switch (businessCode) {
        case 'INSUFFICIENT_BALANCE':
          showNotification('余额不足，请先充值', 'warning');
          break;
        
        case 'PRODUCT_OUT_OF_STOCK':
          showNotification('商品库存不足', 'warning');
          break;
        
        case 'ORDER_EXPIRED':
          showNotification('订单已过期，请重新下单', 'info');
          break;
        
        default:
          showNotification(error.message, 'error');
      }
    }
  }
});
```

## 🔧 组合使用示例

### 完整的拦截器配置

```typescript
// 创建完整配置的客户端
const fullFeaturedClient = new APIClient({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 30000,
  interceptors: {
    request: [
      // 认证 (优先级: 10)
      createAuthInterceptor({
        type: 'bearer',
        token: getAuthToken()
      }),
      
      // 请求日志 (优先级: 90)
      createLogInterceptors({
        logRequests: process.env.NODE_ENV === 'development',
        logRequestBody: false,
        level: 'info'
      }).request
    ],
    
    response: [
      // 重试 (优先级: 20)
      createRetryInterceptor(
        process.env.NODE_ENV === 'production' 
          ? retryPresets.conservative 
          : retryPresets.aggressive
      ),
      
      // 响应日志 (优先级: 90)
      createLogInterceptors({
        logResponses: process.env.NODE_ENV === 'development',
        logResponseBody: false,
        level: 'info'
      }).response,
      
      // 性能监控 (优先级: 95)
      createPerformanceLogInterceptor(),
      
      // 错误处理 (优先级: 80)
      createErrorHandlerInterceptor(
        process.env.NODE_ENV === 'production'
          ? errorHandlerPresets.production
          : errorHandlerPresets.development
      )
    ]
  }
});
```

### 动态拦截器管理

```typescript
// 获取拦截器管理器
const interceptorManager = fullFeaturedClient.getInterceptorManager();

// 动态添加调试拦截器
function enableDebugMode() {
  interceptorManager.addRequestInterceptor({
    name: 'debug-request',
    priority: 5,
    onRequest: (config) => {
      console.group('🔍 Request Debug');
      console.log('URL:', config.url);
      console.log('Method:', config.method);
      console.log('Headers:', config.headers);
      console.log('Data:', config.data);
      console.groupEnd();
      return config;
    }
  });

  interceptorManager.addResponseInterceptor({
    name: 'debug-response',
    priority: 5,
    onResponse: (response) => {
      console.group('📤 Response Debug');
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);
      console.log('Data:', response.data);
      console.groupEnd();
      return response;
    }
  });
}

// 动态移除拦截器
function disableDebugMode() {
  interceptorManager.removeInterceptor('debug-request');
  interceptorManager.removeInterceptor('debug-response');
}
```

## 🎯 实际使用场景

### React 应用集成

```typescript
// api-client.ts
import { APIClient, globalAuthManager } from '../generated/api';

// 创建全局 API 客户端
export const apiClient = new APIClient({
  baseURL: process.env.REACT_APP_API_URL,
  preset: process.env.NODE_ENV === 'production' ? 'production' : 'development'
});

// 认证管理
export function setupAuth(token: string) {
  globalAuthManager.setBearerToken(token);
}

export function clearAuth() {
  globalAuthManager.clearAuth();
}

// React Hook
export function useApiClient() {
  return apiClient;
}
```

### Next.js 服务端使用

```typescript
// api/pets.ts (Next.js API Route)
import { APIClient } from '../../../generated/api';

const serverClient = new APIClient({
  baseURL: process.env.INTERNAL_API_URL,
  interceptors: {
    request: [
      createAuthInterceptor({
        type: 'apikey',
        apiKey: {
          name: 'X-Internal-Key',
          value: process.env.INTERNAL_API_KEY!,
          in: 'header'
        }
      })
    ]
  }
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const pets = await serverClient.petsGet();
    res.status(200).json(pets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pets' });
  }
}
```

## 📚 最佳实践

1. **拦截器优先级**：认证 < 重试 < 日志 < 错误处理
2. **环境配置**：开发环境详细日志，生产环境最小日志
3. **错误处理**：统一的错误处理策略和用户体验
4. **性能监控**：监控 API 调用耗时和成功率
5. **安全考虑**：避免在日志中记录敏感信息

## 🚀 进阶技巧

### 自定义拦截器

```typescript
// 自定义请求 ID 拦截器
const requestIdInterceptor = {
  name: 'request-id',
  priority: 15,
  onRequest: (config) => {
    const requestId = generateUUID();
    config.headers = {
      ...config.headers,
      'X-Request-ID': requestId
    };
    (config as any).__requestId = requestId;
    return config;
  }
};

// 自定义重复请求检测拦截器
const duplicateRequestInterceptor = {
  name: 'duplicate-detection',
  priority: 25,
  onRequest: (config) => {
    const key = `${config.method}_${config.url}`;
    if (pendingRequests.has(key)) {
      throw new Error('Duplicate request detected');
    }
    pendingRequests.add(key);
    return config;
  }
};
```

继续查看 [完整项目示例](../full-project/) 了解在实际项目中的使用。