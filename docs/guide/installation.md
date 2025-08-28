# 安装配置

本页面详细介绍 S2R 的安装方法和配置选项。

## 系统要求

### 运行环境

- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0 或 **pnpm**: >= 7.0.0
- **操作系统**: Windows, macOS, Linux

### 支持的 OpenAPI 版本

- **OpenAPI 2.0** (Swagger 2.0)
- **OpenAPI 3.0.x**
- **OpenAPI 3.1.x**

## 安装方法

### 全局安装 (推荐)

全局安装 CLI 工具，可在任何地方使用 `s2r` 命令：

```bash
# 使用 npm
npm install -g s2r

# 使用 pnpm
pnpm add -g s2r

# 使用 yarn
yarn global add s2r
```

安装完成后验证：

```bash
s2r --version
s2r --help
```

### 项目本地安装

在项目中安装，用于构建脚本和 CI/CD：

```bash
# 使用 npm
npm install --save-dev s2r

# 使用 pnpm
pnpm add -D s2r

# 使用 yarn
yarn add -D s2r
```

在 package.json 中添加脚本：

```json
{
  "scripts": {
    "generate": "s2r generate ./swagger.json --output ./src/api",
    "mock": "s2r mock ./swagger.json --port 3001",
    "docs": "s2r ai-docs ./swagger.json --output ./docs/api.md"
  }
}
```

### Docker 使用

使用 Docker 运行 S2R，无需本地安装 Node.js：

```bash
# 拉取镜像
docker pull s2r/cli:latest

# 代码生成
docker run --rm -v $(pwd):/workspace s2r/cli:latest \
  generate /workspace/swagger.json --output /workspace/src/api

# Mock 服务器
docker run --rm -p 3001:3001 -v $(pwd):/workspace s2r/cli:latest \
  mock /workspace/swagger.json --port 3001
```

创建 docker-compose.yml：

```yaml
version: '3.8'
services:
  s2r-mock:
    image: s2r/cli:latest
    command: mock /workspace/swagger.json --port 3001
    ports:
      - "3001:3001"
    volumes:
      - .:/workspace
    environment:
      - NODE_ENV=development
```

## 配置文件

### 创建配置文件

S2R 支持多种配置文件格式：

```bash
# JavaScript 配置
touch s2r.config.js

# TypeScript 配置
touch s2r.config.ts

# JSON 配置
touch s2r.config.json
```

### JavaScript 配置文件

```javascript
// s2r.config.js
export default {
  // Swagger 文档配置
  swagger: {
    source: './api/swagger.json',
    version: 'auto', // 'auto', '2.0', '3.0', '3.1'
  },

  // 代码生成配置
  generation: {
    outputDir: './src/api',
    typescript: true,
    functionNaming: 'pathMethod', // 'pathMethod' | 'operationId'
    includeComments: true,
    generateTypes: true,
    cleanOutput: true,
  },

  // 运行时配置
  runtime: {
    timeout: 10000,
    validateParams: true,
    filterParams: true,
    retries: 3,
    baseURL: process.env.API_BASE_URL,
  },

  // 拦截器配置
  interceptors: {
    request: [
      {
        name: 'auth',
        handler: './interceptors/auth.js',
        config: {
          type: 'bearer',
          token: process.env.API_TOKEN
        }
      }
    ],
    response: [
      {
        name: 'logger',
        handler: './interceptors/logger.js',
        config: {
          level: 'info'
        }
      }
    ]
  },

  // Mock 服务配置
  mock: {
    enabled: process.env.NODE_ENV === 'development',
    port: 3001,
    delay: 200,
    ui: true,
    customResponses: './mock/responses.json'
  },

  // AI 文档配置
  aiDocs: {
    format: 'markdown',
    preset: 'developer',
    includeExamples: true,
    includeSchemas: true,
    language: 'zh-CN'
  },

  // NPM 包配置
  package: {
    name: '@company/api-client',
    version: '1.0.0',
    description: 'API client for Company API',
    author: 'Company Team',
    license: 'MIT',
    repository: 'https://github.com/company/api-client',
    private: false
  }
};
```

