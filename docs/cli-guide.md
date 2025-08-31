# 命令行指南

S2R 提供了强大的命令行工具，支持代码生成、Mock 服务、项目创建和包发布等功能。

## 安装

```bash
# 全局安装
npm install -g s2r

# 或使用 yarn
yarn global add s2r

# 或使用 pnpm
pnpm add -g s2r
```

## 基本用法

```bash
s2r <command> [options]
```

查看帮助信息：
```bash
s2r --help
s2r <command> --help
```

## 命令概览

| 命令 | 描述 |
|------|------|
| `generate` | 生成 API 客户端代码 |
| `mock` | 启动 Mock 服务器 |
| `create` | 创建可发布的 API 客户端项目 ⭐ **新功能** |
| `publish` | 发布 API 客户端包到 NPM |
| `ai-docs` | 使用 AI 生成 API 文档 |
| `init` | 初始化配置文件 |

## generate 命令

从 Swagger/OpenAPI 文档生成 TypeScript API 客户端代码。

### 基本语法

```bash
s2r generate <swagger-source> [options]
```

### 参数

- `<swagger-source>` - Swagger 文档的 URL 或本地文件路径

### 选项

| 选项 | 简写 | 类型 | 默认值 | 描述 |
|------|------|------|--------|------|
| `--output` | `-o` | `string` | `./src/api` | 输出目录 |
| `--config` | `-c` | `string` | `.s2r.json` | 配置文件路径 |
| `--naming` | `-n` | `string` | `pathMethod` | 函数命名策略 (`pathMethod` 或 `operationId`) |
| `--no-comments` | | `boolean` | `false` | 不生成注释 |
| `--no-types` | | `boolean` | `false` | 不生成类型定义 |
| `--clean` | | `boolean` | `false` | 清理输出目录 |
| `--exclude` | `-e` | `string[]` | `[]` | 排除的文件模式 |
| `--force` | `-f` | `boolean` | `false` | 强制覆盖所有文件 |

### 示例

```bash
# 从 URL 生成代码
s2r generate https://petstore.swagger.io/v2/swagger.json

# 从本地文件生成
s2r generate ./docs/api.yaml --output ./src/generated

# 使用 operationId 命名
s2r generate swagger.json --naming operationId

# 清理输出目录并强制覆盖
s2r generate swagger.json --clean --force

# 排除特定文件
s2r generate swagger.json --exclude "*test*" "custom-*.ts"

# 不生成注释和类型
s2r generate swagger.json --no-comments --no-types
```

## mock 命令

启动基于 Swagger 文档的 Mock 服务器。

### 基本语法

```bash
s2r mock <swagger-source> [options]
```

### 选项

| 选项 | 简写 | 类型 | 默认值 | 描述 |
|------|------|------|--------|------|
| `--port` | `-p` | `number` | `3001` | 服务器端口 |
| `--delay` | `-d` | `number` | `0` | 响应延迟（毫秒） |
| `--no-ui` | | `boolean` | `false` | 禁用 Swagger UI |
| `--cors` | | `boolean` | `true` | 启用 CORS |
| `--responses` | `-r` | `string` | | 自定义响应文件目录 |

### 示例

```bash
# 启动基本 Mock 服务
s2r mock swagger.json

# 指定端口和延迟
s2r mock swagger.json --port 4000 --delay 500

# 使用自定义响应
s2r mock swagger.json --responses ./mock-data

# 禁用 Swagger UI
s2r mock swagger.json --no-ui
```

## create 命令 ⭐

创建一个完整的、可发布的 API 客户端项目，包含完整的项目结构、配置文件和构建脚本。

### 基本语法

```bash
s2r create <package-name> [swagger-source] [options]
```

### 参数

- `<package-name>` - NPM 包名称（必需，如：`my-api-client` 或 `@company/api-client`）
- `[swagger-source]` - Swagger 文档的 URL 或本地文件路径（可选）

### 选项

| 选项 | 简写 | 类型 | 默认值 | 描述 |
|------|------|------|--------|------|
| `--output` | `-o` | `string` | `./<package-name>` | 项目输出目录 |
| `--description` | `-d` | `string` | | 包描述 |
| `--version` | `-v` | `string` | `1.0.0` | 初始版本 |
| `--author` | `-a` | `string` | | 作者信息 |
| `--license` | `-l` | `string` | `MIT` | 许可证 |
| `--repository` | `-r` | `string` | | 仓库地址 |
| `--private` | | `boolean` | `false` | 是否为私有包 |
| `--registry` | | `string` | | NPM 注册表地址 |
| `--template` | `-t` | `string` | `default` | 项目模板 |

