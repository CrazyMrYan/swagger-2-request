# 高级功能

## AI 友好文档转换

将 OpenAPI 文档转换为 AI 优化的格式：

```bash
# 生成 AI 友好的文档
s2r ai-docs ./swagger.json --output ./docs/api-ai.md

# 生成 JSON 格式
s2r ai-docs ./swagger.json --format json --output ./docs/api.json
```

## NPM 包发布

```bash
# 生成并发布 NPM 包
s2r publish ./swagger.json --name @company/api-client

# 预览模式（不实际发布）
s2r publish ./swagger.json --name @company/api-client --preview

# 发布到私有注册表
s2r publish ./swagger.json \
  --name @company/api-client \
  --registry https://npm.company.com \
  --private
```

## 高级配置

### 文件排除配置

使用 `excludeFiles` 可以指定在重新生成时不覆盖的文件：

```bash
# 命令行方式排除文件
s2r generate ./swagger.json --exclude "client.ts,utils.ts"

# 使用通配符排除文件
s2r generate ./swagger.json --exclude "*test*,*mock*,custom-*"
```

配置文件方式：

```json
{
  "_comment": "S2R 配置文件 - 文件排除示例",
  "generation": {
    "excludeFiles": [
      "*test*",
      "custom-client.ts",
      "*interceptor*",
      "*.config.ts"
    ]
  }
}
```

**注意**：命令行参数会覆盖配置文件中的设置。

### Client 文件保护机制

S2R 提供了特殊的 client 文件保护机制。默认情况下，如果 `client.ts` 或 `client.js` 文件已存在，S2R 不会覆盖这些文件，以保护用户的自定义配置：

```bash
# 默认行为：保护已存在的 client 文件
s2r generate ./swagger.json -o ./src/api
# 输出：⚠ 跳过已存在的文件: client.ts

# 强制覆盖所有文件（包括 client 文件）
s2r generate ./swagger.json -o ./src/api --force
# 输出：✓ 覆盖 client.ts
```

配置文件方式：

```json
{
  "_comment": "S2R 配置文件 - 文件保护示例",
  "generation": {
    "forceOverride": false
  }
}
```

**使用场景**：
- **开发阶段**：使用默认设置保护自定义的 client 配置
- **CI/CD 环境**：使用 `--force` 确保生成最新的代码
- **团队协作**：避免意外覆盖团队成员的自定义配置

### 完整配置文件

```json
{
  "_comment": "S2R 高级配置示例",
  "swagger": {
    "source": "https://petstore.swagger.io/v2/swagger.json"
  },
  "generation": {
    "outputDir": "./src/api",
    "functionNaming": "pathMethod",
    "includeComments": true,
    "generateTypes": true,
    "excludeFiles": ["*test*", "custom-client.ts"],
    "forceOverride": false
  },
  "runtime": {
    "timeout": 10000,
    "validateParams": true,
    "filterParams": true
  },
  "mock": {
    "enabled": true,
    "port": 3001,
    "delay": 200,
    "enableUI": true
  },
  "package": {
    "name": "@company/api-client",
    "version": "1.0.0",
    "description": "Generated API client"
  }
}
```

### 环境变量配置

```bash
# 设置环境变量
export API_BASE_URL=https://api.example.com
export S2R_CONFIG_PATH=./config/.s2r.json
export S2R_OUTPUT_DIR=./src/generated
```

## 集成到 CI/CD

### GitHub Actions

```yaml
# .github/workflows/api-client.yml
name: Generate API Client

on:
  push:
    paths: ['api/swagger.json']

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install S2R
        run: npm install -g s2r
      
      - name: Generate API Client
        run: s2r generate ./api/swagger.json --output ./src/api
      
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add src/api/
          git commit -m "Update API client" || exit 0
          git push
```

### 项目脚本

```json
{
  "scripts": {
    "api:generate": "s2r generate ./swagger.json --output ./src/api",
    "api:mock": "s2r mock ./swagger.json --port 3001",
    "api:validate": "s2r validate ./swagger.json",
    "api:publish": "s2r publish ./swagger.json --name @company/api-client",
    "api:docs": "s2r ai-docs ./swagger.json --output ./docs/api.md"
  }
}
```