# 配置指南

S2R 提供了灵活的配置系统，支持通过配置文件、环境变量和命令行参数来管理项目设置。

## 配置文件

S2R 支持使用配置文件来管理项目设置，推荐使用 `.s2r.json` 作为配置文件名。

### 基础配置

最简单的配置文件只需要指定 Swagger 文档源：

```json
{
  "_comment": "S2R 基础配置文件",
  "swagger": {
    "source": "https://api.example.com/swagger.json",
    "version": "3.0"
  },
  "generation": {
    "outputDir": "./src/api",
    "functionNaming": "pathMethod",
    "includeComments": true,
    "generateTypes": true,
    "cleanOutput": false,
    "excludeFiles": [],
    "forceOverride": false
  }
}
```

### 完整配置选项

以下是包含所有可用配置选项的完整示例：

```json
{
  "_comment": "S2R 完整配置文件",
  "swagger": {
    "source": "https://petstore.swagger.io/v2/swagger.json",
    "version": "3.0"
  },
  "generation": {
    "outputDir": "./src/api",
    "functionNaming": "pathMethod",
    "includeComments": true,
    "generateTypes": true,
    "cleanOutput": false,
    "excludeFiles": ["*test*", "custom-*.ts"],
    "forceOverride": false
  },
  "runtime": {
    "baseURL": "https://api.example.com",
    "timeout": 10000,
    "validateParams": true,
    "filterParams": true
  },
  "mock": {
    "enabled": true,
    "port": 3001,
    "delay": 200,
    "enableUI": true,
    "customResponses": "./mock-responses"
  },
  "interceptors": {
    "request": {
      "enabled": true
    },
    "response": {
      "enabled": true
    }
  },
  "package": {
    "name": "@company/api-client",
    "version": "1.0.0",
    "description": "Generated API client",
    "repository": "https://github.com/company/api-client",
    "private": false,
    "publishConfig": {
      "registry": "https://registry.npmjs.org"
    }
  }
}
```

## 配置项详解

### swagger 配置

控制 Swagger 文档的解析和处理：

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `string` | - | Swagger 文档地址或本地文件路径 |
| `version` | `string` | `'3.0'` | Swagger 版本 |

**示例：**
```json
{
  "swagger": {
    "source": "./docs/api.yaml",
    "version": "3.0"
  }
}
```

### generation 配置

控制代码生成的行为和输出：

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `outputDir` | `string` | `'./src/api'` | 代码输出目录 |
| `functionNaming` | `'pathMethod' \| 'operationId'` | `'pathMethod'` | 函数命名方式 |
| `includeComments` | `boolean` | `true` | 是否包含注释 |
| `generateTypes` | `boolean` | `true` | 是否生成类型定义 |
| `cleanOutput` | `boolean` | `false` | 是否清理输出目录 |
| `excludeFiles` | `string[]` | `[]` | 排除覆盖的文件列表 |
| `forceOverride` | `boolean` | `false` | 是否强制覆盖所有文件，包括 client 文件 |

**示例：**
```json
{
  "generation": {
    "outputDir": "./src/generated",
    "functionNaming": "operationId",
    "excludeFiles": ["*test*", "custom-*.ts"]
  }
}
```

### runtime 配置

控制运行时的 API 客户端行为：

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `baseURL` | `string` | - | API 基础地址 |
| `timeout` | `number` | `10000` | 请求超时时间（毫秒） |
| `validateParams` | `boolean` | `true` | 是否验证参数 |
| `filterParams` | `boolean` | `true` | 是否过滤空参数 |

**示例：**
```json
{
  "runtime": {
    "baseURL": "https://api.production.com",
    "timeout": 30000,
    "validateParams": false
  }
}
```

### mock 配置

控制 Mock 服务器的行为：

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | `boolean` | `true` | 是否启用 Mock 服务 |
| `port` | `number` | `3001` | Mock 服务端口 |
| `delay` | `number` | `0` | 响应延迟（毫秒） |
| `ui` | `boolean` | `true` | 是否启用 Swagger UI |
| `customResponses` | `string` | - | 自定义响应文件路径 |

