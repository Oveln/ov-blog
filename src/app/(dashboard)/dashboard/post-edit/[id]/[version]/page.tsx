"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PostEditor from "@/components/PostEditor";
import { GetPostVersionType } from "@/app/(auth)/api/post/[id]/[version]/get";
import { Loading } from "@/components/ui/loading";

export default function PostEdit({
    params,
}: {
    params: Promise<{ id: string; version: string }>;
}) {
    const [postVersion, setPostVersion] = useState<GetPostVersionType>(null);
    // let postVersion: GetPostVersionType | null;
    const router = useRouter();

    const loadData = async () => {
        try {
            const res = await fetch(
                `/api/post/${(await params).id}/${(await params).version}`
            );
            const data = await res.json();
            console.log(data);
            if (!data) {
                router.push("/404");
            }
            setPostVersion(data as GetPostVersionType);
            // postVersion = data as GetPostVersionType;
        } catch {
            router.push("/404");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (!postVersion) {
        return <Loading />;
    } else {
        return <PostEditor postVersion={postVersion} publish={true}></PostEditor>;
    }
}
PostEdit.auth = true;
