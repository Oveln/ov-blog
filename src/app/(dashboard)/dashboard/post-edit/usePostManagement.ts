import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import type { TRPCUserPost } from "./types";

// 加载延迟配置
const LOADING_DELAY = {
    START: 150,
    END: 300,
} as const;

export function usePostManagement() {
    // 状态管理
    const [selectedPost, setSelectedPost] = useState<TRPCUserPost | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    // 定时器引用
    const loadingStartTimerRef = useRef<NodeJS.Timeout | null>(null);
    const loadingEndTimerRef = useRef<NodeJS.Timeout | null>(null);

    // 用户会话
    const session = useSession({ required: true });

    // 获取用户文章列表
    const {
        data: posts = [],
        refetch,
        isLoading: isPostsLoading,
    } = trpc.user.getUserPosts.useQuery(
        { userId: session.data?.user?.id ?? "" },
        {
            enabled: session.status === "authenticated" && !!session.data?.user?.id,
            refetchOnWindowFocus: true,
            staleTime: 0,
        }
    );

    // 清理所有定时器
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

    // 组件卸载时清理定时器
    useEffect(() => {
        return () => clearAllTimers();
    }, [clearAllTimers]);

    // 更新选中的文章（如果当前选中的文章被更新）
    const updateSelectedPost = useCallback(
        (updatedPosts: TRPCUserPost[]) => {
            if (!selectedPost) return;

            const updatedPost = updatedPosts.find((p) => p.id === selectedPost.id);

            // 如果文章被删除或没有版本，清空选择
            if (!updatedPost || updatedPost.postVersions.length === 0) {
                setSelectedPost(null);
            } else {
                // 更新文章数据
                setSelectedPost(updatedPost);
            }
        },
        [selectedPost]
    );

    // 文章操作后刷新（删除/切换版本）
    const handlePostChange = useCallback(async () => {
        try {
            const result = await refetch();

            if (result.data) {
                updateSelectedPost(result.data);
            } else {
                console.warn("Failed to refetch posts");
            }
        } catch (error) {
            console.error("Failed to refresh posts:", error);
        }
    }, [refetch, updateSelectedPost]);

    // 选中文章（带加载动画）
    const handlePostSelect = useCallback(
        (post: TRPCUserPost) => {
            // 如果选择的是同一篇文章，不做任何操作
            if (selectedPost?.id === post.id) return;

            // 清理之前的定时器
            clearAllTimers();

            // 立即更新选中的文章
            setSelectedPost(post);

            // 延迟显示加载动画（避免快速切换时闪烁）
            loadingStartTimerRef.current = setTimeout(() => {
                setIsLoading(true);
            }, LOADING_DELAY.START);

            // 结束加载动画
            loadingEndTimerRef.current = setTimeout(() => {
                setIsLoading(false);
                clearAllTimers();
            }, LOADING_DELAY.END);
        },
        [selectedPost?.id, clearAllTimers]
    );

    // 清空选择
    const clearSelection = useCallback(() => {
        clearAllTimers();
        setSelectedPost(null);
        setIsLoading(false);
    }, [clearAllTimers]);

    // 重置筛选条件
    const resetFilters = useCallback(() => {
        setSearchTerm("");
        setSelectedTag(null);
    }, []);

    // 获取所有标签（去重并排序）
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();

        posts.forEach((post) => {
            post.currentVersion?.tags?.forEach((tag: { tagName: string }) => {
                tagSet.add(tag.tagName);
            });
        });

        // 转换为数组并排序
        return Array.from(tagSet).sort((a, b) => a.localeCompare(b, "zh-CN"));
    }, [posts]);

    // 过滤后的文章列表
    const filteredPosts = useMemo(() => {
        if (!posts.length) return [];

        return posts.filter((post) => {
            // 搜索过滤
            if (searchTerm) {
                const title = post.currentVersion?.title?.toLowerCase() ?? "";
                const matchesSearch = title.includes(searchTerm.toLowerCase());
                if (!matchesSearch) return false;
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

    // 统计信息
    const stats = useMemo(
        () => ({
            totalPosts: posts.length,
            filteredCount: filteredPosts.length,
            totalTags: allTags.length,
            hasFilters: !!searchTerm || !!selectedTag,
        }),
        [posts.length, filteredPosts.length, allTags.length, searchTerm, selectedTag]
    );

    return {
        // 状态
        selectedPost,
        isLoading: isLoading || isPostsLoading,
        searchTerm,
        selectedTag,

        // 数据
        posts,
        filteredPosts,
        allTags,
        stats,

        // 状态更新函数
        setSearchTerm,
        setSelectedTag,

        // 事件处理器
        handlePostSelect,
        handlePostChange,
        clearSelection,
        resetFilters,
    };
}
