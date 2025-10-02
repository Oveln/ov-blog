"use client";
import React from "react";
import PostEditor from "@/components/PostEditor";
import type { AppRouter } from "@/server/trpc";
import type { inferRouterOutputs } from "@trpc/server";

// 从 tRPC router 推断返回类型
type RouterOutput = inferRouterOutputs<AppRouter>;
type GetPostVersionType = RouterOutput["posts"]["getVersion"];

export default function PostEdit() {
    // 创建一个符合 tRPC 类型的空白文章版本
    const postVersion: GetPostVersionType = {
        title: "",
        description: "",
        content: "",
        version: 0,
        update_time: new Date(),
        postId: 0,
        tags: [], // tRPC 返回的是 { tagName: string }[] 类型
        Post: {
            create_time: new Date(),
        },
    };
    return <PostEditor postVersion={postVersion} publish={true}></PostEditor>;
}
PostEdit.auth = true;
