# API 接口文档

## 1. 认证相关

### 1.1 GitHub OAuth 认证

**端点**: `POST /api/auth/[...nextauth]`

**描述**: 使用GitHub OAuth进行用户认证。

**请求方法**: POST

**请求头**: 
- `Content-Type: application/json`

**请求参数**: 
- 无

**响应示例**:
```json
{
  "url": "https://github.com/login/oauth/authorize?client_id=your_client_id&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fgithub&scope=user%3Aemail"
}
```

## 2. 文章相关

### 2.1 创建新文章

**端点**: `POST /api/post`

**描述**: 创建新的文章。

**请求方法**: POST

**请求头**: 
- `Content-Type: application/json`
- `Cookie: auth_token` (用户认证Cookie)

**请求参数**:
```typescript
{
  title: string;           // 文章标题
  description: string | null; // 文章描述
  content: string;         // 文章内容 (Markdown格式)
  tags: string[];          // 标签列表
}
```

**响应状态码**:
- 200: 成功创建
- 401: 未登录
- 403: 没有权限
- 400: 数据错误
- 500: 数据库错误

**成功响应示例**:
```json
{
  "status": "ok",
  "post_id": 123
}
```

**错误响应示例**:
```json
{
  "status": "error",
  "post_id": null
}
```

### 2.2 更新文章版本

**端点**: `POST /api/post/{postId}`

**描述**: 为指定文章创建新版本。

**请求方法**: POST

**请求头**: 
- `Content-Type: application/json`
- `Cookie: auth_token` (用户认证Cookie)

**请求参数**:
```typescript
{
  title: string;           // 文章标题
  description: string | null; // 文章描述
  content: string;         // 文章内容 (Markdown格式)
  postId: number;          // 文章ID
  publish: boolean;        // 是否发布新版本
  tags?: string[];         // 标签列表 (可选)
}
```

**响应状态码**:
- 200: 成功创建
- 401: 未登录
- 403: 没有权限
- 400: 数据错误
- 500: 数据库错误

**成功响应示例**:
```json
{
  "status": "ok"
}
```

### 2.3 获取文章列表

**端点**: `GET /api/post`

**描述**: 获取文章列表。

**请求方法**: GET

**请求头**: 
- `Cookie: auth_token` (用户认证Cookie，可选)

**请求参数**: 
- 无

**响应状态码**:
- 200: 成功获取
- 500: 数据库错误

**成功响应示例**:
```json
[
  {
    "id": 1,
    "create_time": "2024-01-01T00:00:00.000Z",
    "userId": "user123",
    "current_version": 1,
    "Post": {
      "id": 1,
      "create_time": "2024-01-01T00:00:00.000Z",
      "userId": "user123",
      "current_version": 1
    }
  }
]
```

### 2.4 获取特定文章

**端点**: `GET /api/post/{id}`

**描述**: 获取指定ID的文章信息。

**请求方法**: GET

**请求头**: 
- `Cookie: auth_token` (用户认证Cookie，可选)

**请求参数**:
- `id` (路径参数): 文章ID

**响应状态码**:
- 200: 成功获取
- 404: 文章不存在
- 500: 数据库错误

**成功响应示例**:
```json
{
  "id": 1,
  "create_time": "2024-01-01T00:00:00.000Z",
  "userId": "user123",
  "current_version": 1,
  "Post": {
    "id": 1,
    "create_time": "2024-01-01T00:00:00.000Z",
    "userId": "user123",
    "current_version": 1
  }
}
```

### 2.5 获取文章版本历史

**端点**: `GET /api/post/{id}/{version}`

**描述**: 获取指定文章版本的历史信息。

**请求方法**: GET

**请求头**: 
- `Cookie: auth_token` (用户认证Cookie，可选)

**请求参数**:
- `id` (路径参数): 文章ID
- `version` (路径参数): 版本号

**响应状态码**:
- 200: 成功获取
- 404: 版本不存在
- 500: 数据库错误

**成功响应示例**:
```json
{
  "version": 1,
  "title": "文章标题",
  "description": "文章描述",
  "content": "文章内容",
  "update_time": "2024-01-01T00:00:00.000Z",
  "postId": 1,
  "tags": [
    "标签1",
    "标签2"
  ]
}
```

## 3. 标签相关

### 3.1 获取所有标签

**端点**: `GET /api/tags`

**描述**: 获取所有标签列表。

**请求方法**: GET

**请求头**: 
- 无

**请求参数**: 
- 无

