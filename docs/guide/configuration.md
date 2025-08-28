# 配置指南

S2R 提供了灵活的配置系统，支持命令行参数、配置文件和环境变量等多种配置方式。

## 配置文件

### 基本配置文件

创建 `swagger2request.config.js`：

```javascript
module.exports = {
  // Swagger 源配置
  swagger: {
    source: './api-docs.json', // 文件路径或 URL
    version: '3.0.0'           // Swagger/OpenAPI 版本
  },

  // 代码生成配置
  generation: {
    outputDir: './src/api',      // 输出目录
    typescript: true,            // 生成 TypeScript 代码
    functionNaming: 'pathMethod', // 函数命名策略
    includeComments: true,       // 包含注释
    generateTypes: true,         // 生成类型定义
    cleanOutput: true           // 清理输出目录
  },

  // 运行时配置
  runtime: {
    baseURL: process.env.API_BASE_URL || 'https://api.example.com',
    timeout: 10000,              // 请求超时时间（毫秒）
    validateParams: true,        // 启用参数验证
    filterParams: true          // 启用参数过滤
  }
};
```

### 完整配置文件

```javascript
module.exports = {
  // Swagger 源配置
  swagger: {
    source: './api-docs.json',
    version: '3.0.0',
    // 自定义解析器选项
    parserOptions: {
      resolve: {
        external: true    // 解析外部引用
      }
    }
  },

  // 代码生成配置
  generation: {
    outputDir: './src/api',
    typescript: true,
    functionNaming: 'pathMethod', // 'pathMethod' | 'operationId'
    includeComments: true,
    generateTypes: true,
    cleanOutput: true,
    // 高级生成选项
    generateClient: true,         // 生成客户端类
    generateUtils: true,          // 生成工具函数
    generateInterceptors: true,   // 生成拦截器模板
    // 代码格式化
    prettier: {
      enabled: true,
      config: '.prettierrc'
    }
  },

  // 运行时配置
  runtime: {
    baseURL: process.env.API_BASE_URL || 'https://api.example.com',
    timeout: 10000,
    validateParams: true,
    filterParams: true,
    // HTTP 配置
    headers: {
      'User-Agent': 'S2R-Client/1.0.0',
      'Accept': 'application/json'
    },
    // 重试配置
    retry: {
      enabled: false,
      retries: 3,
      delay: 1000
    }
  },

  // 拦截器配置
  interceptors: {
    request: [
      {
        name: 'auth',
        handler: './interceptors/auth.js',
        enabled: true
      },
      {
        name: 'logger',
        handler: './interceptors/logger.js',
        enabled: process.env.NODE_ENV === 'development'
      }
    ],
    response: [
      {
        name: 'errorHandler',
        handler: './interceptors/error.js',
        enabled: true
      },
      {
        name: 'transformer',
        handler: './interceptors/transformer.js',
        enabled: false
      }
    ]
  },

  // Mock 服务配置
  mock: {
    enabled: true,
    port: 3001,
    delay: 200,                   // 模拟延迟（毫秒）
    ui: true,                     // 启用 Swagger UI
    uiPath: '/docs',              // Swagger UI 路径
    customResponses: './mock/custom-responses.json',
    // CORS 配置
    cors: {
      enabled: true,
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
    }
  },

  // NPM 包配置
  package: {
    name: '@company/api-client',
    version: '1.0.0',
    description: 'Generated API client for company APIs',
    author: 'Your Name <your.email@example.com>',
    license: 'MIT',
    repository: 'https://github.com/company/api-client',
    private: false,
    // 发布配置
    publishConfig: {
      registry: 'https://registry.npmjs.org',
      access: 'public'
    },
    // 包文件配置
    files: ['dist', 'types', 'README.md'],
    main: 'dist/index.js',
    types: 'dist/index.d.ts'
  },

  // AI 友好文档配置
  aiDocs: {
    enabled: true,
    outputPath: './docs/api-ai.md',
    outputFormat: 'markdown',     // 'markdown' | 'json'
    includeExamples: true,
    optimizeForSearch: true,
    // 文档结构
    sections: {
      overview: true,
      endpoints: true,
      schemas: true,
      examples: true
    }
  }
};
```

## 配置选项详解

