# NPM 包发布指南

S2R 提供了强大的 NPM 包发布功能，可以将生成的 API 客户端直接发布为独立的 NPM 包，方便团队共享和版本管理。

## 基本用法

### 简单发布

```bash
# 基础发布命令
s2r publish ./swagger.json --name @company/api-client

# 指定版本和描述
s2r publish ./swagger.json \
  --name @company/api-client \
  --version 1.0.0 \
  --description "Company API client library"

# 发布到私有注册表
s2r publish ./swagger.json \
  --name @company/api-client \
  --registry https://npm.company.com \
  --private
```

### 预览模式

```bash
# 预览包信息（不实际发布）
s2r publish ./swagger.json --name @company/api-client --preview

# 干运行模式（模拟发布过程）
s2r publish ./swagger.json --name @company/api-client --dry-run
```

## 命令参数详解

### 必需参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `<swagger>` | Swagger 文档路径或 URL | `./swagger.json` |
| `--name <name>` | NPM 包名称 | `@company/api-client` |

### 可选参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `--version <version>` | string | `1.0.0` | 包版本号 |
| `--description <desc>` | string | 自动生成 | 包描述 |
| `--author <author>` | string | - | 作者信息 |
| `--license <license>` | string | `MIT` | 许可证 |
| `--registry <url>` | string | npmjs.org | NPM 注册表 |
| `--tag <tag>` | string | `latest` | 发布标签 |
| `--access <level>` | string | `public` | 访问级别 |
| `--private` | boolean | false | 私有包 |
| `--dry-run` | boolean | false | 干运行模式 |
| `--preview` | boolean | false | 仅预览包信息 |

## 配置文件发布

### 在配置文件中设置包信息

```javascript
// swagger2request.config.js
module.exports = {
  swagger: {
    source: './swagger.json'
  },
  
  // NPM 包配置
  package: {
    name: '@company/api-client',
    version: '1.0.0',
    description: 'Generated API client for company APIs',
    author: 'Your Name <your.email@example.com>',
    license: 'MIT',
    repository: 'https://github.com/company/api-client',
    private: false,
    
    // 发布配置
    publishConfig: {
      registry: 'https://registry.npmjs.org',
      access: 'public',
      tag: 'latest'
    },
    
    // 包文件配置
    files: ['dist', 'types', 'README.md', 'LICENSE'],
    main: 'dist/index.js',
    module: 'dist/index.mjs',
    types: 'dist/index.d.ts',
    
    // 依赖配置
    dependencies: {
      'axios': '^1.6.0',
      'lodash-es': '^4.17.21'
    },
    
    peerDependencies: {
      'typescript': '>=4.5.0'
    }
  }
};
```

### 使用配置文件发布

```bash
# 使用配置文件发布
s2r publish --config ./swagger2request.config.js

# 配置文件 + 命令行参数（命令行参数优先级更高）
s2r publish --config ./swagger2request.config.js --version 1.1.0
```

## 预设配置

S2R 提供了多种预设配置，适应不同的发布场景：

### 可用预设

| 预设 | 构建 | 测试 | 发布 | 干运行 | 适用场景 |
|------|------|------|------|--------|----------|
| `development` | ✅ | ❌ | ❌ | ✅ | 开发调试 |
| `testing` | ✅ | ✅ | ❌ | ✅ | 测试验证 |
| `production` | ✅ | ✅ | ✅ | ❌ | 生产发布 |
| `quick` | ✅ | ❌ | ✅ | ❌ | 快速发布 |

### 使用预设

```bash
# 开发模式（仅构建和验证）
s2r publish ./swagger.json --preset development --name @company/api-client

# 测试模式（构建、测试、但不发布）
s2r publish ./swagger.json --preset testing --name @company/api-client

# 生产模式（完整流程）
s2r publish ./swagger.json --preset production --name @company/api-client

# 快速发布（跳过测试）
s2r publish ./swagger.json --preset quick --name @company/api-client
```

## 生成的包结构

发布的 NPM 包包含以下结构：