### 模板选项

| 模板 | 描述 |
|------|------|
| `default` | 标准 TypeScript 项目，包含基础配置 |
| `minimal` | 最小化项目结构，仅包含必要文件 |
| `full` | 包含测试、文档、CI/CD 的完整项目 |

### 项目开发流程

创建项目后，可以按以下步骤进行开发：

```bash
# 1. 进入项目目录
cd my-api-client

# 2. 安装依赖
npm install

# 3. 构建项目
npm run build

# 4. 运行测试（full 模板）
npm test

# 5. 发布到 NPM
npm publish
```

### 项目维护

当 API 发生变化时，可以重新生成客户端代码：

```bash
# 更新 API 客户端代码
npm run generate

# 重新构建
npm run build

# 更新版本并发布
npm version patch
npm publish
```

### 示例

```bash
# 创建基本项目
s2r create my-api-client https://api.example.com/swagger.json

# 创建带完整信息的项目
s2r create @company/api-client swagger.json \
  --description "Company API Client" \
  --author "John Doe <john@company.com>" \
  --repository "https://github.com/company/api-client" \
  --private

# 使用完整模板
s2r create my-client swagger.json --template full

# 创建到指定目录
s2r create my-client swagger.json --output ./packages/api-client

# 强制覆盖现有目录
s2r create my-client ./swagger.json --force
```

### 生成的项目结构

```
my-api-client/
├── src/
│   ├── api/          # 生成的 API 代码
│   ├── index.ts      # 主入口文件
│   └── types.ts      # 类型定义
├── tests/            # 测试文件
├── docs/             # 文档
├── .github/          # GitHub Actions
├── package.json      # 包配置
├── tsconfig.json     # TypeScript 配置
├── tsup.config.ts    # 构建配置
├── .eslintrc.js      # ESLint 配置
├── .gitignore        # Git 忽略文件
├── README.md         # 项目说明
└── .s2r.json         # S2R 配置
```

## publish 命令

构建并发布 API 客户端包到 NPM。

### 基本语法

```bash
s2r publish [options]
```

### 选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `--config` | `string` | `.s2r.json` | 配置文件路径 |
| `--no-build` | `boolean` | `false` | 跳过构建步骤 |
| `--no-test` | `boolean` | `false` | 跳过测试 |
| `--dry-run` | `boolean` | `false` | 模拟发布（不实际发布） |
| `--tag` | `string` | `latest` | NPM 标签 |
| `--registry` | `string` | | NPM 注册表地址 |
| `--access` | `string` | `public` | 访问级别 (`public` 或 `restricted`) |

### 示例

```bash
# 标准发布流程
s2r publish

# 模拟发布
s2r publish --dry-run

# 发布到私有注册表
s2r publish --registry https://npm.company.com --access restricted

# 跳过测试直接发布
s2r publish --no-test
```

## ai-docs 命令

使用 AI 从 Swagger 文档生成人类友好的 API 文档。

### 基本语法

```bash
s2r ai-docs <swagger-source> [options]
```

### 选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `--output` | `string` | `./docs` | 输出目录 |
| `--format` | `string` | `markdown` | 输出格式 (`markdown`, `html`) |
| `--language` | `string` | `zh` | 文档语言 |
| `--no-examples` | `boolean` | `false` | 不生成示例 |
| `--no-toc` | `boolean` | `false` | 不生成目录 |

### 示例

```bash
# 生成中文 Markdown 文档
s2r ai-docs swagger.json

# 生成英文 HTML 文档
s2r ai-docs swagger.json --format html --language en

# 不包含示例的简化文档
s2r ai-docs swagger.json --no-examples --no-toc
```

## init 命令

在当前目录初始化 S2R 配置文件。

### 基本语法

```bash
s2r init [options]
```

### 选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `--config` | `string` | `.s2r.json` | 配置文件名 |
| `--template` | `string` | `basic` | 配置模板 (`basic`, `full`) |
| `--force` | `boolean` | `false` | 覆盖现有配置文件 |

### 示例

```bash
# 创建基本配置文件
s2r init

# 创建完整配置文件
s2r init --template full

# 强制覆盖现有配置
s2r init --force
```

## 全局选项

以下选项适用于所有命令：

| 选项 | 简写 | 描述 |
|------|------|------|
| `--help` | `-h` | 显示帮助信息 |
| `--version` | `-V` | 显示版本号 |
| `--verbose` | `-v` | 详细输出 |
| `--quiet` | `-q` | 静默模式 |
| `--no-color` | | 禁用颜色输出 |