### Swagger 源配置

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `string` | 必填 | Swagger 文档路径或 URL |
| `version` | `string` | 自动检测 | Swagger/OpenAPI 版本 |
| `parserOptions` | `object` | `{}` | 解析器选项 |

```javascript
swagger: {
  // 支持本地文件
  source: './swagger.json',
  
  // 支持 URL
  source: 'https://api.example.com/swagger.json',
  
  // 版本指定
  version: '3.1.0',
  
  // 解析器选项
  parserOptions: {
    resolve: {
      external: true,     // 解析外部 $ref
      circular: 'ignore'  // 处理循环引用
    }
  }
}
```

### 代码生成配置

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `outputDir` | `string` | `'./src/api'` | 输出目录 |
| `typescript` | `boolean` | `true` | 生成 TypeScript 代码 |
| `functionNaming` | `'pathMethod' \| 'operationId'` | `'pathMethod'` | 函数命名策略 |
| `includeComments` | `boolean` | `true` | 包含 API 注释 |
| `generateTypes` | `boolean` | `true` | 生成类型定义 |
| `cleanOutput` | `boolean` | `true` | 清理输出目录 |

#### 函数命名策略

```javascript
// pathMethod: 基于路径和方法生成函数名
// GET /pet/{petId} → petPetIdGet
// POST /user → userPost

// operationId: 使用 operationId 作为函数名（如果存在）
// operationId: "getPetById" → getPetById
functionNaming: 'pathMethod' // 推荐使用
```

### 运行时配置

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `baseURL` | `string` | `''` | API 基础 URL |
| `timeout` | `number` | `10000` | 请求超时时间（毫秒） |
| `validateParams` | `boolean` | `true` | 启用参数验证 |
| `filterParams` | `boolean` | `true` | 启用参数过滤 |

```javascript
runtime: {
  // 环境变量支持
  baseURL: process.env.API_BASE_URL || 'https://api.example.com',
  
  // 超时配置
  timeout: 30000,
  
  // 验证和过滤
  validateParams: true,
  filterParams: true,
  
  // 默认请求头
  headers: {
    'User-Agent': 'MyApp/1.0.0',
    'Accept': 'application/json'
  },
  
  // 重试机制
  retry: {
    enabled: true,
    retries: 3,
    delay: 1000,
    backoff: 'exponential' // 'linear' | 'exponential'
  }
}
```

### 拦截器配置

```javascript
interceptors: {
  request: [
    {
      name: 'auth',                    // 拦截器名称
      handler: './interceptors/auth.js', // 拦截器文件路径
      enabled: true,                   // 是否启用
      options: {                       // 拦截器选项
        tokenType: 'Bearer'
      }
    }
  ],
  response: [
    {
      name: 'errorHandler',
      handler: './interceptors/error.js',
      enabled: true
    }
  ]
}
```

### Mock 服务配置

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | `boolean` | `false` | 启用 Mock 服务 |
| `port` | `number` | `3001` | 服务端口 |
| `delay` | `number` | `0` | 响应延迟（毫秒） |
| `ui` | `boolean` | `true` | 启用 Swagger UI |
| `uiPath` | `string` | `'/docs'` | Swagger UI 路径 |

```javascript
mock: {
  enabled: true,
  port: 3001,
  delay: 200,
  ui: true,
  uiPath: '/docs',
  
  // 自定义响应
  customResponses: './mock/responses.json',
  
  // CORS 配置
  cors: {
    enabled: true,
    origin: ['http://localhost:3000', 'http://localhost:8080'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    headers: ['Content-Type', 'Authorization']
  },
  
  // 健康检查
  healthCheck: {
    enabled: true,
    path: '/health'
  }
}
```

## 命令行参数

所有配置选项都可以通过命令行参数覆盖：

### 生成命令参数

```bash
# 基本参数
s2r generate <source> [options]

# 输出目录
s2r generate ./swagger.json --output ./src/api

# 配置文件
s2r generate ./swagger.json --config ./config.js

# 清理输出
s2r generate ./swagger.json --clean

# 仅生成类型
s2r generate ./swagger.json --types-only

# 详细日志
s2r generate ./swagger.json --verbose
```

### Mock 命令参数

```bash
# 基本参数
s2r mock <source> [options]

# 指定端口
s2r mock ./swagger.json --port 3001

# 设置延迟
s2r mock ./swagger.json --delay 500

# 禁用 UI
s2r mock ./swagger.json --no-ui

# 使用配置文件
s2r mock ./swagger.json --config ./config.js
```

