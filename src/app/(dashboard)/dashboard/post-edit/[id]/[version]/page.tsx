"use client";
import React, { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import PostEditor from "@/components/PostEditor";
import { Loading } from "@/components/ui/loading";
import { trpc } from "@/lib/trpc";

export default function PostEdit({
    params,
}: {
    params: Promise<{ id: string; version: string }>;
}) {
    const [paramsData, setParamsData] = useState<{ id: number; version: number } | null>(
        null
    );
    useEffect(() => {
        params.then((p) => {
            setParamsData({
                id: parseInt(p.id),
                version: parseInt(p.version),
            });
        });
    }, [params]);

    const { data: postVersion, isLoading } = trpc.posts.getVersion.useQuery(
        paramsData ?? { id: 0, version: 0 },
        {
            enabled: !!paramsData,
        }
    );

    if (!paramsData || isLoading) {
        return <Loading />;
    }

    if (!postVersion) {
        notFound();
    }

    return <PostEditor postVersion={postVersion} publish={true}></PostEditor>;
}
PostEdit.auth = true;
