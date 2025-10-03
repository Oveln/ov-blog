import type { AppRouter } from "@/server/trpc";
import type { inferRouterOutputs } from "@trpc/server";

// 路由输出类型
type RouterOutput = inferRouterOutputs<AppRouter>;

// 文章类型
export type TRPCUserPost = RouterOutput["user"]["getUserPosts"][number];

// 统计信息类型
export interface PostStats {
    totalPosts: number;
    filteredCount: number;
    totalTags: number;
    hasFilters: boolean;
}

// Hook 返回值类型
export interface UsePostManagementReturn {
    // 状态
    selectedPost: TRPCUserPost | null;
    isLoading: boolean;
    searchTerm: string;
    selectedTag: string | null;

    // 数据
    posts: TRPCUserPost[];
    filteredPosts: TRPCUserPost[];
    allTags: string[];
    stats: PostStats;

    // 状态更新函数
    setSearchTerm: (term: string) => void;
    setSelectedTag: (tag: string | null) => void;

    // 事件处理器
    handlePostSelect: (post: TRPCUserPost) => void;
    handlePostChange: () => void;
    clearSelection: () => void;
    resetFilters: () => void;
}
