# 配置说明

## 配置文件

S2R 支持使用配置文件来管理项目设置，推荐使用 `.s2r.json` 作为配置文件名。

### 基础配置

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

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `string` | - | Swagger 文档地址或本地文件路径 |
| `version` | `string` | `'3.0'` | Swagger 版本 |

### generation 配置

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `outputDir` | `string` | `'./src/api'` | 代码输出目录 |
| `functionNaming` | `'pathMethod' \| 'operationId'` | `'pathMethod'` | 函数命名方式 |
| `includeComments` | `boolean` | `true` | 是否包含注释 |
| `generateTypes` | `boolean` | `true` | 是否生成类型定义 |
| `cleanOutput` | `boolean` | `false` | 是否清理输出目录 |
| `excludeFiles` | `string[]` | `[]` | 排除覆盖的文件列表 |
| `forceOverride` | `boolean` | `false` | 是否强制覆盖所有文件，包括 client 文件 |

### runtime 配置

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `baseURL` | `string` | - | API 基础地址 |
| `timeout` | `number` | `10000` | 请求超时时间（毫秒） |
| `validateParams` | `boolean` | `true` | 是否验证参数 |
| `filterParams` | `boolean` | `true` | 是否过滤空参数 |

### mock 配置

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | `boolean` | `true` | 是否启用 Mock 服务 |
| `port` | `number` | `3001` | Mock 服务端口 |
| `delay` | `number` | `0` | 响应延迟（毫秒） |
| `ui` | `boolean` | `true` | 是否启用 Swagger UI |
| `customResponses` | `string` | - | 自定义响应文件路径 |

### package 配置

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | `string` | - | NPM 包名称 |
| `version` | `string` | `'1.0.0'` | 包版本 |
| `description` | `string` | - | 包描述 |
| `repository` | `string` | - | 仓库地址 |
| `private` | `boolean` | `false` | 是否为私有包 |
| `publishConfig` | `object` | - | 发布配置 |

## 环境变量

S2R 支持通过环境变量进行配置：

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

## 配置优先级

配置的优先级从高到低：

1. **命令行参数** - 最高优先级
2. **环境变量** - 中等优先级
3. **配置文件** - 最低优先级

例如：

```bash
# 命令行参数会覆盖配置文件中的设置
s2r generate --output ./custom-api --exclude "*.test.ts"
```