## 环境变量

支持的环境变量：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `API_BASE_URL` | API 基础 URL | `https://api.example.com` |
| `S2R_CONFIG_PATH` | 配置文件路径 | `./config/s2r.config.js` |
| `S2R_OUTPUT_DIR` | 输出目录 | `./src/generated/api` |
| `S2R_MOCK_PORT` | Mock 服务端口 | `3001` |
| `S2R_VERBOSE` | 详细日志 | `true` |

```bash
# 使用环境变量
export API_BASE_URL=https://api.production.com
export S2R_OUTPUT_DIR=./src/generated
export S2R_VERBOSE=true

s2r generate ./swagger.json
```

## 配置文件优先级

配置选项的优先级（从高到低）：

1. 命令行参数
2. 环境变量
3. 配置文件
4. 默认值

```bash
# 示例：命令行参数会覆盖配置文件中的设置
s2r generate ./swagger.json \
  --config ./config.js \
  --output ./custom-output \  # 覆盖配置文件中的 outputDir
  --verbose                   # 覆盖配置文件中的 verbose 设置
```

## 多环境配置

### 开发环境配置

```javascript
// swagger2request.dev.js
module.exports = {
  swagger: {
    source: 'http://localhost:8080/api-docs'
  },
  generation: {
    outputDir: './src/api-dev'
  },
  runtime: {
    baseURL: 'http://localhost:8080',
    timeout: 5000
  },
  mock: {
    enabled: true,
    port: 3001,
    delay: 100
  }
};
```

### 生产环境配置

```javascript
// swagger2request.prod.js
module.exports = {
  swagger: {
    source: 'https://api.production.com/swagger.json'
  },
  generation: {
    outputDir: './src/api'
  },
  runtime: {
    baseURL: 'https://api.production.com',
    timeout: 30000
  },
  mock: {
    enabled: false
  }
};
```

### 使用特定环境配置

```bash
# 开发环境
s2r generate --config ./swagger2request.dev.js

# 生产环境
s2r generate --config ./swagger2request.prod.js

# 使用环境变量选择配置
NODE_ENV=development s2r generate --config ./config/\${NODE_ENV}.js
```

## 配置验证

S2R 会自动验证配置文件的正确性：

```javascript
// 配置验证示例
module.exports = {
  swagger: {
    source: './swagger.json' // 必填项
  },
  generation: {
    outputDir: './src/api',
    functionNaming: 'pathMethod' // 必须是有效的枚举值
  },
  runtime: {
    timeout: 10000 // 必须是正整数
  }
};
```

如果配置无效，S2R 会显示详细的错误信息：

```bash
❌ 配置验证失败:
- swagger.source 是必填项
- generation.functionNaming 必须是 'pathMethod' 或 'operationId'
- runtime.timeout 必须是正整数
```

## 最佳实践

### 1. 使用配置文件

```javascript
// 推荐：使用配置文件管理复杂配置
module.exports = {
  swagger: {
    source: process.env.SWAGGER_URL || './swagger.json'
  },
  generation: {
    outputDir: './src/api',
    cleanOutput: true
  },
  runtime: {
    baseURL: process.env.API_BASE_URL,
    timeout: parseInt(process.env.API_TIMEOUT) || 10000
  }
};
```

### 2. 环境特定配置

```javascript
// 根据环境调整配置
const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  swagger: {
    source: isDev 
      ? 'http://localhost:8080/api-docs'
      : 'https://api.production.com/swagger.json'
  },
  mock: {
    enabled: isDev,
    port: 3001
  }
};
```

### 3. 版本控制

```gitignore
# .gitignore
swagger2request.local.js  # 本地配置文件
.env.local               # 本地环境变量
```

```javascript
// swagger2request.config.js - 提交到版本控制
module.exports = {
  swagger: {
    source: process.env.SWAGGER_URL || './swagger.json'
  },
  generation: {
    outputDir: './src/api'
  }
};

// swagger2request.local.js - 不提交到版本控制
module.exports = {
  swagger: {
    source: 'http://localhost:8080/api-docs'
  },
  runtime: {
    baseURL: 'http://localhost:8080'
  }
};
```

通过合理的配置，您可以让 S2R 完美适应您的项目需求和开发流程。