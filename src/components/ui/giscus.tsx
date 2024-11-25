"use client";
import * as React from "react";
import Giscus from "@giscus/react";

export default function CommentsArea({
    repo,
    repoId,
    category,
    categoryId
}: {
    repo: string | undefined;
    repoId: string | undefined;
    category: string | undefined;
    categoryId: string | undefined;
}) {
    if (!repo || !repoId || !category || !categoryId) {
        return <></>;
    }
    return (
        <Giscus
            id="comments"
            repo={repo as `${string}/${string}`}
            repoId={repoId}
            category={category}
            categoryId={categoryId}
            mapping="pathname"
            term="Welcome to Oveln Blog component!"
            reactionsEnabled="1"
            emitMetadata="0"
            inputPosition="top"
            theme="light"
            lang="zh-CN"
            loading="lazy"
            strict="0"
        />
    );
}