**示例：**
```json
{
  "mock": {
    "port": 4000,
    "delay": 500,
    "customResponses": "./mock-data"
  }
}
```

### package 配置

用于 `s2r create` 命令生成可发布的包：

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | `string` | - | NPM 包名称 |
| `version` | `string` | `'1.0.0'` | 包版本 |
| `description` | `string` | - | 包描述 |
| `repository` | `string` | - | 仓库地址 |
| `private` | `boolean` | `false` | 是否为私有包 |
| `publishConfig` | `object` | - | 发布配置 |

**示例：**
```json
{
  "package": {
    "name": "@mycompany/api-client",
    "version": "2.1.0",
    "description": "My Company API Client",
    "repository": "https://github.com/mycompany/api-client",
    "private": true
  }
}
```

## 环境变量

S2R 支持通过环境变量进行配置，这在 CI/CD 环境中特别有用：

```bash
# API 基础地址
export API_BASE_URL=https://api.example.com

# 配置文件路径
export S2R_CONFIG_PATH=./config/.s2r.json

# 输出目录
export S2R_OUTPUT_DIR=./src/generated

# Mock 服务端口
export S2R_MOCK_PORT=3001
```

### 支持的环境变量

| 环境变量 | 对应配置 | 说明 |
|----------|----------|------|
| `API_BASE_URL` | `runtime.baseURL` | API 基础地址 |
| `S2R_CONFIG_PATH` | - | 配置文件路径 |
| `S2R_OUTPUT_DIR` | `generation.outputDir` | 输出目录 |
| `S2R_MOCK_PORT` | `mock.port` | Mock 服务端口 |

## 配置优先级

当同一个配置项在多个地方定义时，S2R 按以下优先级应用配置：

1. **命令行参数** - 最高优先级
2. **环境变量** - 中等优先级
3. **配置文件** - 最低优先级

### 示例

假设你有以下配置文件：

```json
{
  "generation": {
    "outputDir": "./src/api"
  }
}
```

设置了环境变量：
```bash
export S2R_OUTPUT_DIR=./src/generated
```

运行命令：
```bash
s2r generate --output ./custom-api swagger.json
```

最终的输出目录将是 `./custom-api`（命令行参数优先级最高）。

## 配置文件位置

S2R 会按以下顺序查找配置文件：

1. 命令行指定的配置文件（`--config` 参数）
2. 环境变量 `S2R_CONFIG_PATH` 指定的文件
3. 当前目录下的 `.s2r.json`
4. 当前目录下的 `.s2r.js`
5. 当前目录下的 `s2r.config.json`
6. 当前目录下的 `s2r.config.js`

## 配置验证

S2R 会在启动时验证配置文件的格式和内容。如果发现错误，会显示详细的错误信息帮助你修复问题。

常见的配置错误：

- **缺少必需字段**：`swagger.source` 是必需的
- **类型错误**：例如 `generation.includeComments` 应该是布尔值
- **无效的枚举值**：例如 `generation.functionNaming` 只能是 `'pathMethod'` 或 `'operationId'`

## 最佳实践

### 1. 使用版本控制

将配置文件加入版本控制，但敏感信息（如 API 密钥）应通过环境变量传递：

```json
{
  "swagger": {
    "source": "https://api.example.com/swagger.json"
  },
  "runtime": {
    "baseURL": "${API_BASE_URL}"
  }
}
```

### 2. 环境特定配置

为不同环境创建不同的配置文件：

- `.s2r.dev.json` - 开发环境
- `.s2r.prod.json` - 生产环境
- `.s2r.test.json` - 测试环境

### 3. 模块化配置

对于大型项目，可以将配置拆分为多个文件：

```json
{
  "swagger": {
    "source": "./api-specs/main.yaml"
  },
  "generation": {
    "outputDir": "./src/api",
    "excludeFiles": ["./config/exclude-patterns.json"]
  }
}
```

### 4. 文档化配置

在配置文件中使用注释说明各个选项的用途：

```json
{
  "_comment": "生产环境 API 客户端配置",
  "swagger": {
    "source": "https://api.prod.com/swagger.json",
    "_comment_version": "使用 3.0 版本以支持最新特性",
    "version": "3.0"
  }
}
```