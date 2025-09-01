# Swagger Petstore

This is a sample server Petstore server.  You can find out more about Swagger at [http://swagger.io](http://swagger.io) or on [irc.freenode.net, #swagger](http://swagger.io/irc/).  For this sample, you can use the api key `special-key` to test the authorization filters.

## 目录

- [pet](#pet)
- [store](#store)
- [user](#user)

## 📊 API 统计

- **总端点数**: 20
- **平均参数数**: 1.3
- **最常用标签**: pet, user, store

## pet

### POST /pet/{petId}/uploadImage

**摘要**: uploads an image

**参数**:

- `petId` (integer) - **必需**: ID of pet to update
- `additionalMetadata` (string) - 可选: Additional data to pass to server
- `file` (file) - 可选: file to upload

**响应示例**:

```json
{
  "code": 42,
  "type": "example",
  "message": "example"
}
```

**TypeScript 示例**:

```typescript
import { petPetIdUploadImagePost } from './api';

// 调用 API
const result = await petPetIdUploadImagePost('example');
console.log(result);
```

---

### POST /pet

**摘要**: Add a new pet to the store

**参数**:

- `body` (object) - **必需**: Pet object that needs to be added to the store

**TypeScript 示例**:

```typescript
import { petPost } from './api';

const result = await petPost();
console.log(result);
```

---

### PUT /pet

**摘要**: Update an existing pet

**参数**:

- `body` (object) - **必需**: Pet object that needs to be added to the store

**TypeScript 示例**:

```typescript
import { petPut } from './api';

const result = await petPut();
console.log(result);
```

---

### GET /pet/findByStatus

**摘要**: Finds Pets by status

Multiple status values can be provided with comma separated strings

**参数**:

- `status` (array) - **必需**: Status values that need to be considered for filter

**响应示例**:

```json
[
  {
    "id": 42,
    "category": {
      "id": 42,
      "name": "example"
    },
    "name": "doggie",
    "photoUrls": [
      "example"
    ],
    "tags": [
      {
        "id": 42,
        "name": "example"
      }
    ],
    "status": "available"
  }
]
```

**TypeScript 示例**:

```typescript
import { petFindByStatusGet } from './api';

// 调用 API
const result = await petFindByStatusGet({
  status: "example"
});
console.log(result);
```

---

### GET /pet/findByTags

**摘要**: Finds Pets by tags

Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.

**参数**:

- `tags` (array) - **必需**: Tags to filter by

**响应示例**:

```json
[
  {
    "id": 42,
    "category": {
      "id": 42,
      "name": "example"
    },
    "name": "doggie",
    "photoUrls": [
      "example"
    ],
    "tags": [
      {
        "id": 42,
        "name": "example"
      }
    ],
    "status": "available"
  }
]
```

**TypeScript 示例**:

```typescript
import { petFindByTagsGet } from './api';

// 调用 API
const result = await petFindByTagsGet({
  tags: "example"
});
console.log(result);
```

---

### GET /pet/{petId}

**摘要**: Find pet by ID

Returns a single pet

**参数**:

- `petId` (integer) - **必需**: ID of pet to return

**响应示例**:

```json
{
  "id": 42,
  "category": {
    "id": 42,
    "name": "example"
  },
  "name": "doggie",
  "photoUrls": [
    "example"
  ],
  "tags": [
    {
      "id": 42,
      "name": "example"
    }
  ],
  "status": "available"
}
```

**TypeScript 示例**:

```typescript
import { petPetIdGet } from './api';

// 调用 API
const result = await petPetIdGet('example');
console.log(result);
```

---

### POST /pet/{petId}

**摘要**: Updates a pet in the store with form data

**参数**:

- `petId` (integer) - **必需**: ID of pet that needs to be updated
- `name` (string) - 可选: Updated name of the pet
- `status` (string) - 可选: Updated status of the pet

**TypeScript 示例**:

```typescript
import { petPetIdPost } from './api';

// 调用 API
const result = await petPetIdPost('example');
console.log(result);
```

---

### DELETE /pet/{petId}

**摘要**: Deletes a pet

**参数**:

- `api_key` (string) - 可选: 无描述
- `petId` (integer) - **必需**: Pet id to delete

**TypeScript 示例**:

```typescript
import { petPetIdDelete } from './api';

// 调用 API
const result = await petPetIdDelete('example');
console.log(result);
```

---

## store

### GET /store/inventory

**摘要**: Returns pet inventories by status

Returns a map of status codes to quantities

**响应示例**:

```json
{}
```

**TypeScript 示例**:

```typescript
import { storeInventoryGet } from './api';

const result = await storeInventoryGet();
console.log(result);
```

---

### POST /store/order

**摘要**: Place an order for a pet

**参数**:

- `body` (object) - **必需**: order placed for purchasing the pet

**响应示例**:

```json
{
  "id": 42,
  "petId": 42,
  "quantity": 42,
  "shipDate": "example",
  "status": "placed",
  "complete": true
}
```

**TypeScript 示例**:

```typescript
import { storeOrderPost } from './api';

const result = await storeOrderPost();
console.log(result);
```

---

### GET /store/order/{orderId}

**摘要**: Find purchase order by ID

For valid response try integer IDs with value >= 1 and <= 10. Other values will generated exceptions

**参数**:

- `orderId` (integer) - **必需**: ID of pet that needs to be fetched

**响应示例**:

```json
{
  "id": 42,
  "petId": 42,
  "quantity": 42,
  "shipDate": "example",
  "status": "placed",
  "complete": true
}
```

**TypeScript 示例**:

```typescript
import { storeOrderOrderIdGet } from './api';

// 调用 API
const result = await storeOrderOrderIdGet('example');
console.log(result);
```

---

### DELETE /store/order/{orderId}

**摘要**: Delete purchase order by ID

For valid response try integer IDs with positive integer value. Negative or non-integer values will generate API errors

**参数**:

- `orderId` (integer) - **必需**: ID of the order that needs to be deleted

**TypeScript 示例**:

```typescript
import { storeOrderOrderIdDelete } from './api';

// 调用 API
const result = await storeOrderOrderIdDelete('example');
console.log(result);
```

---

## user

### POST /user/createWithList

**摘要**: Creates list of users with given input array

**参数**:

- `body` (array) - **必需**: List of user object

**TypeScript 示例**:

```typescript
import { userCreateWithListPost } from './api';

const result = await userCreateWithListPost();
console.log(result);
```

---

### GET /user/{username}

**摘要**: Get user by user name

**参数**:

- `username` (string) - **必需**: The name that needs to be fetched. Use user1 for testing. 

**响应示例**:

```json
{
  "id": 42,
  "username": "example",
  "firstName": "example",
  "lastName": "example",
  "email": "example",
  "password": "example",
  "phone": "example",
  "userStatus": 42
}
```

**TypeScript 示例**:

```typescript
import { userUsernameGet } from './api';

// 调用 API
const result = await userUsernameGet('example');
console.log(result);
```

---

### PUT /user/{username}

**摘要**: Updated user

This can only be done by the logged in user.

**参数**:

- `username` (string) - **必需**: name that need to be updated
- `body` (object) - **必需**: Updated user object

**TypeScript 示例**:

```typescript
import { userUsernamePut } from './api';

// 调用 API
const result = await userUsernamePut('example');
console.log(result);
```

---

### DELETE /user/{username}

**摘要**: Delete user

This can only be done by the logged in user.

**参数**:

- `username` (string) - **必需**: The name that needs to be deleted

**TypeScript 示例**:

```typescript
import { userUsernameDelete } from './api';

// 调用 API
const result = await userUsernameDelete('example');
console.log(result);
```

---

### GET /user/login

**摘要**: Logs user into the system

**参数**:

- `username` (string) - **必需**: The user name for login
- `password` (string) - **必需**: The password for login in clear text

**响应示例**:

```json
"example"
```

**TypeScript 示例**:

```typescript
import { userLoginGet } from './api';

// 调用 API
const result = await userLoginGet({
  username: "example",
  password: "example"
});
console.log(result);
```

---

### GET /user/logout

**摘要**: Logs out current logged in user session

**TypeScript 示例**:

```typescript
import { userLogoutGet } from './api';

const result = await userLogoutGet();
console.log(result);
```

---

### POST /user/createWithArray

**摘要**: Creates list of users with given input array

**参数**:

- `body` (array) - **必需**: List of user object

**TypeScript 示例**:

```typescript
import { userCreateWithArrayPost } from './api';

const result = await userCreateWithArrayPost();
console.log(result);
```

---

### POST /user

**摘要**: Create user

This can only be done by the logged in user.

**参数**:

- `body` (object) - **必需**: Created user object

**TypeScript 示例**:

```typescript
import { userPost } from './api';

const result = await userPost();
console.log(result);
```

---
