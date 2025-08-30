# Swagger-2-Request (S2R)

从 Swagger/OpenAPI 文档自动生成 TypeScript API 客户端代码，支持 Mock 服务和 AI 文档转换。

[![npm version](https://badge.fury.io/js/s2r.svg)](https://badge.fury.io/js/s2r)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📖 文档

完整文档请访问：[https://crazymryan.github.io/swagger-2-request/](https://crazymryan.github.io/swagger-2-request/)

## 🚀 特性

- ✅ 支持 Swagger/OpenAPI 2.0-3.1
- 🔧 生成 TypeScript API 客户端代码
- 🎭 内置 Mock 服务器
- 📝 AI 友好的文档生成
- ⚙️ 灵活的配置选项
- 🔄 支持请求/响应拦截器
- 📦 支持 NPM 包发布

## 📦 安装

```bash
npm install -g s2r
```

## 🎯 快速开始

### 1. 初始化配置文件

```bash
s2r init
```

这将生成一个 `.s2r.cjs` 配置文件，包含所有可用的配置选项。

### 2. 生成 API 客户端

```bash
# 从文件生成
s2r generate ./swagger.json --output ./src/api

# 从 URL 生成
s2r generate https://api.example.com/swagger.json --output ./src/api

# 使用配置文件
s2r generate ./swagger.json
```

### 3. 使用生成的代码

```typescript
import { apiUsersGet, apiUsersPost } from './src/api';

// 调用 API
const users = await apiUsersGet({ page: 1, limit: 10 });
const newUser = await apiUsersPost({ name: 'John', email: 'john@example.com' });
```

### 4. 启动 Mock 服务

```bash
s2r mock ./swagger.json --port 3000
```

访问 `http://localhost:3000/docs` 查看 Swagger UI。

## ⚙️ 配置文件

使用 `s2r init` 生成的 `.s2r.cjs` 配置文件示例：

```javascript
module.exports = {
  // 代码生成配置
  generation: {
    // 输出目录
    outputDir: './src/api',
    
    // 是否生成 TypeScript 代码
    typescript: true,
    
    // 函数命名方式: 'pathMethod' | 'operationId'
    functionNaming: 'pathMethod',
    
    // 是否包含注释
    includeComments: true,
    
    // 是否生成类型定义
    generateTypes: true,
    
    // 是否清理输出目录
    cleanOutput: false,
    
    // 排除覆盖的文件列表，支持通配符
    // 例如: ['*interceptor*', 'custom.ts'] 表示不覆盖包含 interceptor 的文件和 custom.ts 文件
    // 默认为空数组，表示覆盖所有文件
    excludeFiles: []
  },
  
  // Mock 服务配置
  mock: {
    port: 3001,
    delay: 0,
    enableUI: true
  },
  
  // 拦截器配置
  interceptors: {
    request: { enabled: true },
    response: { enabled: true }
  }
};
```

## 📋 命令行选项

### generate 命令

```bash
s2r generate <source> [options]

选项:
  -o, --output <dir>        输出目录 (默认: ./src/api)
  -c, --config <file>       配置文件路径
  --clean                   生成前清理输出目录
  --types-only              只生成类型定义
  --exclude <files>         排除覆盖的文件列表 (逗号分隔，支持通配符)
  -v, --verbose             详细输出
```

### mock 命令

```bash
s2r mock <source> [options]

选项:
  -p, --port <number>       服务端口 (默认: 3001)
  -d, --delay <number>      响应延迟(毫秒) (默认: 0)
  --no-ui                   禁用 Swagger UI
  -c, --config <file>       配置文件路径
  --verbose                 详细输出
```

### init 命令

```bash
s2r init [options]

选项:
  -f, --force               强制覆盖已存在的配置文件
```

### 其他命令

```bash
# AI 文档生成
s2r ai-docs <source> [options]

# NPM 包发布
s2r publish <source> [options]

# 验证 Swagger 文档
s2r validate <source> [options]
```

## 🔧 高级配置

### 文件覆盖策略

- `--exclude "*interceptor*,custom.ts"`: 排除包含 interceptor 的文件和 custom.ts 文件
- `--exclude "*.config.js"`: 排除所有 .config.js 文件
- 默认情况下覆盖所有文件
- 支持通配符匹配和精确文件名匹配

### 配置文件优先级

1. 命令行参数（最高优先级）
2. `.s2r.cjs` 配置文件
3. 默认配置（最低优先级）

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

仓库地址：[https://github.com/CrazyMrYan/swagger-2-request](https://github.com/CrazyMrYan/swagger-2-request)

## 👨‍💻 作者

**CrazyMrYan**
- GitHub: [@CrazyMrYan](https://github.com/CrazyMrYan)
- Email: crazymryan@gmail.com

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件