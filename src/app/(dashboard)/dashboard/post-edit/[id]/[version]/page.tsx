"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PostEditor from "@/components/PostEditor";
import { GetPostVersionType } from "@/app/(auth)/api/post/[id]/[version]/get";

export default function PostEdit({ params }: { params: { id: string; version: string } }) {
    const [postVersion, setPostVersion] = useState<GetPostVersionType>(null);
    const router = useRouter();

    const loadData = async () => {
        try {
            const res = await fetch(`/api/post/${params.id}/${params.version}`);
            const data = await res.json();
            console.log(data);
            if (!data) {
                router.push("/404");
            }
            setPostVersion(data as GetPostVersionType);
        } catch {
            router.push("/404");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return <PostEditor postVersion={postVersion}></PostEditor>
}