```
@company/api-client/
├── dist/                    # 构建输出
│   ├── index.js            # CommonJS 入口
│   ├── index.mjs           # ES Module 入口
│   ├── index.d.ts          # TypeScript 类型定义
│   ├── types.js            # 类型实现
│   ├── types.d.ts          # 类型定义
│   ├── api.js              # API 函数
│   ├── api.d.ts            # API 函数类型
│   ├── client.js           # 客户端类
│   ├── client.d.ts         # 客户端类型
│   ├── utils.js            # 工具函数
│   └── utils.d.ts          # 工具函数类型
├── types/                   # 额外类型文件
├── package.json            # 包配置文件
├── README.md               # 自动生成的文档
├── LICENSE                 # 许可证文件
└── CHANGELOG.md            # 变更日志
```

## 包的使用方式

### 安装和导入

```bash
# 安装发布的包
npm install @company/api-client

# 或使用 pnpm
pnpm add @company/api-client
```

```typescript
// ES Module 导入
import { 
  apiUsersGet, 
  apiUsersPost, 
  APIClient,
  type User,
  type CreateUserRequest 
} from '@company/api-client';

// CommonJS 导入
const { 
  apiUsersGet, 
  apiUsersPost, 
  APIClient 
} = require('@company/api-client');
```

### 配置和使用

```typescript
// 使用默认客户端
import { apiClient, apiUsersGet } from '@company/api-client';

// 配置基础 URL
apiClient.setBaseURL('https://api.company.com');
apiClient.setHeader('Authorization', 'Bearer your-token');

// 调用 API
const users = await apiUsersGet();

// 使用自定义客户端
import { APIClient } from '@company/api-client';

const client = new APIClient({
  baseURL: 'https://api.company.com',
  headers: {
    'Authorization': 'Bearer your-token'
  }
});
```

## 版本管理

### 语义化版本

S2R 支持语义化版本控制（SemVer）：

```bash
# 主版本（破坏性变更）
s2r publish ./swagger.json --name @company/api-client --version 2.0.0

# 次版本（新功能）
s2r publish ./swagger.json --name @company/api-client --version 1.1.0

# 修订版本（bug 修复）
s2r publish ./swagger.json --name @company/api-client --version 1.0.1
```

### 预发布版本

```bash
# 发布 alpha 版本
s2r publish ./swagger.json \
  --name @company/api-client \
  --version 1.1.0-alpha.1 \
  --tag alpha

# 发布 beta 版本
s2r publish ./swagger.json \
  --name @company/api-client \
  --version 1.1.0-beta.1 \
  --tag beta

# 发布 rc 版本
s2r publish ./swagger.json \
  --name @company/api-client \
  --version 1.1.0-rc.1 \
  --tag rc
```

### 安装特定版本

```bash
# 安装最新版本
npm install @company/api-client

# 安装特定版本
npm install @company/api-client@1.0.0

# 安装预发布版本
npm install @company/api-client@alpha
npm install @company/api-client@beta
npm install @company/api-client@1.1.0-alpha.1
```

## 私有包发布

### 发布到私有注册表

```bash
# 发布到私有 NPM 注册表
s2r publish ./swagger.json \
  --name @company/api-client \
  --registry https://npm.company.com \
  --private

# 发布到 GitHub Packages
s2r publish ./swagger.json \
  --name @company/api-client \
  --registry https://npm.pkg.github.com \
  --private
```

### 设置私有注册表认证

```bash
# 设置注册表认证（一次性设置）
npm config set @company:registry https://npm.company.com
npm config set //npm.company.com/:_authToken your-auth-token

# 或使用 .npmrc 文件
echo "@company:registry=https://npm.company.com" >> .npmrc
echo "//npm.company.com/:_authToken=your-auth-token" >> .npmrc
```

## 自动化发布

### 在 CI/CD 中使用

