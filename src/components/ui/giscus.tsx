'use client'
import Giscus from "@giscus/react";

export default function CommentsArea() {
    return (
        <Giscus
            id="comments"
            repo="Oveln/ov-blog"
            repoId="R_kgDOLIzmXw"
            category="Announcements"
            categoryId="DIC_kwDOLIzmX84CgJLj"
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
