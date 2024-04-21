import { getAllPostCardInfo } from "@/data/db";
import React, { cache } from "react";
import PostCard, { PostCardInfo } from "./PostCard";

export default async function PostList() {
    const posts = await getAllPostCardInfo();
    return (
        <>
            {posts.map((post, idx) => (
                <PostCard key={idx} dataFade={idx} post={post} />
            ))}
        </>
    );
}