```yaml
# .github/workflows/publish.yml
name: Publish API Client

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        registry-url: 'https://registry.npmjs.org'
    
    - name: Install S2R
      run: npm install -g s2r
    
    - name: Extract version from tag
      id: version
      run: echo "VERSION=${GITHUB_REF#refs/tags/v}" >> $GITHUB_OUTPUT
    
    - name: Publish to NPM
      run: |
        s2r publish ./api/swagger.json \
          --name @company/api-client \
          --version ${{ steps.version.outputs.VERSION }} \
          --preset production
      env:
        NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Package.json 脚本

```json
{
  "scripts": {
    "api:generate": "s2r generate ./api/swagger.json --output ./src/api",
    "api:publish:dev": "s2r publish ./api/swagger.json --preset development --name @company/api-client",
    "api:publish:test": "s2r publish ./api/swagger.json --preset testing --name @company/api-client",
    "api:publish:prod": "s2r publish ./api/swagger.json --preset production --name @company/api-client",
    "api:publish:preview": "s2r publish ./api/swagger.json --preview --name @company/api-client"
  }
}
```

## 包质量控制

### 发布前检查

S2R 在发布前会自动执行以下检查：

1. **TypeScript 编译检查** - 确保代码无类型错误
2. **ESLint 代码检查** - 确保代码质量
3. **包结构验证** - 确保包结构正确
4. **依赖关系检查** - 确保依赖版本兼容
5. **文档生成** - 自动生成 README 和 API 文档

### 自定义检查

```javascript
// swagger2request.config.js
module.exports = {
  package: {
    // 发布前执行的脚本
    prePublish: [
      'npm run lint',
      'npm run test',
      'npm run build:docs'
    ],
    
    // 发布后执行的脚本
    postPublish: [
      'npm run notify:slack',
      'npm run update:docs'
    ]
  }
};
```

## 故障排除

### 常见问题

#### 1. 包名冲突

```bash
# 错误信息
npm ERR! 409 Conflict - PUT https://registry.npmjs.org/@company%2fapi-client - cannot modify pre-existing version

# 解决方案：更新版本号
s2r publish ./swagger.json --name @company/api-client --version 1.0.1
```

#### 2. 权限不足

```bash
# 错误信息
npm ERR! 403 Forbidden - PUT https://registry.npmjs.org/@company%2fapi-client - you do not have permission to publish

# 解决方案：检查 NPM 认证
npm whoami
npm login
```

#### 3. 网络问题

```bash
# 错误信息
npm ERR! network request to https://registry.npmjs.org failed

# 解决方案：检查网络和代理设置
npm config get registry
npm config get proxy
```

### 调试技巧

```bash
# 启用详细日志
s2r publish ./swagger.json --name @company/api-client --verbose

# 使用干运行模式调试
s2r publish ./swagger.json --name @company/api-client --dry-run

# 仅预览包信息
s2r publish ./swagger.json --name @company/api-client --preview
```

## 最佳实践

### 1. 命名约定

```bash
# 推荐：使用组织范围
@company/api-client
@company/user-service-client
@company/payment-api

# 避免：过于通用的名称
api-client
client
sdk
```

### 2. 版本策略

```bash
# 推荐：遵循语义化版本
1.0.0    # 首次发布
1.0.1    # Bug 修复
1.1.0    # 新功能
2.0.0    # 破坏性变更

# 推荐：使用预发布版本进行测试
1.1.0-alpha.1
1.1.0-beta.1
1.1.0-rc.1
```

### 3. 文档维护

```bash
# 自动生成完整的 README
s2r publish ./swagger.json \
  --name @company/api-client \
  --description "Complete API client with authentication and error handling"

# 包含使用示例和配置说明
```

### 4. 持续集成

```bash
# 在 CI 中使用测试预设
s2r publish ./swagger.json --preset testing --name @company/api-client

# 仅在 tag 推送时发布
if [[ $GITHUB_REF == refs/tags/* ]]; then
  s2r publish ./swagger.json --preset production --name @company/api-client
fi
```

通过 S2R 的 NPM 包发布功能，您可以轻松地将 API 客户端打包发布，实现团队间的代码共享和版本管理。