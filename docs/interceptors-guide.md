# 拦截器系统使用指南

## 概述

拦截器系统是 Swagger-2-Request 工具的核心功能之一，提供了强大的请求和响应处理能力。支持：

- 🔐 **认证管理** - Bearer Token、API Key、Basic Auth
- 📊 **日志记录** - 详细的请求/响应日志
- 🔄 **智能重试** - 指数退避、自定义重试条件
- ❌ **错误处理** - 统一错误格式化和处理
- ⚡ **性能监控** - 请求耗时统计

## 快速开始

### 1. 使用预设配置

```typescript
import { APIClient, interceptorPresets } from './generated';

// 开发环境 - 详细日志 + 错误处理
const devClient = new APIClient({
  preset: 'development',
  baseURL: 'https://api.example.com'
});

// 生产环境 - 基础功能 + 错误监控
const prodClient = new APIClient({
  preset: 'production',
  baseURL: 'https://api.example.com'
});
```

### 2. 自定义拦截器配置

```typescript
import { 
  APIClient, 
  createAuthInterceptor,
  createRetryInterceptor,
  createLogInterceptors,
  createErrorHandlerInterceptor
} from './generated';

const client = new APIClient({
  baseURL: 'https://api.example.com',
  interceptors: {
    request: [
      // 认证拦截器
      createAuthInterceptor({
        type: 'bearer',
        token: 'your-auth-token'
      }),
      // 请求日志
      createLogInterceptors({
        logRequests: true,
        logRequestBody: true,
        level: 'info'
      }).request
    ],
    response: [
      // 重试拦截器
      createRetryInterceptor({
        maxRetries: 3,
        delay: 1000,
        delayFactor: 2
      }),
      // 响应日志
      createLogInterceptors({
        logResponses: true,
        logResponseBody: false,
        level: 'info'
      }).response,
      // 错误处理
      createErrorHandlerInterceptor({
        enableTransform: true,
        enableNotification: true
      })
    ]
  }
});
```

## 认证拦截器

### Bearer Token 认证

```typescript
import { createAuthInterceptor, globalAuthManager } from './generated';

// 方式1: 直接创建拦截器
const authInterceptor = createAuthInterceptor({
  type: 'bearer',
  token: 'your-jwt-token'
});

// 方式2: 使用全局认证管理器
globalAuthManager.setBearerToken('your-jwt-token');
const dynamicAuthInterceptor = globalAuthManager.createDynamicAuthInterceptor();
```

### API Key 认证

```typescript
const apiKeyInterceptor = createAuthInterceptor({
  type: 'apikey',
  apiKey: {
    name: 'X-API-Key',
    value: 'your-api-key',
    in: 'header' // 或 'query'
  }
});
```

### Basic 认证

```typescript
const basicAuthInterceptor = createAuthInterceptor({
  type: 'basic',
  basic: {
    username: 'user',
    password: 'pass'
  }
});
```

### 自定义认证

```typescript
const customAuthInterceptor = createAuthInterceptor({
  type: 'custom',
  custom: async (config) => {
    // 自定义认证逻辑
    const token = await getTokenFromStorage();
    config.headers = {
      ...config.headers,
      'Authorization': `Custom ${token}`
    };
    return config;
  }
});
```

## 重试拦截器

### 基础重试配置

```typescript
import { createRetryInterceptor, retryPresets } from './generated';

// 使用预设配置
const conservativeRetry = createRetryInterceptor(retryPresets.conservative);
const aggressiveRetry = createRetryInterceptor(retryPresets.aggressive);

// 自定义配置
const customRetry = createRetryInterceptor({
  maxRetries: 5,
  delay: 1000,
  delayFactor: 1.5,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  shouldRetry: (error) => {
    // 自定义重试条件
    return error.code === 'NETWORK_ERROR' || 
           (error.response && error.response.status >= 500);
  }
});
```

### 重试管理器

```typescript
import { RetryManager } from './generated';

const retryManager = new RetryManager({
  maxRetries: 3,
  delay: 1000,
  delayFactor: 2
});

// 动态调整配置
retryManager.updateConfig({ maxRetries: 5 });

// 创建拦截器
const retryInterceptor = retryManager.createInterceptor();
```

## 日志拦截器

### 基础日志配置

```typescript
import { createLogInterceptors, createPerformanceLogInterceptor } from './generated';

const logConfig = {
  logRequests: true,
  logResponses: true,
  logRequestBody: true,
  logResponseBody: false,
  level: 'info' as const,
  logger: (level, message, data) => {
    console.log(`[${level}] ${message}`, data);
  }
};

const { request: requestLogger, response: responseLogger } = createLogInterceptors(logConfig);

// 性能日志
const performanceLogger = createPerformanceLogInterceptor();
```

