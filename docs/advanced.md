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

### 完整配置文件

```javascript
// s2r.config.js
module.exports = {
  swagger: {
    source: './swagger.json'
  },
  
  generation: {
    outputDir: './src/api',
    functionNaming: 'pathMethod',
    includeComments: true,
    generateTypes: true
  },
  
  runtime: {
    timeout: 10000,
    validateParams: true,
    filterParams: true
  },
  
  mock: {
    enabled: true,
    port: 3001,
    delay: 200,
    ui: true
  },
  
  package: {
    name: '@company/api-client',
    version: '1.0.0',
    description: 'Generated API client'
  }
};
```

### 环境变量配置

```bash
# 设置环境变量
export API_BASE_URL=https://api.example.com
export S2R_CONFIG_PATH=./config/s2r.config.js
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