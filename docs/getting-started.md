# 快速开始

欢迎使用 S2R！根据您的使用场景，选择最适合的方式开始：

## 🎯 选择您的使用场景

### 场景一：项目直接集成 API 客户端

**适合：** 单个项目使用，需要快速集成 API 调用功能

**优势：** 零配置、立即可用、完全可定制

[👉 查看详细步骤](#方式一项目直接集成)

### 场景二：生成 NPM 包供多项目使用

**适合：** 多个项目共享同一套 API、团队协作开发

**优势：** 版本管理、团队共享、标准化发布

[👉 查看详细步骤](#方式二生成-npm-包)

---

## 安装 S2R

```bash
# 全局安装（推荐）
npm install -g s2r

# 或项目安装
npm install --save-dev s2r
```

---

## 方式一：项目直接集成

### 1. 生成 API 客户端到项目中

```bash
# 生成到默认目录 (./src/api)
s2r generate https://petstore.swagger.io/v2/swagger.json

# 指定输出目录
s2r generate https://petstore.swagger.io/v2/swagger.json --output ./src/services/api

# 从本地文件生成
s2r generate ./swagger.json --output ./src/api
```

### 2. 在项目中使用

```typescript
// 导入生成的 API 函数
import { petFindByStatusGet, petPost, userLoginPost } from './src/api';

// 查询数据
const pets = await petFindByStatusGet({ status: 'available' });
console.log('可用宠物:', pets);

// 提交数据
const newPet = await petPost({
  data: {
    name: '小白',
    photoUrls: ['https://example.com/photo.jpg'],
    status: 'available'
  }
});

// 用户登录
const loginResult = await userLoginPost({
  data: {
    username: 'user123',
    password: 'password123'
  }
});
```

### 3. 配置客户端（可选）

```typescript
import { apiClient } from './src/api';

// 设置基础配置
apiClient.setBaseURL('https://api.yourapp.com');
apiClient.setHeader('Authorization', 'Bearer your-token');
apiClient.setTimeout(10000);
```

---

## 方式二：生成 NPM 包

### 1. 创建 NPM 包项目

```bash
# 创建完整的 NPM 包项目
s2r create my-api-client https://petstore.swagger.io/v2/swagger.json

# 指定包名和输出目录
s2r create ./my-client https://api.example.com/swagger.json --name @company/api-client

# 创建私有包
s2r create ./my-client ./swagger.json --name @company/api-client --private
```

### 2. 构建和发布

```bash
# 进入项目目录
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

### 3. 在其他项目中使用

```bash
# 安装生成的 NPM 包
npm install my-api-client
# 或
npm install @company/api-client
```

```typescript
// 导入并使用
import { petFindByStatusGet, userLoginPost } from 'my-api-client';

// 配置基础 URL（如果需要）
import { apiClient } from 'my-api-client';
apiClient.setBaseURL('https://api.yourapp.com');

// 使用 API
const pets = await petFindByStatusGet({ status: 'available' });
const user = await userLoginPost({ data: { username: 'user', password: 'pass' } });
```

---

## 🛠️ 常用功能

### Mock 服务器（开发调试）

```bash
# 启动 Mock 服务器
s2r mock https://petstore.swagger.io/v2/swagger.json --port 3001

# 访问 Swagger UI
open http://localhost:3001/docs
```

### AI 文档生成

```bash
# 生成 AI 友好的文档
s2r ai-docs https://petstore.swagger.io/v2/swagger.json --output ./docs/api-docs.md
```

### 配置文件使用

创建 `.s2r.json` 配置文件：

```json
{
  "swagger": {
    "source": "https://api.example.com/swagger.json"
  },
  "generation": {
    "outputDir": "./src/api",
    "typescript": true
  }
}
```

然后直接运行：

```bash
s2r generate  # 自动使用配置文件
```

---

## 🎉 完成！下一步做什么？

根据您选择的方式，您已经成功：

**方式一用户：** ✅ 在项目中集成了 API 客户端  
**方式二用户：** ✅ 创建并发布了 NPM 包

### 继续探索

- 📖 [CLI 指南](./cli-guide.md) - 了解所有命令选项
- ⚙️ [配置指南](./configuration-guide.md) - 学习高级配置
- 🚀 [高级功能](./advanced.md) - 拦截器、AI 文档等特性
- 💡 [完整示例](./example.md) - 实际项目使用案例

### 需要帮助？

- 🐛 [提交 Issue](https://github.com/crazymryan/swagger-2-request/issues)
- 💬 [讨论区](https://github.com/crazymryan/swagger-2-request/discussions)
- 📚 [查看源码](https://github.com/crazymryan/swagger-2-request)