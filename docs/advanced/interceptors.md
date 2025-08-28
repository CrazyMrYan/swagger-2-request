# 拦截器系统

S2R 提供了强大而灵活的拦截器系统，支持请求和响应的各个阶段进行自定义处理。拦截器系统基于优先级执行，支持认证、重试、日志、错误处理等多种功能。

## 拦截器类型

### 请求拦截器 (RequestInterceptor)

在请求发送前执行，用于修改请求配置、添加认证信息等。

```typescript
interface RequestInterceptor {
  name: string;                    // 拦截器名称
  priority?: number;               // 执行优先级 (数值越小越先执行)
  onRequest?: (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>;
  onRequestError?: (error: any) => any;
}
```

### 响应拦截器 (ResponseInterceptor)

在响应返回后执行，用于处理响应数据、错误处理、重试等。

```typescript
interface ResponseInterceptor {
  name: string;                    // 拦截器名称
  priority?: number;               // 执行优先级
  onResponse?: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>;
  onResponseError?: (error: any) => any;
}
```

## 内置拦截器

### 1. 认证拦截器

支持多种认证方式：Bearer Token、API Key、Basic Auth、自定义认证。

```typescript
import { createAuthInterceptor, globalAuthManager } from './api';

// Bearer Token 认证
const authInterceptor = createAuthInterceptor({
  type: 'bearer',
  token: 'your-jwt-token'
});

// API Key 认证 (Header)
const apiKeyInterceptor = createAuthInterceptor({
  type: 'apikey',
  apiKey: {
    name: 'X-API-Key',
    value: 'your-api-key',
    in: 'header'
  }
});

// API Key 认证 (Query)
const queryApiKeyInterceptor = createAuthInterceptor({
  type: 'apikey',
  apiKey: {
    name: 'api_key',
    value: 'your-api-key',
    in: 'query'
  }
});

// Basic 认证
const basicAuthInterceptor = createAuthInterceptor({
  type: 'basic',
  basic: {
    username: 'user',
    password: 'pass'
  }
});

// 自定义认证
const customAuthInterceptor = createAuthInterceptor({
  type: 'custom',
  custom: async (config) => {
    const token = await getTokenFromStorage();
    config.headers = {
      ...config.headers,
      'Authorization': `Custom ${token}`,
      'X-Timestamp': Date.now().toString()
    };
    return config;
  }
});
```

#### 全局认证管理

```typescript
// 使用全局认证管理器
globalAuthManager.setBearerToken('your-jwt-token');
globalAuthManager.setApiKey('X-API-Key', 'your-api-key');
globalAuthManager.setBasicAuth('username', 'password');

// 创建动态认证拦截器
const dynamicAuthInterceptor = globalAuthManager.createDynamicAuthInterceptor();
```

### 2. 重试拦截器

智能重试机制，支持指数退避、自定义重试条件。

```typescript
import { createRetryInterceptor, retryPresets } from './api';

// 使用预设配置
const conservativeRetry = createRetryInterceptor(retryPresets.conservative);
const aggressiveRetry = createRetryInterceptor(retryPresets.aggressive);

// 自定义重试配置
const customRetry = createRetryInterceptor({
  maxRetries: 3,                   // 最大重试次数
  delay: 1000,                     // 初始延迟 (ms)
  delayFactor: 2,                  // 延迟增长因子
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  shouldRetry: (error) => {
    // 自定义重试条件
    if (error.code === 'NETWORK_ERROR') return true;
    if (error.response?.status === 429) return true;
    return false;
  }
});
```

#### 重试预设配置

```typescript
export const retryPresets = {
  // 保守策略：少量重试，长延迟
  conservative: {
    maxRetries: 2,
    delay: 2000,
    delayFactor: 2
  },
  
  // 激进策略：多次重试，短延迟
  aggressive: {
    maxRetries: 5,
    delay: 500,
    delayFactor: 1.5
  },
  
  // 快速策略：快速重试
  fast: {
    maxRetries: 3,
    delay: 200,
    delayFactor: 1.2
  },
  
  // 禁用重试
  disabled: {
    maxRetries: 0,
    delay: 0
  }
};
```

### 3. 日志拦截器

支持请求/响应日志记录和性能监控。

```typescript
import { 
  createLogInterceptors, 
  createPerformanceLogInterceptor 
} from './api';

// 创建日志拦截器
const logInterceptors = createLogInterceptors({
  logRequests: true,               // 记录请求
  logResponses: true,              // 记录响应
  logRequestBody: true,            // 记录请求体
  logResponseBody: false,          // 不记录响应体 (避免敏感数据)
  level: 'info',                   // 日志级别
  logger: (level, message, data) => {
    console.log(`[${level.toUpperCase()}] ${message}`, data);
  }
});

// 性能监控拦截器
const performanceInterceptor = createPerformanceLogInterceptor();
```

