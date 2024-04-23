"use client";
import React, {  } from "react";
import { useRouter } from "next/navigation";
import PostEditor from "@/components/PostEditor";
import { useSession } from "next-auth/react";
import { GetPostVersionType } from "@/app/(auth)/api/post/[id]/[version]/get";

export default function PostEdit({ params }: { params: { id: string; version: string } }) {
    const postVersion: GetPostVersionType = {
        title: "",
        description: "",
        content: "",
        version: 0,
        published: false,
        update_time: new Date(),
        postId: 0
    };

    return <PostEditor postVersion={postVersion}></PostEditor>;
}
