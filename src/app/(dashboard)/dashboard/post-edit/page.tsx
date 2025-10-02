"use client";
import React, { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { SearchAndFilter } from "./SearchAndFilter";
import { PostList } from "./PostList";
import { PostContent } from "./PostContent";
import "cherry-markdown/dist/cherry-markdown.css";
import { trpc } from "@/lib/trpc";
import type { AppRouter } from "@/server/trpc";
import type { inferRouterOutputs } from "@trpc/server";

// 从 tRPC router 推断返回类型
type RouterOutput = inferRouterOutputs<AppRouter>;
type TRPCUserPost = RouterOutput["user"]["getUserPosts"][number];

export default function PostEdit() {
    const [selectedPost, setSelectedPost] = useState<TRPCUserPost | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);

    const session = useSession({
        required: true,
    });

    const { data = [], refetch } = trpc.user.getUserPosts.useQuery(
        { userId: session.data?.user?.id ?? "" },
        {
            enabled: session.status === "authenticated" && !!session.data?.user?.id,
            // 当窗口重新获得焦点时自动刷新数据
            refetchOnWindowFocus: true,
            // 可选：设置数据过期时间（毫秒）
            staleTime: 0, // 数据立即过期，确保总是获取最新数据
        }
    );

    const handleChange = async (
        postId: number,
        _version: number,
        action: "delete" | "check_out"
    ) => {
        // 使用 refetch 重新获取数据
        const result = await refetch();

        if (result.data && selectedPost) {
            // 在新数据中找到当前选中的文章
            const updatedPost = result.data.find((p) => p.id === postId);

            if (action === "delete" && updatedPost) {
                // 如果是删除操作，检查文章是否还有版本
                if (updatedPost.postVersions.length === 0) {
                    // 文章已被完全删除，清除选中
                    setSelectedPost(null);
                } else {
                    // 文章还有其他版本，更新选中的文章数据
                    setSelectedPost(updatedPost);
                }
            } else if (action === "check_out" && updatedPost) {
                // 切换版本后更新文章数据
                setSelectedPost(updatedPost);
            } else if (!updatedPost) {
                // 文章不存在了，清除选中
                setSelectedPost(null);
            }
        }
    };

    const handlePostSelect = async (post: TRPCUserPost) => {
        if (loadingTimerRef.current) {
            clearTimeout(loadingTimerRef.current);
        }

        setSelectedPost(post);

        const loadingTimer = setTimeout(() => {
            setIsLoading(true);
        }, 150);
        loadingTimerRef.current = loadingTimer;

        try {
            if (loadingTimerRef.current) {
                clearTimeout(loadingTimerRef.current);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getAllTags = () => {
        const tagSet = new Set<string>();
        data.forEach((post) => {
            post.currentVersion?.tags?.forEach((tag: { tagName: string }) =>
                tagSet.add(tag.tagName)
            );
        });
        return Array.from(tagSet);
    };

    const filteredPosts = data.filter((post) => {
        const matchesSearch = post.currentVersion?.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesTag =
            !selectedTag ||
            post.currentVersion?.tags?.some((tag) => tag.tagName === selectedTag);
        return matchesSearch && matchesTag;
    });

    return (
        <div className="h-full flex">
            <div className="w-[400px] border-r h-full flex flex-col">
                <SearchAndFilter
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedTag={selectedTag}
                    setSelectedTag={setSelectedTag}
                    tags={getAllTags()}
                />
                <PostList
                    posts={filteredPosts}
                    selectedPost={selectedPost}
                    onPostSelect={handlePostSelect}
                />
            </div>
            {selectedPost && (
                <div className="flex-1 h-full px-8 shadow-md">
                    <PostContent
                        post={selectedPost}
                        isLoading={isLoading}
                        handleChange={handleChange}
                    />
                </div>
            )}
        </div>
    );
}

PostEdit.auth = true;
