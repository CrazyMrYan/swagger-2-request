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

# 排除特定文件不被覆盖
s2r generate ./swagger.json --exclude "client.ts,utils.ts"

# 使用通配符排除文件
s2r generate ./swagger.json --exclude "*test*,*mock*"

# 强制覆盖所有文件（包括 client 文件）
s2r generate ./swagger.json --force
```

## 使用生成的代码

```typescript
// 导入生成的函数和类型
import { petFindByStatusGet, petPost, petPetIdGet } from './src/api';
import type { Pet } from './src/api/types';

// 查询宠物
const pets = await petFindByStatusGet({ status: 'available' });

// 根据 ID 获取宠物
const pet = await petPetIdGet({ petId: 123 });

// 添加宠物
const newPet: Pet = {
  id: Date.now(),
  name: 'Fluffy',
  category: { id: 1, name: '猫咪' },
  photoUrls: [],
  tags: [],
  status: 'available'
};
const result = await petPost({ data: newPet });
```

## 启动 Mock 服务

```bash
# 启动 Mock 服务器
s2r mock ./swagger.json --port 3001

# 访问 Swagger UI
open http://localhost:3001/docs
```

## 配置文件（可选）

创建 `.s2r.json`：

```json
{
  "_comment": "S2R 配置文件",
  "swagger": {
    "source": "https://petstore.swagger.io/v2/swagger.json",
    "version": "3.0"
  },
  "generation": {
    "outputDir": "./src/api",
    "typescript": true,
    "functionNaming": "pathMethod",
    "includeComments": true,
    "generateTypes": true,
    "cleanOutput": false,
    "excludeFiles": [],
    "forceOverride": false
  },
  "runtime": {
    "baseURL": "https://api.example.com",
    "timeout": 10000,
    "validateParams": true,
    "filterParams": true
  },
  "mock": {
    "enabled": true,
    "port": 3001,
    "delay": 0,
    "enableUI": true
  },
  "interceptors": {
    "request": {
      "enabled": true
    },
    "response": {
      "enabled": true
    }
  }
}
```

然后运行：

```bash
# 使用配置文件生成（无需指定 source）
s2r generate --config ./.s2r.json

# 或者直接运行（自动查找 .s2r.json）
s2r generate
```

## 下一步

- [查看完整示例](./example) - 了解实际项目中的使用方法
- [高级功能](./advanced) - 探索拦截器、AI 文档等高级特性