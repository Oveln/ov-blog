import { getAllPostCardInfo } from "@/data/db";
import React from "react";
import PostCard from "./PostCard";

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
