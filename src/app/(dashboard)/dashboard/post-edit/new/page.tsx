"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GetPostVersionType } from "@/app/(auth)/api/post/[id]/[version]/route";
import PostEditor from "@/components/PostEditor";
import { useSession } from "next-auth/react";

export default function PostEdit({ params }: { params: { id: string; version: string } }) {
    const [postVersion, setPostVersion] = useState<GetPostVersionType>({
        title: "",
        description: "",
        content: "",
        version: 0,
        published: false,
        update_time: new Date(),
        postId: 0
    });
    const router = useRouter();
    const session = useSession();

    return <PostEditor postVersion={postVersion}></PostEditor>;
}
