# Mock 服务器

S2R 内置了强大的 Mock 服务器功能，集成 Swagger UI，支持自定义响应和延迟模拟，是前端开发和API测试的理想工具。

## 快速开始

### 启动基础 Mock 服务器

```bash
# 从本地文件启动
s2r mock ./swagger.json

# 从 URL 启动
s2r mock https://petstore.swagger.io/v2/swagger.json

# 指定端口
s2r mock ./swagger.json --port 3001

# 添加响应延迟
s2r mock ./swagger.json --port 3001 --delay 500
```

### 启动后的功能

启动成功后，您可以访问：

- **API 端点**: `http://localhost:3001/api/*`
- **Swagger UI**: `http://localhost:3001/docs`
- **健康检查**: `http://localhost:3001/health`
- **API 信息**: `http://localhost:3001/api-info`

## 命令行选项

### 基础选项

```bash
s2r mock <swagger-source> [options]
```

**参数:**
- `<swagger-source>` - Swagger 文档路径或 URL

**选项:**
- `-p, --port <number>` - 服务器端口 (默认: 3001)
- `-d, --delay <number>` - 响应延迟 (ms, 默认: 0)
- `--no-ui` - 禁用 Swagger UI
- `-c, --config <file>` - 配置文件路径
- `--verbose` - 启用详细日志

### 示例命令

```bash
# 启用详细日志
s2r mock ./swagger.json --verbose

# 禁用 Swagger UI
s2r mock ./swagger.json --no-ui

# 使用配置文件
s2r mock --config ./mock.config.js

# 添加 500ms 延迟模拟慢网络
s2r mock ./swagger.json --delay 500
```

## 配置文件

### 创建配置文件

创建 `mock.config.js`：

```javascript
export default {
  // Swagger 文档源
  source: './swagger.json',
  
  // 服务器配置
  server: {
    port: 3001,
    delay: 200,
    cors: true
  },
  
  // UI 配置
  ui: {
    enabled: true,
    title: 'My API Mock Server',
    description: '用于开发和测试的 Mock 服务器'
  },
  
  // 自定义响应
  customResponses: {
    'GET /pet/1': {
      status: 200,
      data: {
        id: 1,
        name: 'Custom Pet',
        status: 'available'
      }
    },
    'POST /pet': {
      status: 201,
      data: {
        id: 123,
        name: 'New Pet',
        status: 'available'
      }
    }
  },
  
  // 日志配置
  logging: {
    enabled: true,
    level: 'info'
  }
};
```

### 使用配置文件

```bash
s2r mock --config ./mock.config.js
```

## Swagger UI 集成

### 访问 Swagger UI

启动 Mock 服务器后，访问 `http://localhost:3001/docs` 查看交互式 API 文档。

### Swagger UI 功能

- **接口测试**: 直接在浏览器中测试 API
- **参数输入**: 可视化的参数输入界面
- **响应查看**: 实时查看 API 响应
- **模型展示**: 自动展示数据模型结构
- **认证测试**: 支持各种认证方式测试

### 自定义 Swagger UI

```javascript
// mock.config.js
export default {
  ui: {
    enabled: true,
    title: 'My API Documentation',
    customCSS: `
      .swagger-ui .topbar { 
        background-color: #1976d2; 
      }
      .swagger-ui .info .title {
        color: #1976d2;
      }
    `,
    swaggerOptions: {
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      docExpansion: 'list',
      filter: true,
      showRequestHeaders: true
    }
  }
};
```

## 自动 Mock 数据生成

### 智能数据生成

S2R 会根据 Swagger 定义自动生成 Mock 数据：

```json
// Swagger 定义
{
  "type": "object",
  "properties": {
    "id": { "type": "integer", "example": 1 },
    "name": { "type": "string", "example": "fluffy" },
    "status": { 
      "type": "string", 
      "enum": ["available", "pending", "sold"] 
    },
    "createdAt": { 
      "type": "string", 
      "format": "date-time" 
    }
  }
}
```

```json
// 自动生成的 Mock 数据
{
  "id": 1,
  "name": "fluffy",
  "status": "available",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### 数据类型支持

Mock 服务器支持所有 OpenAPI 数据类型：

```javascript
// 数据类型映射
const mockData = {
  // 基础类型
  string: "example string",
  integer: 42,
  number: 3.14,
  boolean: true,
  
  // 格式化类型
  "string(date)": "2024-01-15",
  "string(date-time)": "2024-01-15T10:30:00Z",
  "string(email)": "user@example.com",
  "string(uri)": "https://example.com",
  
  // 枚举类型
  "enum": "available", // 从枚举值中随机选择
  
  // 数组类型
  "array": [/* 基于 items 定义生成 */],
  
  // 对象类型
  "object": {/* 基于 properties 定义生成 */}
};
```

## 自定义响应

### 静态自定义响应

```javascript
// mock.config.js
export default {
  customResponses: {
    // 成功响应
    'GET /pet/1': {
      status: 200,
      data: {
        id: 1,
        name: 'Buddy',
        status: 'available',
        category: {
          id: 1,
          name: 'Dogs'
        }
      }
    },
    
    // 错误响应
    'GET /pet/999': {
      status: 404,
      data: {
        error: 'Pet not found',
        code: 'PET_NOT_FOUND'
      }
    },
    
    // 创建响应
    'POST /pet': {
      status: 201,
      data: {
        id: 123,
        message: 'Pet created successfully'
      }
    }
  }
};
```

### 动态响应生成

```javascript
// advanced-mock.config.js
export default {
  customResponses: {
    'GET /pet/:id': (req, res) => {
      const petId = parseInt(req.params.id);
      
      if (petId > 1000) {
        return res.status(404).json({
          error: 'Pet not found',
          code: 'PET_NOT_FOUND'
        });
      }
      
      return res.json({
        id: petId,
        name: `Pet ${petId}`,
        status: Math.random() > 0.5 ? 'available' : 'sold'
      });
    },
    
    'POST /pet': (req, res) => {
      const newPet = req.body;
      
      // 验证必填字段
      if (!newPet.name) {
        return res.status(400).json({
          error: 'Name is required',
          code: 'VALIDATION_ERROR'
        });
      }
      
      // 返回创建的宠物
      return res.status(201).json({
        ...newPet,
        id: Math.floor(Math.random() * 1000),
        createdAt: new Date().toISOString()
      });
    }
  }
};
```

## 开发工作流集成

### 前端开发集成

```json
// package.json
{
  "scripts": {
    "dev": "concurrently \"npm run mock\" \"npm run start\"",
    "mock": "s2r mock ./api/swagger.json --port 3001",
    "start": "react-scripts start"
  },
  "devDependencies": {
    "concurrently": "^7.0.0"
  }
}
```

### 环境变量配置

```bash
# .env.development
REACT_APP_API_BASE_URL=http://localhost:3001
REACT_APP_MOCK_ENABLED=true