#### 日志配置示例

```typescript
// 开发环境：详细日志
const devLogConfig = {
  logRequests: true,
  logResponses: true,
  logRequestBody: true,
  logResponseBody: true,
  level: 'debug'
};

// 生产环境：最小日志
const prodLogConfig = {
  logRequests: false,
  logResponses: false,
  logRequestBody: false,
  logResponseBody: false,
  level: 'error'
};
```

### 4. 错误处理拦截器

统一的错误处理和转换机制。

```typescript
import { 
  createErrorHandlerInterceptor, 
  errorHandlerPresets 
} from './api';

// 使用预设配置
const devErrorHandler = createErrorHandlerInterceptor(
  errorHandlerPresets.development
);

// 自定义错误处理
const customErrorHandler = createErrorHandlerInterceptor({
  enableTransform: true,
  enableNotification: true,
  onError: (error) => {
    // 统一错误处理逻辑
    switch (error.code) {
      case 'UNAUTHORIZED':
        // 清除认证信息，跳转登录
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
        break;
      
      case 'FORBIDDEN':
        showNotification('权限不足', 'warning');
        break;
      
      case 'RATE_LIMIT_EXCEEDED':
        showNotification('请求过于频繁，请稍后再试', 'warning');
        break;
      
      case 'NETWORK_ERROR':
        showNotification('网络连接异常', 'error');
        break;
      
      default:
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
});
```

## 拦截器配置

### 基础配置

```typescript
import { APIClient } from './api';

const client = new APIClient({
  baseURL: 'https://api.example.com',
  interceptors: {
    request: [
      // 认证拦截器 (优先级: 10)
      createAuthInterceptor({
        type: 'bearer',
        token: 'your-token'
      }),
      
      // 请求日志 (优先级: 90)
      createLogInterceptors({
        logRequests: true,
        logRequestBody: false
      }).request
    ],
    
    response: [
      // 重试拦截器 (优先级: 20)
      createRetryInterceptor(retryPresets.conservative),
      
      // 错误处理 (优先级: 80)
      createErrorHandlerInterceptor(errorHandlerPresets.production),
      
      // 响应日志 (优先级: 90)
      createLogInterceptors({
        logResponses: true,
        logResponseBody: false
      }).response,
      
      // 性能监控 (优先级: 95)
      createPerformanceLogInterceptor()
    ]
  }
});
```

### 环境配置

```typescript
// 开发环境配置
const developmentConfig = {
  request: [
    createAuthInterceptor({ type: 'bearer', token: '' }),
    createLogInterceptors({
      logRequests: true,
      logRequestBody: true,
      level: 'debug'
    }).request
  ],
  response: [
    createRetryInterceptor({ maxRetries: 1, delay: 500 }),
    createLogInterceptors({
      logResponses: true,
      logResponseBody: true,
      level: 'debug'
    }).response,
    createPerformanceLogInterceptor(),
    createErrorHandlerInterceptor(errorHandlerPresets.development)
  ]
};

// 生产环境配置
const productionConfig = {
  request: [
    createAuthInterceptor({ type: 'bearer', token: '' })
  ],
  response: [
    createRetryInterceptor(retryPresets.conservative),
    createErrorHandlerInterceptor(errorHandlerPresets.production)
  ]
};

// 根据环境选择配置
const interceptorConfig = process.env.NODE_ENV === 'production' 
  ? productionConfig 
  : developmentConfig;
```

### 便利函数

```typescript
import { createInterceptorConfig } from './api';

// 使用便利函数创建配置
const config = createInterceptorConfig({
  auth: {
    type: 'bearer',
    token: 'your-token'
  },
  retry: {
    maxRetries: 3,
    delay: 1000
  },
  logging: {
    logRequests: true,
    logResponses: true,
    level: 'info'
  },
  errorHandling: {
    enableTransform: true,
    enableNotification: true
  }
});
```

## 拦截器管理

### 动态管理

```typescript
import { InterceptorManager } from './api';

const manager = new InterceptorManager(axiosInstance);

// 添加拦截器
const authId = manager.addRequestInterceptor(authInterceptor);
const retryId = manager.addResponseInterceptor(retryInterceptor);

// 移除拦截器
manager.removeInterceptor(authId);

// 获取统计信息
const stats = manager.getStats();
console.log('拦截器统计:', stats);
```

### 管理器类

```typescript
// 认证管理器
const authManager = new AuthManager();
authManager.setAuth({ type: 'bearer', token: 'new-token' });
authManager.clearAuth();

// 重试管理器
const retryManager = new RetryManager({
  maxRetries: 3,
  delay: 1000
});
retryManager.updateConfig({ maxRetries: 5 });

// 错误处理管理器
const errorManager = new ErrorHandlerManager({
  enableTransform: true
});
const stats = errorManager.getErrorStats();
errorManager.clearErrorStats();
```