### TypeScript 配置文件

```typescript
// s2r.config.ts
import type { S2RConfig } from 's2r';

const config: S2RConfig = {
  swagger: {
    source: './api/swagger.json'
  },
  
  generation: {
    outputDir: './src/api',
    typescript: true,
    functionNaming: 'pathMethod',
    includeComments: true,
    generateTypes: true,
    cleanOutput: true
  },
  
  // 类型安全的配置
  runtime: {
    timeout: 15000,
    validateParams: true,
    filterParams: true
  }
};

export default config;
```

### JSON 配置文件

```json
{
  "swagger": {
    "source": "./api/swagger.json"
  },
  "generation": {
    "outputDir": "./src/api",
    "typescript": true,
    "functionNaming": "pathMethod",
    "includeComments": true,
    "generateTypes": true,
    "cleanOutput": true
  },
  "runtime": {
    "timeout": 10000,
    "validateParams": true,
    "filterParams": true
  }
}
```

## 环境配置

### 环境变量

S2R 支持通过环境变量进行配置：

```bash
# .env
# API 配置
API_BASE_URL=https://api.example.com
API_TOKEN=your-api-token
API_TIMEOUT=30000

# S2R 配置
S2R_OUTPUT_DIR=./src/api
S2R_CLEAN_OUTPUT=true
S2R_TYPESCRIPT=true

# Mock 配置
S2R_MOCK_PORT=3001
S2R_MOCK_DELAY=200
S2R_MOCK_ENABLED=true

# 调试配置
S2R_DEBUG=true
S2R_VERBOSE=true
```

在配置文件中使用：

```javascript
// s2r.config.js
export default {
  generation: {
    outputDir: process.env.S2R_OUTPUT_DIR || './src/api',
    cleanOutput: process.env.S2R_CLEAN_OUTPUT === 'true'
  },
  
  runtime: {
    baseURL: process.env.API_BASE_URL,
    timeout: parseInt(process.env.API_TIMEOUT) || 10000
  },
  
  mock: {
    port: parseInt(process.env.S2R_MOCK_PORT) || 3001,
    delay: parseInt(process.env.S2R_MOCK_DELAY) || 0,
    enabled: process.env.S2R_MOCK_ENABLED === 'true'
  }
};
```

### 多环境配置

```javascript
// s2r.config.js
const environment = process.env.NODE_ENV || 'development';

const baseConfig = {
  swagger: {
    source: './api/swagger.json'
  },
  generation: {
    outputDir: './src/api',
    typescript: true
  }
};

const envConfigs = {
  development: {
    ...baseConfig,
    runtime: {
      baseURL: 'http://localhost:3001',
      timeout: 10000
    },
    mock: {
      enabled: true,
      port: 3001,
      delay: 200,
      ui: true
    }
  },
  
  staging: {
    ...baseConfig,
    runtime: {
      baseURL: 'https://api-staging.example.com',
      timeout: 15000
    },
    mock: {
      enabled: false
    }
  },
  
  production: {
    ...baseConfig,
    runtime: {
      baseURL: 'https://api.example.com',
      timeout: 30000
    },
    mock: {
      enabled: false
    }
  }
};

export default envConfigs[environment];
```

## IDE 集成

### VSCode 配置

创建 `.vscode/settings.json`：

```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.preferences.useAliasesForRenames": false,
  "typescript.suggest.autoImports": true,
  
  "files.associations": {
    "s2r.config.*": "javascript"
  },
  
  "emmet.includeLanguages": {
    "typescript": "html"
  }
}
```