# .env.production  
REACT_APP_API_BASE_URL=https://api.production.com
REACT_APP_MOCK_ENABLED=false
```

```javascript
// api.config.js
const baseURL = process.env.REACT_APP_MOCK_ENABLED 
  ? 'http://localhost:3001'
  : process.env.REACT_APP_API_BASE_URL;

export const apiClient = new APIClient({ baseURL });
```

## 高级功能

### CORS 配置

Mock 服务器默认启用 CORS，支持所有来源的跨域请求：

```javascript
// 自定义 CORS 配置
export default {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:8080'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
  }
};
```

### 请求日志

启用详细的请求日志记录：

```bash
s2r mock ./swagger.json --verbose
```

日志输出示例：

```
2024-01-15T10:30:00.000Z GET /pet/1
2024-01-15T10:30:01.000Z POST /pet
2024-01-15T10:30:02.000Z GET /store/inventory
```

### 健康检查

访问 `http://localhost:3001/health` 获取服务状态：

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "s2r-mock",
  "version": "1.0.0",
  "endpoints": 20
}
```

### API 信息端点

访问 `http://localhost:3001/api-info` 获取 API 信息：

```json
{
  "info": {
    "title": "Swagger Petstore",
    "version": "1.0.0",
    "description": "This is a sample server Petstore server."
  },
  "servers": [
    {
      "url": "http://localhost:3001",
      "description": "Mock Server"
    }
  ],
  "endpointCount": 20,
  "schemaCount": 8
}
```

## 测试和调试

### 使用 curl 测试

```bash
# 获取宠物信息
curl http://localhost:3001/pet/1

# 创建新宠物
curl -X POST http://localhost:3001/pet \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Pet",
    "status": "available",
    "photoUrls": ["test.jpg"]
  }'

# 获取库存信息
curl http://localhost:3001/store/inventory
```

### 使用 Postman

1. 导入 OpenAPI 文档到 Postman
2. 修改服务器 URL 为 `http://localhost:3001`
3. 测试各个端点

### 程序化测试

```javascript
// test-mock.js
import { APIClient } from './src/api';

const client = new APIClient({
  baseURL: 'http://localhost:3001'
});

async function testMockAPI() {
  try {
    // 测试获取宠物
    const pet = await client.petGet('1');
    console.log('✅ 获取宠物成功:', pet.name);
    
    // 测试创建宠物
    const newPet = await client.petPost({
      name: 'Test Pet',
      status: 'available',
      photoUrls: ['test.jpg']
    });
    console.log('✅ 创建宠物成功:', newPet.id);
    
    // 测试库存
    const inventory = await client.storeInventoryGet();
    console.log('✅ 获取库存成功:', Object.keys(inventory).length);
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testMockAPI();
```

## 性能和限制

### 性能特点

- **启动速度**: 通常在 1-2 秒内启动
- **响应速度**: 本地响应，通常 < 10ms
- **并发处理**: 支持数百个并发请求
- **内存使用**: 轻量级，通常 < 50MB

### 使用限制

- **数据持久化**: Mock 数据不持久化，重启后重置
- **状态管理**: 不支持复杂的状态管理
- **业务逻辑**: 不支持复杂的业务逻辑验证
- **数据关联**: 有限的数据关联支持

### 最佳实践

1. **开发阶段**: 使用 Mock 服务器进行前端开发
2. **测试阶段**: 用于集成测试和端到端测试
3. **演示阶段**: 用于产品演示和原型展示
4. **文档阶段**: 结合 Swagger UI 提供交互式文档

## 故障排除

### 常见问题

#### 端口被占用

```bash
# 检查端口使用情况
lsof -i :3001

# 使用其他端口
s2r mock ./swagger.json --port 3002
```

#### Swagger 文档解析错误

```bash
# 验证 Swagger 文档
s2r validate ./swagger.json

# 查看详细错误信息
s2r mock ./swagger.json --verbose
```

#### CORS 问题

```javascript
// 在配置文件中设置 CORS
export default {
  cors: {
    origin: true, // 允许所有来源
    credentials: true
  }
};
```

### 调试技巧

```bash
# 启用详细日志
s2r mock ./swagger.json --verbose

# 检查服务器状态
curl http://localhost:3001/health

# 查看所有端点
curl http://localhost:3001/api-info
```

Mock 服务器是 S2R 的重要组成部分，它大大简化了 API 开发和测试流程。通过合理配置和使用，可以显著提高开发效率和代码质量。