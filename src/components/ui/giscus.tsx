"use client";
import * as React from "react";
import Giscus from "@giscus/react";

export default function CommentsArea() {
    const repo = process.env.NEXT_PUBLIC_REPO_NAME;
    const repoId = process.env.NEXT_PUBLIC_REPOID;
    const category = process.env.NEXT_PUBLIC_CATEGORY;
    const categoryId = process.env.NEXT_PUBLIC_CATEGORYID;
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
