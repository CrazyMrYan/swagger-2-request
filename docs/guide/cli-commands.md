# CLI 命令

S2R 提供了强大的命令行工具，支持代码生成、Mock 服务、文档转换和包发布等功能。

## 全局选项

所有命令都支持以下全局选项：

```bash
s2r [command] [options]
```

- `--version` - 显示版本号
- `--help` - 显示帮助信息
- `--verbose` - 启用详细日志输出
- `--config <file>` - 指定配置文件路径

## generate 命令

从 Swagger/OpenAPI 文档生成 TypeScript API 客户端。

### 语法

```bash
s2r generate <source> [options]
```

### 参数

- `<source>` - Swagger 文档路径或 URL

### 选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `-o, --output <dir>` | string | `./src/api` | 输出目录 |
| `-c, --config <file>` | string | - | 配置文件路径 |
| `--clean` | boolean | false | 生成前清空输出目录 |
| `--types-only` | boolean | false | 仅生成类型定义 |
| `--verbose` | boolean | false | 启用详细日志 |

### 示例

```bash
# 基础使用
s2r generate ./swagger.json

# 指定输出目录
s2r generate ./swagger.json --output ./src/api

# 从 URL 生成
s2r generate https://petstore.swagger.io/v2/swagger.json

# 清空输出目录
s2r generate ./swagger.json --clean

# 仅生成类型定义
s2r generate ./swagger.json --types-only

# 使用配置文件
s2r generate --config ./s2r.config.js

# 启用详细日志
s2r generate ./swagger.json --verbose
```

### 生成结果

```
src/api/
├── index.ts          # 主入口文件
├── types.ts          # TypeScript 类型定义
├── api.ts            # API 函数实现
├── client.ts         # API 客户端配置
└── utils.ts          # 工具函数
```

## mock 命令

启动 Mock 服务器，集成 Swagger UI。

### 语法

```bash
s2r mock <source> [options]
```

### 参数

- `<source>` - Swagger 文档路径或 URL

### 选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `-p, --port <number>` | number | 3001 | 服务器端口 |
| `-d, --delay <number>` | number | 0 | 响应延迟（毫秒） |
| `--no-ui` | boolean | false | 禁用 Swagger UI |
| `-c, --config <file>` | string | - | 配置文件路径 |
| `--verbose` | boolean | false | 启用详细日志 |

### 示例

```bash
# 启动 Mock 服务器
s2r mock ./swagger.json

# 指定端口
s2r mock ./swagger.json --port 3001

# 添加延迟
s2r mock ./swagger.json --delay 500

# 禁用 Swagger UI
s2r mock ./swagger.json --no-ui

# 使用配置文件
s2r mock --config ./mock.config.js
```

### 访问地址

- **API 端点**: `http://localhost:3001/api/*`
- **Swagger UI**: `http://localhost:3001/docs`
- **健康检查**: `http://localhost:3001/health`
- **API 信息**: `http://localhost:3001/api-info`

## publish 命令

生成并发布 NPM 包。

### 语法

```bash
s2r publish <swagger> [options]
```

### 参数

- `<swagger>` - Swagger 文档路径或 URL

### 选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `-o, --output <dir>` | string | `./package` | 输出目录 |
| `-n, --name <name>` | string | - | 包名称 |
| `-v, --version <version>` | string | `1.0.0` | 包版本 |
| `-d, --description <desc>` | string | - | 包描述 |
| `-a, --author <author>` | string | - | 作者信息 |
| `-l, --license <license>` | string | `MIT` | 许可证 |
| `-r, --registry <url>` | string | - | NPM 注册表 URL |
| `-t, --tag <tag>` | string | `latest` | 发布标签 |
| `--access <level>` | string | `public` | 访问级别 |
| `--preset <preset>` | string | `development` | 预设配置 |
| `--no-build` | boolean | false | 跳过构建步骤 |
| `--no-test` | boolean | false | 跳过测试步骤 |
| `--no-publish` | boolean | false | 仅生成包，不发布 |
| `--dry-run` | boolean | false | 干运行模式 |
| `--private` | boolean | false | 私有包 |
| `--config <file>` | string | - | 配置文件路径 |
| `--preview` | boolean | false | 仅预览包信息 |

### 示例

```bash
# 基础发布
s2r publish ./swagger.json --name @company/api-client

# 指定版本和描述
s2r publish ./swagger.json \
  --name @company/api-client \
  --version 1.0.0 \
  --description "Company API client"

# 预览模式
s2r publish ./swagger.json --name @company/api-client --preview

# 干运行模式
s2r publish ./swagger.json --name @company/api-client --dry-run

# 使用预设配置
s2r publish ./swagger.json --preset production

# 发布到私有注册表
s2r publish ./swagger.json \
  --name @company/api-client \
  --registry https://npm.company.com \
  --private
```

### 预设配置

| 预设 | 构建 | 测试 | 发布 | 干运行 |
|------|------|------|------|--------|
| `development` | ✅ | ❌ | ❌ | ✅ |
| `testing` | ✅ | ✅ | ❌ | ✅ |
| `production` | ✅ | ✅ | ✅ | ❌ |
| `quick` | ✅ | ❌ | ✅ | ❌ |

## ai-docs 命令

生成 AI 友好的文档格式。

### 语法

```bash
s2r ai-docs <source> [options]
```

### 参数

- `<source>` - Swagger 文档路径或 URL