**响应状态码**:
- 200: 成功获取
- 500: 数据库错误

**成功响应示例**:
```json
[
  {
    "name": "标签1"
  },
  {
    "name": "标签2"
  }
]
```

### 3.2 获取特定标签下的文章

**端点**: `GET /api/tags/{name}`

**描述**: 获取指定标签下的文章列表。

**请求方法**: GET

**请求头**: 
- 无

**请求参数**:
- `name` (路径参数): 标签名称

**响应状态码**:
- 200: 成功获取
- 404: 标签不存在
- 500: 数据库错误

**成功响应示例**:
```json
[
  {
    "id": 1,
    "create_time": "2024-01-01T00:00:00.000Z",
    "userId": "user123",
    "current_version": 1,
    "Post": {
      "id": 1,
      "create_time": "2024-01-01T00:00:00.000Z",
      "userId": "user123",
      "current_version": 1
    }
  }
]
```

## 4. 应用相关

### 4.1 获取应用列表

**端点**: `GET /api/apps`

**描述**: 获取所有已注册的应用列表。

**请求方法**: GET

**请求头**: 
- 无

**请求参数**: 
- 无

**响应状态码**:
- 200: 成功获取
- 500: 数据库错误

**成功响应示例**:
```json
[
  {
    "id": "app123",
    "name": "应用名称",
    "description": "应用描述",
    "url": "https://example.com",
    "icon": "图标URL",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### 4.2 创建新应用

**端点**: `POST /api/apps`

**描述**: 创建新的应用。

**请求方法**: POST

**请求头**: 
- `Content-Type: application/json`
- `Cookie: auth_token` (管理员认证Cookie)

**请求参数**:
```typescript
{
  name: string;        // 应用名称
  url: string;         // 应用地址
  description?: string; // 应用描述 (可选)
}
```

**响应状态码**:
- 201: 成功创建
- 401: 未授权
- 500: 数据库错误

**成功响应示例**:
```json
{
  "id": "app123",
  "name": "应用名称",
  "description": "应用描述",
  "url": "https://example.com",
  "icon": "图标URL",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 5. 用户相关

### 5.1 获取用户信息

**端点**: `GET /api/user`

**描述**: 获取当前用户信息。

**请求方法**: GET

**请求头**: 
- `Cookie: auth_token` (用户认证Cookie)

**请求参数**: 
- 无

**响应状态码**:
- 200: 成功获取
- 401: 未登录
- 500: 数据库错误

**成功响应示例**:
```json
{
  "id": "user123",
  "name": "用户名",
  "email": "user@example.com",
  "emailVerified": "2024-01-01T00:00:00.000Z",
  "image": "头像URL",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "role": "USER"
}
```

### 5.2 获取特定用户信息

**端点**: `GET /api/user/{userId}`

**描述**: 获取指定ID的用户信息。

**请求方法**: GET

**请求头**: 
- `Cookie: auth_token` (用户认证Cookie)

**请求参数**:
- `userId` (路径参数): 用户ID

**响应状态码**:
- 200: 成功获取
- 401: 未登录
- 500: 数据库错误

**成功响应示例**:
```json
{
  "id": "user123",
  "name": "用户名",
  "email": "user@example.com",
  "emailVerified": "2024-01-01T00:00:00.000Z",
  "image": "头像URL",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "role": "USER"
}
```

## 6. 文件上传

### 6.1 图片上传

**端点**: `POST /api/upload`

**描述**: 上传图片文件到R2存储。

**请求方法**: POST

**请求头**: 
- `Content-Type: multipart/form-data`
- `Cookie: auth_token` (用户认证Cookie)

**请求参数**:
- `file`: 图片文件 (multipart/form-data 格式)

**响应状态码**:
- 200: 成功上传
- 401: 未登录
- 403: 没有权限
- 400: 文件类型错误
- 500: 上传失败

**成功响应示例**:
```json
{
  "status": "ok",
  "url": "https://pic.oveln.icu/blog-images/1234567890-image.png"
}
```

## 7. 备份相关

### 7.1 数据库备份

**端点**: `POST /api/backup`

**描述**: 执行数据库备份操作。

**请求方法**: POST

**请求头**: 
- `Cookie: auth_token` (管理员认证Cookie)

**请求参数**: 
- 无

**响应状态码**:
- 200: 成功备份
- 401: 未授权
- 500: 备份失败

**成功响应示例**:
```json
{
  "status": "ok",
  "message": "备份成功"
}
```