# 使用示例

## 快速开始

```bash
# 生成 API 客户端
s2r generate https://petstore.swagger.io/v2/swagger.json
```

## 基础用法

```typescript
import { petFindByStatusGet, petPost } from './api';

// 查询宠物
const pets = await petFindByStatusGet({ status: 'available' });

// 创建宠物
const newPet = await petPost({
  data: {
    name: '小白',
    photoUrls: ['https://example.com/photo.jpg'],
    status: 'available'
  }
});
```

## 配置客户端

```typescript
import { apiClient } from './api';

// 设置基础 URL 和认证
apiClient.setBaseURL('https://api.example.com');
apiClient.setHeader('Authorization', 'Bearer your-token');
```

## 错误处理

```typescript
try {
  const pets = await petFindByStatusGet({ status: 'available' });
} catch (error: any) {
  console.error('API 调用失败:', error.message);
}
```

## 启动 Mock 服务

```bash
# 启动 Mock 服务器
s2r mock https://petstore.swagger.io/v2/swagger.json --port 3001
```