## 自定义拦截器

### 创建自定义请求拦截器

```typescript
const customRequestInterceptor: RequestInterceptor = {
  name: 'custom-request',
  priority: 50,
  onRequest: async (config) => {
    // 添加请求 ID
    config.headers = {
      ...config.headers,
      'X-Request-ID': generateRequestId()
    };
    
    // 添加时间戳
    config.headers['X-Timestamp'] = Date.now().toString();
    
    return config;
  },
  onRequestError: (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
};
```

### 创建自定义响应拦截器

```typescript
const customResponseInterceptor: ResponseInterceptor = {
  name: 'custom-response',
  priority: 50,
  onResponse: (response) => {
    // 处理特殊响应格式
    if (response.data && response.data.success === false) {
      throw new Error(response.data.message || '请求失败');
    }
    
    // 转换响应数据
    response.data = response.data?.data || response.data;
    
    return response;
  },
  onResponseError: async (error) => {
    // 自定义错误处理
    if (error.response?.status === 401) {
      await refreshToken();
      // 重新发起请求
      return axios.request(error.config);
    }
    
    return Promise.reject(error);
  }
};
```

## 最佳实践

### 1. 拦截器优先级

建议的优先级顺序：

```
请求阶段：
├── 认证拦截器 (10)
├── 参数验证 (20)
├── 自定义处理 (50)
└── 日志拦截器 (90)

响应阶段：
├── 重试拦截器 (20)
├── 数据转换 (50)
├── 错误处理 (80)
├── 日志拦截器 (90)
└── 性能监控 (95)
```

### 2. 环境配置

```typescript
// 根据环境配置不同的拦截器
const getInterceptorConfig = () => {
  const baseConfig = {
    request: [createAuthInterceptor(authConfig)],
    response: [createErrorHandlerInterceptor(errorConfig)]
  };
  
  if (process.env.NODE_ENV === 'development') {
    baseConfig.request.push(createLogInterceptors(devLogConfig).request);
    baseConfig.response.push(createLogInterceptors(devLogConfig).response);
    baseConfig.response.push(createPerformanceLogInterceptor());
  }
  
  if (process.env.NODE_ENV === 'production') {
    baseConfig.response.unshift(createRetryInterceptor(retryPresets.conservative));
  }
  
  return baseConfig;
};
```

### 3. 错误处理策略

```typescript
// 统一的错误处理策略
const errorHandlingStrategy = {
  // 认证错误：清除 token，跳转登录
  401: () => {
    authManager.clearAuth();
    router.push('/login');
  },
  
  // 权限错误：显示提示
  403: () => {
    notification.error('权限不足');
  },
  
  // 服务器错误：显示错误信息
  500: (error) => {
    notification.error(`服务器错误: ${error.message}`);
  },
  
  // 网络错误：显示网络提示
  'NETWORK_ERROR': () => {
    notification.error('网络连接异常，请检查网络设置');
  }
};
```

### 4. 性能优化

```typescript
// 避免在拦截器中进行重复的昂贵操作
const tokenCache = new Map();

const optimizedAuthInterceptor = createAuthInterceptor({
  type: 'custom',
  custom: async (config) => {
    const cacheKey = 'auth_token';
    let token = tokenCache.get(cacheKey);
    
    if (!token || isTokenExpired(token)) {
      token = await refreshToken();
      tokenCache.set(cacheKey, token);
    }
    
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  }
});
```

## 调试和监控

### 启用调试模式

```typescript
// 在开发环境启用详细日志
if (process.env.NODE_ENV === 'development') {
  const debugInterceptor = {
    name: 'debug',
    priority: 100,
    onRequest: (config) => {
      console.group('🔵 Request');
      console.log('URL:', config.url);
      console.log('Method:', config.method);
      console.log('Headers:', config.headers);
      console.log('Data:', config.data);
      console.groupEnd();
      return config;
    },
    onResponse: (response) => {
      console.group('🟢 Response');
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);
      console.log('Data:', response.data);
      console.groupEnd();
      return response;
    }
  };
}
```

### 监控统计

```typescript
// 监控 API 调用统计
const monitoringInterceptor = {
  name: 'monitoring',
  priority: 99,
  onResponse: (response) => {
    // 记录成功调用
    analytics.track('api_call_success', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      duration: Date.now() - response.config.startTime
    });
    return response;
  },
  onResponseError: (error) => {
    // 记录失败调用
    analytics.track('api_call_error', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      error: error.message
    });
    return Promise.reject(error);
  }
};
```

拦截器系统是 S2R 的核心特性之一，它提供了强大的扩展能力和灵活的配置选项。通过合理使用拦截器，您可以实现认证、重试、日志、错误处理等各种功能，提升 API 客户端的健壮性和可维护性。