创建 `.vscode/tasks.json`：

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "S2R: Generate API Client",
      "type": "shell",
      "command": "s2r",
      "args": ["generate", "./swagger.json", "--output", "./src/api"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "S2R: Start Mock Server",
      "type": "shell",
      "command": "s2r",
      "args": ["mock", "./swagger.json", "--port", "3001"],
      "group": "build",
      "isBackground": true,
      "presentation": {
        "echo": true,
        "reveal": "always",
        "panel": "new"
      }
    }
  ]
}
```

### WebStorm 配置

创建运行配置：

1. **Run > Edit Configurations**
2. **Add New Configuration > npm**
3. **Script**: generate
4. **Arguments**: --config s2r.config.js

## 项目集成

### 与构建工具集成

#### Webpack

```javascript
// webpack.config.js
const S2RPlugin = require('s2r/webpack-plugin');

module.exports = {
  plugins: [
    new S2RPlugin({
      configFile: './s2r.config.js',
      watch: process.env.NODE_ENV === 'development'
    })
  ]
};
```

#### Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { s2rPlugin } from 's2r/vite-plugin';

export default defineConfig({
  plugins: [
    s2rPlugin({
      configFile: './s2r.config.js',
      watch: true
    })
  ]
});
```

#### Rollup

```javascript
// rollup.config.js
import { s2rPlugin } from 's2r/rollup-plugin';

export default {
  plugins: [
    s2rPlugin({
      configFile: './s2r.config.js'
    })
  ]
};
```

### Git 集成

#### .gitignore

```gitignore
# S2R 生成的文件
src/api/
*.generated.ts
*.generated.js

# S2R 配置 (如果包含敏感信息)
s2r.config.local.*
.env.local

# S2R 缓存
.s2r-cache/
```

#### Git Hooks

```bash
#!/bin/sh
# .git/hooks/pre-commit

# 检查 Swagger 文档是否有效
s2r validate ./swagger.json

# 重新生成 API 客户端
s2r generate ./swagger.json --output ./src/api

# 添加生成的文件到提交
git add src/api/
```

### CI/CD 集成

#### GitHub Actions

```yaml
# .github/workflows/s2r.yml
name: S2R Code Generation

on:
  push:
    paths:
      - 'api/swagger.json'
      - 's2r.config.*'

jobs:
  generate:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install S2R
        run: npm install -g s2r
      
      - name: Generate API client
        run: s2r generate --config s2r.config.js
      
      - name: Run tests
        run: npm test
      
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add src/api/
          git commit -m "Update API client" || exit 0
          git push
```

#### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - generate
  - test

generate-api:
  stage: generate
  image: node:18
  script:
    - npm install -g s2r
    - s2r generate --config s2r.config.js
  artifacts:
    paths:
      - src/api/
  only:
    changes:
      - api/swagger.json
      - s2r.config.*

test-api:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm test
  dependencies:
    - generate-api
```

## 故障排除

### 常见问题

#### 1. 安装失败

```bash
# 清除缓存
npm cache clean --force

# 使用不同的镜像源
npm install -g s2r --registry https://registry.npmmirror.com

# 检查 Node.js 版本
node --version  # 应该 >= 16.0.0
```

#### 2. 权限问题

```bash
# macOS/Linux
sudo npm install -g s2r

# 或者使用 nvm 管理 Node.js 版本
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
npm install -g s2r
```

#### 3. 配置文件不生效

```bash
# 检查配置文件语法
node -c s2r.config.js

# 检查配置文件路径
s2r generate --config ./s2r.config.js --verbose

# 使用绝对路径
s2r generate --config /absolute/path/to/s2r.config.js
```

#### 4. TypeScript 类型错误

```bash
# 重新生成类型定义
s2r generate --types-only --output ./src/api

# 检查 TypeScript 配置
npx tsc --noEmit

# 更新 TypeScript 版本
npm update typescript
```

### 调试模式

启用详细日志来调试问题：

```bash
# 启用详细日志
s2r generate ./swagger.json --verbose

# 启用调试模式
DEBUG=s2r:* s2r generate ./swagger.json

# 查看配置信息
s2r config --show
```

### 获取帮助

```bash
# 查看命令帮助
s2r --help
s2r generate --help
s2r mock --help

# 查看版本信息
s2r --version

# 检查环境信息
s2r doctor
```

通过以上配置，您可以将 S2R 完美集成到您的开发工作流中，提升 API 客户端开发的效率和质量。