### 选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `-o, --output <file>` | string | `./api-ai.md` | 输出文件路径 |
| `-f, --format <format>` | string | `markdown` | 输出格式 |
| `-p, --preset <preset>` | string | `developer` | 预设配置 |
| `--include-examples` | boolean | false | 包含代码示例 |
| `--include-schemas` | boolean | false | 包含 Schema 定义 |
| `--include-search` | boolean | false | 包含搜索索引 |
| `--language <lang>` | string | `en` | 文档语言 |
| `-c, --config <file>` | string | - | 配置文件路径 |

### 输出格式

- `markdown` - Markdown 格式（推荐）
- `json` - JSON 格式
- `yaml` - YAML 格式

### 预设配置

- `developer` - 开发者友好，包含完整示例
- `documentation` - 文档友好，结构清晰
- `analysis` - 分析友好，包含统计信息

### 示例

```bash
# 生成 Markdown 文档
s2r ai-docs ./swagger.json --output ./docs/api.md

# 生成 JSON 格式
s2r ai-docs ./swagger.json --format json --output ./docs/api.json

# 使用开发者预设
s2r ai-docs ./swagger.json --preset developer --include-examples

# 中文文档
s2r ai-docs ./swagger.json --language zh-CN --output ./docs/api-zh.md

# 包含完整信息
s2r ai-docs ./swagger.json \
  --include-examples \
  --include-schemas \
  --include-search \
  --output ./docs/complete-api.md
```

## validate 命令

验证 Swagger/OpenAPI 文档的有效性。

### 语法

```bash
s2r validate <source> [options]
```

### 参数

- `<source>` - Swagger 文档路径或 URL

### 选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `-v, --verbose` | boolean | false | 显示详细验证结果 |
| `--strict` | boolean | false | 严格模式验证 |
| `--format <format>` | string | `table` | 输出格式 |

### 示例

```bash
# 基础验证
s2r validate ./swagger.json

# 详细验证
s2r validate ./swagger.json --verbose

# 严格模式
s2r validate ./swagger.json --strict

# 从 URL 验证
s2r validate https://petstore.swagger.io/v2/swagger.json
```

## config 命令

配置管理命令。

### 语法

```bash
s2r config <action> [options]
```

### 子命令

#### init - 初始化配置文件

```bash
s2r config init [options]
```

**选项:**
- `--type <type>` - 配置文件类型 (`js`, `ts`, `json`)
- `--template <template>` - 配置模板 (`basic`, `full`, `minimal`)

**示例:**
```bash
# 创建基础配置
s2r config init

# 创建 TypeScript 配置
s2r config init --type ts

# 创建完整配置
s2r config init --template full
```

#### show - 显示当前配置

```bash
s2r config show [options]
```

**选项:**
- `--format <format>` - 输出格式 (`json`, `yaml`, `table`)

**示例:**
```bash
# 显示配置
s2r config show

# JSON 格式输出
s2r config show --format json
```

#### validate - 验证配置文件

```bash
s2r config validate [file]
```

**示例:**
```bash
# 验证默认配置
s2r config validate

# 验证指定配置
s2r config validate ./custom.config.js
```

## doctor 命令

诊断 S2R 环境和配置问题。

### 语法

```bash
s2r doctor [options]
```

### 选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `--fix` | boolean | false | 自动修复问题 |
| `--verbose` | boolean | false | 显示详细诊断信息 |

### 检查项目

- ✅ Node.js 版本
- ✅ NPM/PNPM 版本
- ✅ S2R 安装状态
- ✅ 配置文件有效性
- ✅ 依赖项完整性
- ✅ 权限设置
- ✅ 网络连接

### 示例

```bash
# 运行诊断
s2r doctor

# 自动修复问题
s2r doctor --fix

# 详细诊断
s2r doctor --verbose
```

## 组合使用

### 完整工作流

```bash
# 1. 验证 Swagger 文档
s2r validate ./swagger.json

# 2. 生成 API 客户端
s2r generate ./swagger.json --output ./src/api --clean

# 3. 启动 Mock 服务器
s2r mock ./swagger.json --port 3001 &

# 4. 生成 AI 文档
s2r ai-docs ./swagger.json --output ./docs/api.md --preset developer

# 5. 发布 NPM 包
s2r publish ./swagger.json --name @company/api-client --dry-run
```

### 使用配置文件

```bash
# 使用统一配置文件
s2r generate --config ./s2r.config.js
s2r mock --config ./s2r.config.js  
s2r ai-docs --config ./s2r.config.js
s2r publish --config ./s2r.config.js
```

### 脚本化使用

```bash
#!/bin/bash
# build-api.sh

set -e

echo "🔍 验证 Swagger 文档..."
s2r validate ./api/swagger.json

echo "🚀 生成 API 客户端..."
s2r generate ./api/swagger.json --output ./src/api --clean

echo "📚 生成 AI 文档..."
s2r ai-docs ./api/swagger.json --output ./docs/api.md

echo "✅ API 构建完成!"
```

## 最佳实践

### 1. 使用配置文件

```bash
# 推荐：使用配置文件管理所有选项
s2r generate --config ./s2r.config.js

# 不推荐：使用大量命令行参数
s2r generate ./swagger.json --output ./src/api --clean --types-only --verbose
```

### 2. 环境特定配置

```bash
# 开发环境
NODE_ENV=development s2r mock --config ./s2r.config.js

# 生产环境
NODE_ENV=production s2r publish --config ./s2r.config.js
```

### 3. CI/CD 集成

```bash
# 在 CI 中使用详细日志
s2r generate ./swagger.json --verbose

# 在 CI 中验证配置
s2r config validate
s2r doctor
```

通过这些命令，您可以充分利用 S2R 的强大功能，从代码生成到发布一站式完成。