# tRPC API 客户端迁移指南

## 背景

我们简化了 tRPC API 的响应格式，遵循"没有错误即成功"的设计原则。

## 变更内容

### Mutation 操作响应变化

#### ❌ 旧的响应格式

```typescript
// 创建、更新、删除操作都返回
{
    status: "ok";
}
```

#### ✅ 新的响应格式

```typescript
// 大多数 mutation 操作不返回任何值（void）
// 仅在需要时返回数据
```

---

## 迁移步骤

### 1. 文章相关 API (`posts`)

#### `posts.create` - **部分变更**

```typescript
// ❌ 旧代码
const result = await trpc.posts.create.mutate({ ... });
console.log(result.status); // 'ok'
console.log(result.post_id); // number

// ✅ 新代码
const result = await trpc.posts.create.mutate({ ... });
console.log(result.post_id); // number
// 不再有 status 字段
```

#### `posts.createVersion` - **变更**

```typescript
// ❌ 旧代码
const result = await trpc.posts.createVersion.mutate({ ... });
if (result.status === 'ok') {
  // 成功处理
}

// ✅ 新代码
await trpc.posts.createVersion.mutate({ ... });
// 没有错误就是成功，无需检查返回值
```

#### `posts.deleteVersion` - **变更**

```typescript
// ❌ 旧代码
const result = await trpc.posts.deleteVersion.mutate({ ... });
if (result.status === 'ok') {
  // 成功处理
}

// ✅ 新代码
await trpc.posts.deleteVersion.mutate({ ... });
// 没有错误就是成功
```

#### `posts.checkoutVersion` - **变更**

```typescript
// ❌ 旧代码
const result = await trpc.posts.checkoutVersion.mutate({ ... });
if (result.status === 'ok') {
  // 成功处理
}

// ✅ 新代码
await trpc.posts.checkoutVersion.mutate({ ... });
// 没有错误就是成功
```

---

### 2. 标签相关 API (`tags`)

#### `tags.create` - **变更**

```typescript
// ❌ 旧代码
const result = await trpc.tags.create.mutate({ name: "TypeScript" });
if (result.status === "ok") {
    // 成功处理
}

// ✅ 新代码
await trpc.tags.create.mutate({ name: "TypeScript" });
// 没有错误就是成功
```

#### `tags.delete` - **变更**

```typescript
// ❌ 旧代码
const result = await trpc.tags.delete.mutate({ name: "TypeScript" });

// ✅ 新代码
await trpc.tags.delete.mutate({ name: "TypeScript" });
```

#### `tags.update` - **变更**

```typescript
// ❌ 旧代码
const result = await trpc.tags.update.mutate({
    name: "TypeScript",
    newName: "TS",
});

// ✅ 新代码
await trpc.tags.update.mutate({
    name: "TypeScript",
    newName: "TS",
});
```

---

### 3. 应用相关 API (`apps`)

#### `apps.create` - **无变更**

```typescript
// ✅ 仍然返回完整的 app 对象
const app = await trpc.apps.create.mutate({
    name: "My App",
    url: "https://example.com",
    description: "Description",
});
console.log(app.id, app.name); // 可以直接使用
```

#### `apps.delete` - **变更**

```typescript
// ❌ 旧代码
const result = await trpc.apps.delete.mutate({ id: "123" });
if (result.status === "ok") {
    // 成功处理
}

// ✅ 新代码
await trpc.apps.delete.mutate({ id: "123" });
// 没有错误就是成功
```

---

## 错误处理

### ✅ 推荐的错误处理模式

```typescript
try {
  // 执行操作
  await trpc.posts.createVersion.mutate({ ... });

  // 成功处理
  toast.success('操作成功');
  router.push('/posts');

} catch (error) {
  // 错误处理
  if (error instanceof TRPCClientError) {
    toast.error(error.message);
  } else {
    toast.error('未知错误');
  }
}
```

### 配合 React Query 使用

```typescript
const mutation = trpc.posts.createVersion.useMutation({
  onSuccess: () => {
    // 成功回调 - 没有返回数据
    toast.success('版本创建成功');
    queryClient.invalidateQueries(['posts']);
  },
  onError: (error) => {
    // 错误回调
    toast.error(error.message);
  }
});

// 调用
mutation.mutate({ ... });
```

---

## 快速检查清单

- [ ] 移除所有对 `result.status === 'ok'` 的检查
- [ ] 确认不再使用返回的 `status` 字段
- [ ] `posts.create` 仍然可以访问 `result.post_id`
- [ ] `apps.create` 仍然返回完整的 app 对象
- [ ] 更新错误处理逻辑（使用 try-catch 或 onError 回调）
- [ ] 测试所有受影响的功能

---

## 收益

✅ **更简洁的代码** - 减少不必要的条件检查  
✅ **更少的数据传输** - 减少网络负载  
✅ **更符合 REST 语义** - 成功操作返回 204 No Content 或相关数据  
✅ **更好的类型推导** - TypeScript 可以更准确地推导返回类型

---

## 需要帮助？

如有任何问题，请参考：

- API 文档：`TRPC_OPTIMIZATION_SUMMARY.md`
- tRPC 官方文档：https://trpc.io/docs
