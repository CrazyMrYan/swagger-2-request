# S2R

从 Swagger/OpenAPI 文档自动生成 TypeScript API 客户端代码，支持 Mock 服务和 AI 文档转换。

## 安装

```bash
npm install -g s2r
```

## 基本使用

### 生成 API 客户端

```bash
# 从文件生成
s2r generate ./swagger.json --output ./src/api

# 从 URL 生成
s2r generate https://api.example.com/swagger.json --output ./src/api
```

### 使用生成的代码

```typescript
import { apiUsersGet, apiUsersPost } from './src/api';

// 调用 API
const users = await apiUsersGet({ page: 1, limit: 10 });
const newUser = await apiUsersPost({ name: 'John', email: 'john@example.com' });
```

### 启动 Mock 服务

```bash
s2r mock ./swagger.json --port 3000
```

访问 `http://localhost:3000/docs` 查看 Swagger UI。

### 生成 AI 文档

```bash
s2r ai-docs ./swagger.json --output ./docs/api.md
```

## 配置文件

创建 `swagger2request.config.js`：

```javascript
module.exports = {
  swagger: {
    source: './swagger.json'
  },
  generation: {
    outputDir: './src/api',
    typescript: true
  },
  runtime: {
    baseURL: 'https://api.example.com',
    timeout: 10000
  }
};
```

## 命令行选项

```bash
# 生成代码
s2r generate <source> [options]
  --output, -o     输出目录
  --config, -c     配置文件路径

# Mock 服务
s2r mock <source> [options]
  --port, -p       端口号 (默认: 3000)
  --ui             启用 Swagger UI

# AI 文档
s2r ai-docs <source> [options]
  --output, -o     输出文件路径
  --format, -f     输出格式 (markdown|json)

# 发布 NPM 包
s2r publish <source> [options]
  --name, -n       包名
  --version, -v    版本号
```

## 许可证

MIT License