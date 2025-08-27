# Pet Store API

A simple pet store API for testing

## 目录

- [pets](#pets)

## 📊 API 统计

- **总端点数**: 3
- **平均参数数**: 0.7
- **最常用标签**: pets

## pets

### GET /pets

**摘要**: List all pets

Returns a list of pets

**参数**:

- `limit` (integer) - 可选: How many items to return at one time (max 100)

**TypeScript 示例**:

```typescript
import { petsGet } from './api';

// 调用 API
const result = await petsGet({
  limit: "example"
});
console.log(result);
```

---

### POST /pets

**摘要**: Create a pet

Creates a new pet

**TypeScript 示例**:

```typescript
import { petsPost } from './api';

// 调用 API
const result = await petsPost(requestData);
console.log(result);
```

---

### GET /pets/{petId}

**摘要**: Info for a specific pet

Returns information about a specific pet

**参数**:

- `petId` (string) - **必需**: The id of the pet to retrieve

**TypeScript 示例**:

```typescript
import { petsPetIdGet } from './api';

// 调用 API
const result = await petsPetIdGet('example');
console.log(result);
```

---