## 配置文件集成

大多数命令行选项都可以在配置文件中预设，命令行参数会覆盖配置文件中的设置。

### 示例配置文件

```json
{
  "swagger": {
    "source": "https://api.example.com/swagger.json"
  },
  "generation": {
    "outputDir": "./src/api",
    "functionNaming": "pathMethod",
    "excludeFiles": ["*test*"]
  },
  "mock": {
    "port": 3001,
    "delay": 200
  },
  "package": {
    "name": "@company/api-client",
    "version": "1.0.0",
    "private": true
  }
}
```

## 环境变量

支持通过环境变量配置常用选项：

```bash
# 设置默认输出目录
export S2R_OUTPUT_DIR=./src/generated

# 设置默认配置文件
export S2R_CONFIG_PATH=./config/.s2r.json

# 设置 API 基础地址
export API_BASE_URL=https://api.example.com

# 设置 Mock 服务端口
export S2R_MOCK_PORT=4000
```

## 工作流示例

### 快速开始工作流（推荐）

```bash
# 1. 创建完整的 API 客户端项目
s2r create my-api-client https://api.example.com/swagger.json --template full

# 2. 进入项目目录
cd my-api-client

# 3. 安装依赖
npm install

# 4. 构建项目
npm run build

# 5. 发布到 NPM
npm publish
```

### 开发工作流

```bash
# 1. 初始化项目
s2r init

# 2. 生成 API 客户端
s2r generate https://api.example.com/swagger.json

# 3. 启动 Mock 服务进行开发
s2r mock https://api.example.com/swagger.json --port 3001

# 4. 生成文档
s2r ai-docs https://api.example.com/swagger.json
```

### 发布工作流

#### 方式一：使用 create 命令（推荐）

```bash
# 1. 创建可发布的项目
s2r create @company/api-client https://api.example.com/swagger.json --template full

# 2. 进入项目并安装依赖
cd api-client && npm install

# 3. 构建和发布
npm run build
npm publish
```

#### 方式二：传统方式

```bash
# 1. 创建可发布的项目
s2r create @company/api-client https://api.example.com/swagger.json

# 2. 进入项目目录
cd api-client

# 3. 安装依赖
npm install

# 4. 运行测试
npm test

# 5. 发布到 NPM
s2r publish
```

### API 更新工作流

```bash
# 当 API 发生变化时，更新已发布的客户端项目

# 1. 进入项目目录
cd my-api-client

# 2. 重新生成 API 代码
npm run generate

# 3. 运行测试确保兼容性
npm test

# 4. 更新版本号
npm version patch  # 或 minor/major

# 5. 重新构建和发布
npm run build
npm publish
```

### CI/CD 集成

```yaml
# .github/workflows/api-client.yml
name: API Client

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install S2R
        run: npm install -g s2r
        
      - name: Generate API Client
        run: s2r generate ${{ secrets.SWAGGER_URL }} --output ./src/api
        
      - name: Run Tests
        run: npm test
        
      - name: Publish (on main branch)
        if: github.ref == 'refs/heads/main'
        run: s2r publish
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 故障排除

### 常见问题

**1. 无法访问 Swagger 文档**
```bash
# 检查 URL 是否可访问
curl -I https://api.example.com/swagger.json

# 使用本地文件
s2r generate ./local-swagger.json
```

**2. 生成的代码有语法错误**
```bash
# 启用详细输出查看错误
s2r generate swagger.json --verbose

# 检查 Swagger 文档格式
s2r generate swagger.json --validate
```

**3. Mock 服务启动失败**
```bash
# 检查端口是否被占用
lsof -i :3001

# 使用其他端口
s2r mock swagger.json --port 3002
```

**4. 发布失败**
```bash
# 检查 NPM 登录状态
npm whoami

# 模拟发布查看问题
s2r publish --dry-run
```

### 调试选项

```bash
# 启用详细输出
s2r generate swagger.json --verbose

# 启用调试模式
DEBUG=s2r:* s2r generate swagger.json

# 保存中间文件用于调试
s2r generate swagger.json --debug --keep-temp
```

## 更多资源

- [配置指南](./configuration-guide.md) - 详细的配置选项说明
- [API 参考](./api-reference.md) - 生成代码的 API 文档
- [示例项目](../examples/) - 完整的使用示例
- [GitHub 仓库](https://github.com/CrazyMrYan/swagger-2-request) - 源代码和问题反馈