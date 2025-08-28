# 完整示例

本示例展示如何在实际项目中使用 S2R。

## 项目设置

```bash
# 创建项目
mkdir my-api-project && cd my-api-project
npm init -y

# 安装依赖
npm install s2r axios

# 生成 API 客户端
npx s2r generate https://carty-harp-backend-test.xiaotunqifu.com/v3/api-docs --output ./src/api
```

## 基础用法

```typescript
// src/index.ts
import { apiUsersGet, apiUsersPost } from './api';

async function main() {
  // 获取用户列表
  const users = await apiUsersGet();
  console.log('用户数量:', users.length);

  // 创建新用户
  const newUser = await apiUsersPost({
    name: '张三',
    email: 'zhangsan@example.com'
  });
  console.log('创建用户:', newUser);
}

main().catch(console.error);
```

## 客户端配置

```typescript
// src/api-config.ts
import { apiClient } from './api';

// 设置基础配置
apiClient.setBaseURL('https://api.example.com');
apiClient.setHeader('Authorization', 'Bearer your-token');
apiClient.setTimeout(30000);
```

## 错误处理

```typescript
async function safeApiCall() {
  try {
    const users = await apiUsersGet();
    return users;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.log('资源不存在');
    } else {
      console.error('API 调用失败:', error.message);
    }
    return [];
  }
}
```

## Mock 服务开发

```bash
# 启动 Mock 服务器进行开发
npx s2r mock ./swagger.json --port 3001 &

# 运行项目
npm start
```

## NPM 包发布

```bash
# 生成并发布 NPM 包
npx s2r publish ./swagger.json --name @company/api-client

# 安装使用
npm install @company/api-client
```

## 项目脚本

在 `package.json` 中添加常用脚本：

```json
{
  "scripts": {
    "api:generate": "s2r generate ./swagger.json --output ./src/api",
    "api:mock": "s2r mock ./swagger.json --port 3001",
    "api:publish": "s2r publish ./swagger.json --name @company/api-client"
  }
}
```

这样就完成了一个完整的项目设置！