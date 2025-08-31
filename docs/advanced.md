# 高级功能

本文档介绍 S2R 的高级功能和特性，帮助您充分利用 S2R 的强大能力。

## 🤖 AI 文档生成

S2R 支持将 Swagger 文档转换为 AI 友好的格式，让 AI 工具能够更好地理解和使用您的 API。

### 基础用法

```bash
# 生成 Markdown 格式的 AI 文档
s2r ai-docs https://petstore.swagger.io/v2/swagger.json

# 指定输出文件和格式
s2r ai-docs ./swagger.json --output ./docs/api-docs.md --format md

# 生成 JSON 格式（适合程序化处理）
s2r ai-docs ./swagger.json --format json --output ./docs/api-docs.json
```

### 预设配置

```bash
# 使用不同的预设配置
s2r ai-docs ./swagger.json --preset minimal      # 最小化输出
s2r ai-docs ./swagger.json --preset standard     # 标准输出
s2r ai-docs ./swagger.json --preset comprehensive # 详细输出
s2r ai-docs ./swagger.json --preset search-optimized # 搜索优化
```

### 高级选项

```bash
# 自定义语言和详细程度
s2r ai-docs ./swagger.json --lang en --verbosity detailed

# 控制内容包含
s2r ai-docs ./swagger.json --no-examples --no-code --no-toc

# 优化特定用途
s2r ai-docs ./swagger.json --search --analyze
```

## 📦 NPM 包创建与发布

### 创建完整的 NPM 包项目

```bash
# 创建完整的 NPM 包项目
s2r create my-api-client https://petstore.swagger.io/v2/swagger.json

# 指定输出目录和包名
s2r create ./my-client ./swagger.json --name @company/api-client

# 创建私有包
s2r create ./my-client ./swagger.json --name @company/api-client --private
```

### 发布到 NPM

```bash
# 进入生成的项目目录
cd my-api-client

# 安装依赖
npm install

# 构建项目
npm run build

# 发布到 NPM
npm publish

# 发布到私有注册表
npm publish --registry https://npm.company.com
```

### 生成的项目结构

```
my-api-client/
├── src/
│   ├── api/          # 生成的 API 客户端
│   ├── types/        # TypeScript 类型定义
│   └── index.ts      # 主入口文件
├── dist/             # 构建输出目录
├── package.json      # NPM 包配置
├── tsconfig.json     # TypeScript 配置
├── .s2r.json        # S2R 配置文件
└── README.md         # 使用文档
```

## 🔧 请求/响应拦截器

拦截器允许您在请求发送前和响应返回后执行自定义逻辑。

### 请求拦截器

```typescript
import { apiClient } from './src/api';

// 添加认证 Token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 添加请求日志
apiClient.interceptors.request.use((config) => {
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// 添加请求时间戳
apiClient.interceptors.request.use((config) => {
  config.metadata = {
    startTime: Date.now()
  };
  return config;
});
```

### 响应拦截器

```typescript
// 统一错误处理
apiClient.interceptors.response.use(
  (response) => {
    // 成功响应处理
    const duration = Date.now() - response.config.metadata?.startTime;
    console.log(`[API] 请求完成，耗时: ${duration}ms`);
    return response;
  },
  (error) => {
    // 错误响应处理
    if (error.response?.status === 401) {
      // 清除过期 Token
      localStorage.removeItem('authToken');
      // 跳转到登录页
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 数据转换
apiClient.interceptors.response.use((response) => {
  // 统一处理响应数据格式
  if (response.data && typeof response.data === 'object') {
    // 转换日期字符串为 Date 对象
    const dateFields = ['createdAt', 'updatedAt', 'publishedAt'];
    dateFields.forEach(field => {
      if (response.data[field]) {
        response.data[field] = new Date(response.data[field]);
      }
    });
  }
  return response;
});
```

## ⚙️ 高级配置

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



### Client 文件保护机制

S2R 提供了特殊的 client 文件保护机制。默认情况下，如果 `client.ts` 或 `client.js` 文件已存在，S2R 不会覆盖这些文件，以保护用户的自定义配置：

```bash
# 默认行为：保护已存在的 client 文件
s2r generate ./swagger.json -o ./src/api
# 输出：⚠ 跳过已存在的文件: client.ts

# 强制覆盖所有文件（包括 client 文件）
s2r generate ./swagger.json -o ./src/api --force
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