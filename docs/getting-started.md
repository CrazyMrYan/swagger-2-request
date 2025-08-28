# 快速开始

## 安装

```bash
# 全局安装
npm install -g s2r

# 或项目安装
npm install --save-dev s2r
```

## 生成 API 客户端

```bash
# 基础使用
s2r generate https://petstore.swagger.io/v2/swagger.json

# 指定输出目录
s2r generate ./swagger.json --output ./src/api
```

## 使用生成的代码

```typescript
// 导入生成的函数
import { petPetIdGet, petPost } from './src/api';

// 调用 API
const pet = await petPetIdGet('123');
const newPet = await petPost({ name: 'Fluffy', photoUrls: [] });
```

## 启动 Mock 服务

```bash
# 启动 Mock 服务器
s2r mock ./swagger.json --port 3001

# 访问 Swagger UI
open http://localhost:3001/docs
```

## 配置文件（可选）

创建 `s2r.config.js`：

```javascript
module.exports = {
  swagger: {
    source: './swagger.json'
  },
  generation: {
    outputDir: './src/api',
    functionNaming: 'pathMethod'
  }
};
```

然后运行：

```bash
s2r generate --config ./s2r.config.js
```

## 下一步

- [查看完整示例](./example) - 了解实际项目中的使用方法
- [高级功能](./advanced) - 探索拦截器、AI 文档等高级特性