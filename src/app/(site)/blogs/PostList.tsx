"use client";

import React, { useState } from "react";
import PostCard from "./PostCard";
import { SearchAndFilter } from "./SearchAndFilter";
import { PostCardInfo } from "./PostCard";

export default function PostList({ posts }: { posts: PostCardInfo[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    // 获取所有不重复的标签
    const getAllTags = () => {
        const tagSet = new Set<string>();
        posts.forEach(post => {
            post.currentVersion?.tags?.forEach(tag => tagSet.add(tag.tagName));
        });
        return Array.from(tagSet);
    };

    // 过滤文章
    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.currentVersion?.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTag = !selectedTag || post.currentVersion?.tags?.some(tag => tag.tagName === selectedTag);
        return matchesSearch && matchesTag;
    });

    return (
        <>
            <SearchAndFilter
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedTag={selectedTag}
                setSelectedTag={setSelectedTag}
                tags={getAllTags()}
            />
            {filteredPosts.map((post, idx) => (
                <PostCard key={idx} dataFade={idx} info={post} />
            ))}
            {filteredPosts.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                    没有找到匹配的文章
                </div>
            )}
        </>
    );
}
