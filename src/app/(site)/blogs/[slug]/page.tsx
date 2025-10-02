import { createServerCaller } from "@/server/trpc/server-caller";
import { notFound } from "next/navigation";
import React from "react";
import Image from "next/image";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkParse from "remark-parse";
import rehypePrettyCode from "rehype-pretty-code";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import remarkGithubAlerts from "remark-github-alerts";
import "katex/dist/katex.min.css";
import "./code.css";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { format } from "date-fns";
import { unified } from "unified";
import CommentsArea from "@/components/ui/giscus";

export const revalidate = 10;

const Post = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const slug = (await params).slug;
    const postId = parseInt(slug);

    // 使用 tRPC 服务器端调用获取数据
    const trpc = await createServerCaller();

    let post;
    try {
        post = await trpc.posts.getPostById({ id: postId });
    } catch {
        return notFound();
    }

    if (!post) {
        return notFound();
    }

    const postVersion = post.currentVersion;
    if (!postVersion) {
        return notFound();
    }

    const tags = postVersion.tags || [];

    // 在服务器端渲染 markdown
    const content = await unified()
        .use(remarkGithubAlerts)
        .use(remarkGfm)
        .use(remarkMath)
        .use(remarkRehype)
        .use(rehypePrettyCode)
        .use(rehypeKatex)
        .use(rehypeStringify)
        .use(remarkParse as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        .process(postVersion.content);

    return (
        <div className="container mx-auto px-4">
            <ResizablePanelGroup
                direction="horizontal"
                className="w-full rounded-lg border min-h-[calc(100vh-56px)]"
            >
                <ResizablePanel defaultSize={75}>
                    <article className="py-6 lg:py-8 min-h-[calc(100vh-56px)] flex flex-col">
                        <header className="mb-8 text-center space-y-4">
                            <h1 className="text-4xl lg:text-5xl font-mono font-bold tracking-tight">
                                {postVersion?.title}
                            </h1>
                            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                <time dateTime={format(post.create_time, "yyyy-MM-dd")}>
                                    Created: {format(post.create_time, "yyyy-MM-dd")}
                                </time>
                                <span>•</span>
                                <time
                                    dateTime={format(
                                        postVersion.update_time,
                                        "yyyy-MM-dd"
                                    )}
                                >
                                    Updated:{" "}
                                    {format(postVersion.update_time, "yyyy-MM-dd")}
                                </time>
                            </div>
                        </header>
                        <main
                            className={`
                                prose dark:prose-invert
                                prose-zinc
                                max-w-4xl
                                mx-auto
                                px-4
                                lg:px-8
                                w-full

                                /* 标题样式 */
                                prose-headings:scroll-mt-20
                                prose-headings:font-bold
                                prose-h1:text-3xl
                                prose-h1:mb-4
                                prose-h2:text-2xl
                                prose-h2:mb-4
                                prose-h3:text-xl
                                prose-h3:mb-3

                                /* 段落和列表样式 */
                                prose-p:my-4
                                prose-p:leading-relaxed
                                prose-li:my-1

                                /* 表格样式 */
                                prose-table:w-full
                                prose-table:border
                                prose-td:p-2
                                prose-td:border
                                prose-th:p-2
                                prose-th:border

                                /* 代码块样式 */
                                prose-pre:bg-gray-100
                                prose-pre:dark:bg-gray-900
                                prose-pre:overflow-x-auto
                                prose-pre:rounded-lg
                                prose-pre:p-4

                                /* 图片样式 */
                                prose-img:rounded-lg
                                prose-img:mx-auto
                                prose-img:shadow-md

                                /* 引用样式 */
                                prose-blockquote:border-l-4
                                prose-blockquote:border-gray-300
                                prose-blockquote:pl-4
                                prose-blockquote:italic

                                /* 链接样式 */
                                prose-a:text-blue-600
                                prose-a:dark:text-blue-400
                                prose-a:no-underline
                                prose-a:hover:underline
                            `}
                            dangerouslySetInnerHTML={{
                                __html: String(content),
                            }}
                        />
                    </article>
                </ResizablePanel>
                <ResizableHandle className="hidden lg:block" />
                <ResizablePanel defaultSize={25} className="hidden lg:block">
                    <div className="sticky top-4 p-4 space-y-6">
                        <Image
                            src="/avatar.jpg"
                            alt={postVersion.title ?? "Oveln"}
                            width={500}
                            height={500}
                            className="rounded-xl shadow-md transition-transform hover:scale-[1.02]"
                        />

                        {/* 标签列表 */}
                        {tags.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-lg font-mono font-semibold flex items-center gap-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                                        <line x1="7" y1="7" x2="7.01" y2="7" />
                                    </svg>
                                    标签
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="
                                                inline-flex items-center
                                                px-3 py-1
                                                text-sm
                                                bg-gray-100 dark:bg-gray-800
                                                text-gray-800 dark:text-gray-200
                                                rounded-full
                                                hover:bg-gray-200 dark:hover:bg-gray-700
                                                transition-colors
                                                cursor-pointer
                                            "
                                        >
                                            {tag.tagName}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 可以添加更多侧边栏内容 */}
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
            <div className="mt-12 mb-8 max-w-4xl mx-auto">
                <CommentsArea
                    repo={process.env.NEXT_PUBLIC_REPO_NAME}
                    repoId={process.env.NEXT_PUBLIC_REPOID}
                    category={process.env.NEXT_PUBLIC_CATEGORY}
                    categoryId={process.env.NEXT_PUBLIC_CATEGORY}
                />
            </div>
        </div>
    );
};

export default Post;
