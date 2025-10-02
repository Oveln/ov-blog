"use client";

import { trpc } from "@/lib/trpc";
import React from "react";

export function TestPostsTRPC() {
    const { data, isLoading, error } = trpc.posts.getAll.useQuery();

    if (isLoading) return <div>Loading posts...</div>;
    if (error) return <div>Error loading posts: {error.message}</div>;

    // 确保 data 是数组
    const posts = Array.isArray(data) ? data : [];

    return (
        <div>
            <h2>Posts from tRPC</h2>
            {posts.length > 0 ? (
                posts.map((post) => (
                    <div key={post.id}>
                        <h3>{post.title}</h3>
                        <p>{post.content}</p>
                    </div>
                ))
            ) : (
                <p>No posts found</p>
            )}
        </div>
    );
}
