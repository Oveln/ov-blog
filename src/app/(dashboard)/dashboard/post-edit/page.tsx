"use client";
import React from "react";
import { PostSidebar } from "./PostSidebar";
import { PostContent } from "./PostContent";
import { EmptyState } from "./EmptyState";
import { usePostManagement } from "./usePostManagement";
import "cherry-markdown/dist/cherry-markdown.css";

export default function PostEdit() {
    const {
        selectedPost,
        isLoading,
        searchTerm,
        selectedTag,
        filteredPosts,
        allTags,
        setSearchTerm,
        setSelectedTag,
        handlePostSelect,
        handlePostChange,
    } = usePostManagement();

    return (
        <div className="h-full flex bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-900 dark:to-gray-950">
            {/* 侧边栏：搜索与文章列表 */}
            <PostSidebar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedTag={selectedTag}
                setSelectedTag={setSelectedTag}
                tags={allTags}
                posts={filteredPosts}
                selectedPost={selectedPost}
                onPostSelect={handlePostSelect}
            />

            {/* 内容区：文章详情 */}
            <main className="flex-1 h-full overflow-hidden">
                {selectedPost ? (
                    <div className="h-full px-8 py-6">
                        <PostContent
                            post={selectedPost}
                            isLoading={isLoading}
                            handleChange={handlePostChange}
                        />
                    </div>
                ) : (
                    <EmptyState />
                )}
            </main>
        </div>
    );
}

// 页面需要鉴权
PostEdit.auth = true;
