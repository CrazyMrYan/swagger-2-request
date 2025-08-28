# Mock 服务器使用指南

S2R 提供了功能强大的 Mock 服务器，集成 Swagger UI，支持自定义响应、CORS 跨域和智能数据生成。

## 基本用法

### 启动 Mock 服务器

```bash
# 基本启动
s2r mock ./swagger.json

# 指定端口
s2r mock ./swagger.json --port 3001

# 添加响应延迟（模拟网络延迟）
s2r mock ./swagger.json --delay 500

# 禁用 Swagger UI
s2r mock ./swagger.json --no-ui

# 使用配置文件
s2r mock --config ./swagger2request.config.js
```

### 从 URL 启动

```bash
# 使用项目测试 API（OpenAPI 3.1）
s2r mock https://carty-harp-backend-test.xiaotunqifu.com/v3/api-docs --port 3001

# 使用 Petstore API（OpenAPI 2.0）
s2r mock https://petstore.swagger.io/v2/swagger.json --port 3001
```

## 访问地址

Mock 服务器启动后，您可以访问以下地址：

| 功能 | 地址 | 说明 |
|------|------|------|
| **API 端点** | `http://localhost:3001/*` | 所有 API 端点 |
| **Swagger UI** | `http://localhost:3001/docs` | 可视化 API 文档和测试界面 |
| **健康检查** | `http://localhost:3001/health` | 服务器状态检查 |
| **API 信息** | `http://localhost:3001/api-info` | API 基本信息 |
| **根路径** | `http://localhost:3001/` | 自动重定向到 `/docs` |

## 配置选项

### 在配置文件中配置 Mock 服务

```javascript
// swagger2request.config.js
module.exports = {
  // Mock 服务配置
  mock: {
    enabled: true,                    // 启用 Mock 服务
    port: 3001,                       // 服务端口
    delay: 200,                       // 响应延迟（毫秒）
    ui: true,                         // 启用 Swagger UI
    uiPath: '/docs',                  // Swagger UI 路径

    // CORS 配置
    cors: {
      enabled: true,                  // 启用 CORS
      origin: '*',                    // 允许的来源
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization']
    },

    // 自定义响应配置
    customResponses: './mock/custom-responses.json',

    // 健康检查配置
    healthCheck: {
      enabled: true,
      path: '/health'
    }
  }
};
```

### 响应延迟设置

```bash
# 无延迟（默认）
s2r mock ./swagger.json --delay 0

# 模拟快速网络（100ms）
s2r mock ./swagger.json --delay 100

# 模拟普通网络（500ms）
s2r mock ./swagger.json --delay 500

# 模拟慢速网络（2秒）
s2r mock ./swagger.json --delay 2000
```

## Swagger UI 功能

Mock 服务器集成了完整的 Swagger UI，提供以下功能：

### 特性

- 📖 **可视化文档**: 清晰的 API 文档展示
- 🧪 **在线测试**: 直接在浏览器中测试 API
- 🔍 **API 搜索**: 快速查找特定的 API 端点
- 📊 **Schema 查看**: 查看请求和响应数据结构
- 🎛️ **参数配置**: 可视化参数输入界面

### 访问和使用

1. 启动 Mock 服务器后，访问 `http://localhost:3001/docs`
2. 浏览 API 端点列表
3. 点击任意端点查看详细信息
4. 点击 "Try it out" 按钮测试 API
5. 输入参数并点击 "Execute" 执行请求

### 自定义 Swagger UI

```javascript
// 在配置文件中自定义 UI
mock: {
  ui: true,
  uiOptions: {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'My API Documentation',
    swaggerOptions: {
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      docExpansion: 'list',
      filter: true
    }
  }
}
```

## 数据生成

Mock 服务器根据 API 定义智能生成符合规范的测试数据。

### 自动数据生成规则

| 数据类型 | 生成规则 | 示例 |
|----------|----------|------|
| **字符串** | 随机字符串 | `"sample string"` |
| **数字** | 随机数字 | `42` |
| **布尔值** | 随机布尔值 | `true` 或 `false` |
| **日期** | 当前日期时间 | `"2024-01-15T10:30:00Z"` |
| **ID 字段** | 递增数字 | `1`, `2`, `3`... |
| **枚举值** | 随机选择 | 从定义的枚举值中随机选择 |
| **数组** | 随机长度数组 | `[item1, item2, item3]` |
| **对象** | 嵌套对象 | 根据 Schema 生成 |

### 智能字段识别

Mock 服务器会根据字段名智能生成更合适的数据：

