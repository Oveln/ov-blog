"use client";
import React from "react";
import PostEditor from "@/components/PostEditor";
import { GetPostVersionType } from "@/app/(auth)/api/post/[id]/[version]/get";

export default function PostEdit() {
    const postVersion: GetPostVersionType = {
        title: "",
        description: "",
        content: "",
        version: 0,
        update_time: new Date(),
        postId: 0,
        tags: []
    };
    return <PostEditor postVersion={postVersion} publish={true}></PostEditor>;
}
PostEdit.auth = true;
