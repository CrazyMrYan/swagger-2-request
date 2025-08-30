# 脚本使用

## NPM 脚本配置

在项目的 `package.json` 中添加常用的 S2R 脚本：

```json
{
  "scripts": {
    "api:generate": "s2r generate --config .s2r.cjs",
    "api:generate:clean": "s2r generate --config .s2r.cjs --clean",
    "api:generate:types": "s2r generate --config .s2r.cjs --types-only",
    "api:generate:force": "s2r generate --config .s2r.cjs --force",
    "api:mock": "s2r mock --config .s2r.cjs --port 3001",
    "api:mock:ui": "s2r mock --config .s2r.cjs --port 3001 && open http://localhost:3001/docs",
    "api:validate": "s2r validate --config .s2r.cjs",
    "api:publish": "s2r publish --config .s2r.cjs --preview",
    "api:publish:prod": "s2r publish --config .s2r.cjs",
    "api:docs": "s2r ai-docs --config .s2r.cjs --output ./docs/api.md",
    "api:init": "s2r init --force"
  }
}
```

## 脚本说明

### 代码生成脚本

#### `api:generate`
基础代码生成，使用配置文件中的设置：
```bash
npm run api:generate
```

#### `api:generate:clean`
生成前清理输出目录：
```bash
npm run api:generate:clean
```

#### `api:generate:types`
仅生成类型定义文件：
```bash
npm run api:generate:types
```

#### `api:generate:force`
强制覆盖所有文件（包括 client 文件）：
```bash
npm run api:generate:force
```

### Mock 服务脚本

#### `api:mock`
启动 Mock 服务器：
```bash
npm run api:mock
```

#### `api:mock:ui`
启动 Mock 服务器并打开 Swagger UI：
```bash
npm run api:mock:ui
```

### 验证和发布脚本

#### `api:validate`
验证 Swagger 文档格式：
```bash
npm run api:validate
```

#### `api:publish`
预览模式发布（不实际发布）：
```bash
npm run api:publish
```

#### `api:publish:prod`
正式发布到 NPM：
```bash
npm run api:publish:prod
```

### 文档生成脚本

#### `api:docs`
生成 AI 友好的 API 文档：
```bash
npm run api:docs
```

#### `api:init`
初始化配置文件：
```bash
npm run api:init
```

## 开发工作流

### 日常开发

```bash
# 1. 初始化项目配置
npm run api:init

# 2. 生成 API 客户端
npm run api:generate

# 3. 启动 Mock 服务进行开发
npm run api:mock

# 4. 在另一个终端启动项目
npm start
```

### 更新 API

```bash
# 1. 验证新的 Swagger 文档
npm run api:validate

# 2. 重新生成客户端（保留自定义文件）
npm run api:generate

# 3. 测试更新后的 API
npm test
```

### 发布流程

```bash
# 1. 生成最新的客户端代码
npm run api:generate:clean

# 2. 预览发布内容
npm run api:publish

# 3. 确认无误后正式发布
npm run api:publish:prod
```

## CI/CD 集成

### GitHub Actions

创建 `.github/workflows/api-client.yml`：

```yaml
name: API Client Generation

on:
  push:
    paths: 
      - 'swagger.json'
      - '.s2r.cjs'
  pull_request:
    paths:
      - 'swagger.json'
      - '.s2r.cjs'

jobs:
  generate:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install S2R
        run: npm install -g s2r
        
      - name: Validate Swagger
        run: npm run api:validate
        
      - name: Generate API Client
        run: npm run api:generate:clean
        
      - name: Run tests
        run: npm test
        
      - name: Commit generated files
        if: github.event_name == 'push'
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add src/api/
          git diff --staged --quiet || git commit -m "chore: update API client [skip ci]"
          git push
```

### GitLab CI

创建 `.gitlab-ci.yml`：

```yaml
stages:
  - validate
  - generate
  - test
  - deploy

variables:
  NODE_VERSION: "18"

validate_swagger:
  stage: validate
  image: node:$NODE_VERSION
  script:
    - npm ci
    - npm install -g s2r
    - npm run api:validate
  only:
    changes:
      - swagger.json
      - .s2r.cjs

generate_client:
  stage: generate
  image: node:$NODE_VERSION
  script:
    - npm ci
    - npm install -g s2r
    - npm run api:generate:clean
  artifacts:
    paths:
      - src/api/
    expire_in: 1 hour
  only:
    changes:
      - swagger.json
      - .s2r.cjs

test_client:
  stage: test
  image: node:$NODE_VERSION
  script:
    - npm ci
    - npm test
  dependencies:
    - generate_client
```

## 自定义脚本

### 批量处理多个 API

```bash
#!/bin/bash
# scripts/generate-all-apis.sh

APIS=(
  "user:https://api.example.com/user/swagger.json"
  "order:https://api.example.com/order/swagger.json"
  "payment:https://api.example.com/payment/swagger.json"
)

for api in "${APIS[@]}"; do
  IFS=':' read -r name url <<< "$api"
  echo "Generating API client for $name..."
  s2r generate "$url" --output "./src/api/$name" --clean
done

echo "All API clients generated successfully!"
```

### 环境切换脚本

```bash
#!/bin/bash
# scripts/switch-env.sh

ENV=${1:-dev}

case $ENV in
  "dev")
    export API_BASE_URL="https://dev-api.example.com"
    export S2R_MOCK_PORT=3001
    ;;
  "staging")
    export API_BASE_URL="https://staging-api.example.com"
    export S2R_MOCK_PORT=3002
    ;;
  "prod")
    export API_BASE_URL="https://api.example.com"
    export S2R_MOCK_PORT=3003
    ;;
  *)
    echo "Unknown environment: $ENV"
    exit 1
    ;;
esac

echo "Switched to $ENV environment"
echo "API_BASE_URL: $API_BASE_URL"
echo "MOCK_PORT: $S2R_MOCK_PORT"

# 重新生成客户端
npm run api:generate
```

使用方法：

```bash
# 切换到开发环境
./scripts/switch-env.sh dev

# 切换到生产环境
./scripts/switch-env.sh prod
```