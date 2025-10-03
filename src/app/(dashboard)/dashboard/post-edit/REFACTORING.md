# usePostManagement Hook 重构说明

## 📋 重构概览

对 `usePostManagement` Hook 进行了全面的逻辑优化和代码重构，提升了代码质量、可维护性和性能。

---

## ✨ 主要改进

### 1. **类型系统优化**

- ✅ 创建独立的 `types.ts` 文件统一管理类型定义
- ✅ 所有组件现在导入共享类型，避免重复定义
- ✅ 添加了 `PostStats` 接口用于统计信息
- ✅ 定义了清晰的 `UsePostManagementReturn` 返回类型

### 2. **定时器管理改进**

**之前的问题：**

```typescript
const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
// 只管理一个定时器，可能导致内存泄漏
```

**优化后：**

```typescript
const loadingStartTimerRef = useRef<NodeJS.Timeout | null>(null);
const loadingEndTimerRef = useRef<NodeJS.Timeout | null>(null);

// 统一清理函数
const clearAllTimers = useCallback(() => {
    if (loadingStartTimerRef.current) {
        clearTimeout(loadingStartTimerRef.current);
        loadingStartTimerRef.current = null;
    }
    if (loadingEndTimerRef.current) {
        clearTimeout(loadingEndTimerRef.current);
        loadingEndTimerRef.current = null;
    }
}, []);

// 组件卸载时自动清理
useEffect(() => {
    return () => clearAllTimers();
}, [clearAllTimers]);
```

### 3. **逻辑分离与职责单一**

#### 之前的 `handlePostChange`：

```typescript
const handlePostChange = useCallback(
    async (postId: number, _version: number, action: "delete" | "check_out") => {
        const result = await refetch();
        if (result.data && selectedPost) {
            const updatedPost = result.data.find((p) => p.id === postId);
            if (action === "delete") {
                if (!updatedPost || updatedPost.postVersions.length === 0) {
                    setSelectedPost(null);
                } else {
                    setSelectedPost(updatedPost);
                }
            } else if (action === "check_out" && updatedPost) {
                setSelectedPost(updatedPost);
            } else if (!updatedPost) {
                setSelectedPost(null);
            }
        }
    },
    [refetch, selectedPost]
);
```

#### 优化后：

```typescript
// 提取更新逻辑
const updateSelectedPost = useCallback(
    (updatedPosts: TRPCUserPost[]) => {
        if (!selectedPost) return;

        const updatedPost = updatedPosts.find((p) => p.id === selectedPost.id);

        if (!updatedPost || updatedPost.postVersions.length === 0) {
            setSelectedPost(null);
        } else {
            setSelectedPost(updatedPost);
        }
    },
    [selectedPost]
);

// 简化的处理函数
const handlePostChange = useCallback(
    async (postId: number, version: number, action: PostAction) => {
        try {
            const result = await refetch();
            if (!result.data) {
                console.warn("Failed to refetch posts");
                return;
            }
            updateSelectedPost(result.data);
        } catch (error) {
            console.error(`Failed to handle ${action} action:`, error);
        }
    },
    [refetch, updateSelectedPost]
);
```

### 4. **性能优化**

#### 防止重复选择

```typescript
const handlePostSelect = useCallback(
    (post: TRPCUserPost) => {
        // 新增：避免选择同一篇文章时的不必要操作
        if (selectedPost?.id === post.id) return;

        clearAllTimers();
        setSelectedPost(post);
        // ... 其余逻辑
    },
    [selectedPost?.id, clearAllTimers]
);
```

#### 优化过滤逻辑

```typescript
const filteredPosts = useMemo(() => {
    if (!posts.length) return []; // 提前返回

    return posts.filter((post) => {
        // 搜索过滤
        if (searchTerm) {
            const title = post.currentVersion?.title?.toLowerCase() ?? "";
            if (!title.includes(searchTerm.toLowerCase())) return false;
        }

        // 标签过滤
        if (selectedTag) {
            const hasTag = post.currentVersion?.tags?.some(
                (tag) => tag.tagName === selectedTag
            );
            if (!hasTag) return false;
        }

        return true;
    });
}, [posts, searchTerm, selectedTag]);
```

#### 标签排序

```typescript
const allTags = useMemo(() => {
    const tagSet = new Set<string>();

    posts.forEach((post) => {
        post.currentVersion?.tags?.forEach((tag: { tagName: string }) => {
            tagSet.add(tag.tagName);
        });
    });

    // 新增：按中文拼音排序
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b, "zh-CN"));
}, [posts]);
```

### 5. **新增实用功能**

#### 统计信息

```typescript
const stats = useMemo(
    () => ({
        totalPosts: posts.length,
        filteredCount: filteredPosts.length,
        totalTags: allTags.length,
        hasFilters: !!searchTerm || !!selectedTag,
    }),
    [posts.length, filteredPosts.length, allTags.length, searchTerm, selectedTag]
);
```

#### 清空选择

```typescript
const clearSelection = useCallback(() => {
    clearAllTimers();
    setSelectedPost(null);
    setIsLoading(false);
}, [clearAllTimers]);
```

#### 重置筛选

```typescript
const resetFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedTag(null);
}, []);
```

### 6. **配置常量化**

```typescript
const LOADING_DELAY = {
    START: 150,
    END: 300,
} as const;
```

### 7. **错误处理增强**

```typescript
try {
    const result = await refetch();
    if (!result.data) {
        console.warn("Failed to refetch posts");
        return;
    }
    updateSelectedPost(result.data);
} catch (error) {
    console.error(`Failed to handle ${action} action:`, error);
}
```

### 8. **加载状态整合**

```typescript
// 整合文章列表加载状态和本地加载状态
isLoading: isLoading || isPostsLoading,
```

---

## 📊 改进对比

| 方面       | 改进前       | 改进后                   |
| ---------- | ------------ | ------------------------ |
| 代码行数   | ~110 行      | ~180 行（但逻辑更清晰）  |
| 类型定义   | 重复定义     | 统一管理                 |
| 定时器管理 | 可能内存泄漏 | 自动清理                 |
| 错误处理   | 无           | 完善的 try-catch         |
| 功能函数   | 2 个         | 6 个（更多实用功能）     |
| 依赖优化   | 过度依赖     | 精确依赖                 |
| 性能       | 一般         | 优化（防重复、提前返回） |

---

## 🎯 使用示例

```typescript
import { usePostManagement } from "./usePostManagement";

function PostEdit() {
    const {
        // 状态
        selectedPost,
        isLoading,
        searchTerm,
        selectedTag,

        // 数据
        posts,
        filteredPosts,
        allTags,
        stats, // 新增：统计信息

        // 操作
        setSearchTerm,
        setSelectedTag,
        handlePostSelect,
        handlePostChange,
        clearSelection,  // 新增
        resetFilters,    // 新增
    } = usePostManagement();

    // 使用统计信息
    console.log(`总共 ${stats.totalPosts} 篇文章，过滤后 ${stats.filteredCount} 篇`);

    return (
        // ... JSX
    );
}
```

---

## 🔧 维护建议

1. **添加单元测试**：为 Hook 编写测试用例
2. **性能监控**：使用 React DevTools Profiler 监控性能
3. **文档更新**：保持文档与代码同步
4. **代码审查**：定期审查是否有优化空间

---

## 📝 总结

这次重构显著提升了代码质量：

- ✅ 更好的类型安全
- ✅ 更清晰的逻辑分离
- ✅ 更完善的错误处理
- ✅ 更优秀的性能
- ✅ 更易于维护和扩展