### 自定义日志函数

```typescript
const customLogger = (level: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  
  // 发送到外部日志服务
  sendToLogService({
    level,
    message,
    data,
    timestamp,
    service: 'api-client'
  });
  
  // 开发环境下还在控制台输出
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${timestamp}] [${level}] ${message}`, data);
  }
};
```

## 错误处理拦截器

### 标准错误处理

```typescript
import { 
  createErrorHandlerInterceptor, 
  errorHandlerPresets,
  type StandardError 
} from './generated';

// 使用预设
const devErrorHandler = createErrorHandlerInterceptor(errorHandlerPresets.development);
const prodErrorHandler = createErrorHandlerInterceptor(errorHandlerPresets.production);

// 自定义错误处理
const customErrorHandler = createErrorHandlerInterceptor({
  enableTransform: true,
  enableNotification: true,
  onError: (error: StandardError) => {
    // 发送错误到监控系统
    sendToErrorTracking(error);
    
    // 显示用户友好的错误消息
    showUserNotification(error.message);
  },
  statusCodeMapping: {
    401: (error) => ({
      code: 'AUTHENTICATION_REQUIRED',
      message: '请重新登录',
      status: 401,
      timestamp: new Date().toISOString()
    }),
    403: (error) => ({
      code: 'ACCESS_DENIED',
      message: '您没有权限执行此操作',
      status: 403,
      timestamp: new Date().toISOString()
    })
  }
});
```

### 错误处理管理器

```typescript
import { ErrorHandlerManager } from './generated';

const errorManager = new ErrorHandlerManager({
  enableTransform: true,
  enableNotification: true
});

// 获取错误统计
const stats = errorManager.getErrorStats();
console.log('错误统计:', stats);

// 检查错误是否可恢复
const isRecoverable = errorManager.isRecoverableError(standardError);
```

## 动态配置管理

### 运行时添加拦截器

```typescript
// 获取拦截器管理器
const interceptorManager = client.getInterceptorManager();

// 添加新的拦截器
interceptorManager.addRequestInterceptor({
  name: 'request-id',
  priority: 5,
  onRequest: (config) => {
    config.headers = {
      ...config.headers,
      'X-Request-ID': generateRequestId()
    };
    return config;
  }
});

// 移除拦截器
interceptorManager.removeInterceptor('request-id');

// 获取统计信息
const stats = interceptorManager.getStats();
console.log('拦截器统计:', stats);
```

### 环境切换

```typescript
// 根据环境自动切换配置
const getClientConfig = () => {
  const baseConfig = {
    baseURL: process.env.API_BASE_URL,
    timeout: 10000
  };

  switch (process.env.NODE_ENV) {
    case 'development':
      return {
        ...baseConfig,
        preset: 'development' as const
      };
    
    case 'production':
      return {
        ...baseConfig,
        preset: 'production' as const
      };
    
    case 'test':
      return {
        ...baseConfig,
        preset: 'testing' as const
      };
    
    default:
      return {
        ...baseConfig,
        preset: 'minimal' as const
      };
  }
};

const client = new APIClient(getClientConfig());
```

## 最佳实践

### 1. 拦截器优先级

```typescript
// 推荐的拦截器优先级（数字越小优先级越高）:
// 1-10: 认证相关
// 11-20: 重试机制
// 21-30: 缓存控制
// 80-90: 日志记录
// 91-100: 错误处理
```

### 2. 错误边界

```typescript
// 始终在拦截器中处理异常
const safeInterceptor = {
  name: 'safe-interceptor',
  onRequest: async (config) => {
    try {
      // 拦截器逻辑
      return processConfig(config);
    } catch (error) {
      console.error('Interceptor error:', error);
      return config; // 返回原始配置
    }
  }
};
```

### 3. 性能考虑

```typescript
// 避免在拦截器中执行耗时操作
const performanceAwareInterceptor = {
  name: 'performance-aware',
  onRequest: (config) => {
    // ✅ 好的做法：快速同步操作
    config.headers['X-Timestamp'] = Date.now().toString();
    
    // ❌ 避免：耗时的异步操作
    // await someSlowOperation();
    
    return config;
  }
};
```

这个拦截器系统提供了强大而灵活的扩展能力，让你可以轻松地添加认证、日志、重试等功能到生成的 API 客户端中。