```json
{
  "id": 1,                           // ID 字段：递增数字
  "name": "Sample Pet",              // name 字段：有意义的名称
  "email": "user@example.com",       // email 字段：邮箱格式
  "phone": "+1234567890",            // phone 字段：电话格式
  "url": "https://example.com",      // url 字段：URL 格式
  "status": "active",                // status 字段：状态值
  "createdAt": "2024-01-15T10:30:00Z", // 时间字段：ISO 格式
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

## 自定义响应

### 创建自定义响应文件

创建 `mock/custom-responses.json`：

```json
{
  "GET /pet/1": {
    "status": 200,
    "data": {
      "id": 1,
      "name": "Fluffy",
      "category": {
        "id": 1,
        "name": "Dogs"
      },
      "photoUrls": ["https://example.com/photo1.jpg"],
      "tags": [
        {
          "id": 1,
          "name": "friendly"
        }
      ],
      "status": "available"
    }
  },
  "POST /pet": {
    "status": 201,
    "data": {
      "id": 2,
      "message": "Pet created successfully"
    }
  },
  "GET /store/inventory": {
    "status": 200,
    "data": {
      "available": 25,
      "pending": 5,
      "sold": 10
    }
  }
}
```

### 动态响应

```json
{
  "GET /user/{username}": {
    "status": 200,
    "data": {
      "id": "{{random.number}}",
      "username": "{{params.username}}",
      "firstName": "{{random.firstName}}",
      "lastName": "{{random.lastName}}",
      "email": "{{params.username}}@example.com",
      "phone": "{{random.phone}}",
      "userStatus": 1
    }
  }
}
```

## CORS 支持

Mock 服务器默认启用 CORS 支持，允许前端应用跨域访问。

### 默认 CORS 配置

```javascript
cors: {
  enabled: true,
  origin: '*',                       // 允许所有来源
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  headers: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}
```

### 自定义 CORS 配置

```javascript
// 限制特定域名
cors: {
  enabled: true,
  origin: ['http://localhost:3000', 'http://localhost:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  headers: ['Content-Type', 'Authorization'],
  credentials: true
}

// 动态 CORS 配置
cors: {
  enabled: true,
  origin: (origin, callback) => {
    // 自定义逻辑判断是否允许该来源
    const allowedOrigins = ['http://localhost:3000'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}
```

## 健康检查

Mock 服务器提供健康检查端点，用于监控服务状态。

### 健康检查响应

```bash
curl http://localhost:3001/health
```

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "s2r-mock",
  "version": "3.0.0",
  "endpoints": 12,
  "uptime": 3600
}
```

### 在监控系统中使用

```bash
# 检查服务状态
curl -f http://localhost:3001/health || echo "Service is down"

# 在 Docker Compose 中使用
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

## 日志和调试

### 启用详细日志

```bash
# 启用详细日志
s2r mock ./swagger.json --verbose

# 日志输出示例
2024-01-15T10:30:00.000Z GET /pet/1
2024-01-15T10:30:01.000Z POST /pet
2024-01-15T10:30:02.000Z GET /store/inventory
```

### 请求和响应日志

Mock 服务器会自动记录所有请求：

```
2024-01-15T10:30:00.000Z GET /pet/1 - 200 - 15ms
2024-01-15T10:30:01.000Z POST /pet - 201 - 23ms
2024-01-15T10:30:02.000Z GET /store/inventory - 200 - 8ms
```

## 与前端集成

### React 项目集成

```javascript
// api/config.js
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3001'  // Mock 服务器
  : 'https://api.production.com';

export { API_BASE_URL };
```

```javascript
// 使用生成的 API 客户端
import { apiClient, petFindByStatusGet } from './api';

// 配置客户端
apiClient.setBaseURL('http://localhost:3001');

// 调用 API
const pets = await petFindByStatusGet(['available']);
```

### Vue 项目集成

```javascript
// main.js
import { createApp } from 'vue';
import { apiClient } from './api';

const app = createApp(App);

// 配置 API 客户端
if (process.env.NODE_ENV === 'development') {
  apiClient.setBaseURL('http://localhost:3001');
}

app.mount('#app');
```

## 使用场景

### 1. 前端开发

```bash
# 启动 Mock 服务器
s2r mock ./api/swagger.json --port 3001 --delay 200

# 前端可以立即开始开发，无需等待后端实现
```

### 2. API 测试

```bash
# 启动 Mock 服务器
s2r mock ./swagger.json --port 3001

# 使用 Swagger UI 测试所有 API 端点
# 访问 http://localhost:3001/docs
```

### 3. 演示和原型

```bash
# 快速启动演示环境
s2r mock ./demo-api.json --port 3001 --delay 100

# 客户可以立即看到 API 的行为
```

### 4. 集成测试

```bash
# 启动 Mock 服务器用于集成测试
s2r mock ./swagger.json --port 3001 &
MOCK_PID=$!

# 运行测试
npm test

# 清理
kill $MOCK_PID
```

## 故障排除

### 常见问题

#### 1. 端口被占用

```bash
# 错误信息
Error: listen EADDRINUSE: address already in use :::3001

# 解决方案
s2r mock ./swagger.json --port 3002
```

#### 2. CORS 错误

```bash
# 前端控制台错误
Access to fetch at 'http://localhost:3001/api/pets' from origin 'http://localhost:3000' has been blocked by CORS policy

# 解决方案：检查 CORS 配置
```

#### 3. Swagger 文档解析失败

```bash
# 错误信息
Failed to parse swagger document

# 解决方案：验证 Swagger 文档
s2r validate ./swagger.json
```

### 调试技巧

1. **使用详细日志**: `--verbose` 参数
2. **检查健康状态**: 访问 `/health` 端点
3. **验证 CORS**: 使用浏览器开发工具
4. **测试 API**: 使用 Swagger UI 或 curl

## 最佳实践

### 1. 开发环境配置

```javascript
// swagger2request.config.js
const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  mock: {
    enabled: isDev,
    port: 3001,
    delay: isDev ? 100 : 0,
    ui: isDev,
    cors: {
      enabled: true,
      origin: isDev ? '*' : ['https://myapp.com']
    }
  }
};
```

### 2. 团队协作

```bash
# 在 package.json 中添加脚本
{
  "scripts": {
    "dev": "concurrently \"npm run mock\" \"npm run start\"",
    "mock": "s2r mock ./api/swagger.json --port 3001",
    "mock:verbose": "s2r mock ./api/swagger.json --port 3001 --verbose"
  }
}
```

### 3. 持续集成

```yaml
# .github/workflows/test.yml
- name: Start Mock Server
  run: |
    s2r mock ./api/swagger.json --port 3001 &
    sleep 5
    
- name: Run Tests
  run: npm test
  env:
    API_BASE_URL: http://localhost:3001
```

通过 S2R 的 Mock 服务器，您可以在不依赖后端实现的情况下快速开发和测试前端应用，大大提升开发效率。