import { getAllPostCardInfo, getPostById } from "@/lib/db";
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
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { format } from "date-fns";
// import { Calendar } from "@/components/ui/calendar";
import { unified } from "unified";
import CommentsArea from "@/components/ui/giscus";

export const revalidate = 10;

export const generateStaticParams = async () =>
    (await getAllPostCardInfo()).map((info) => ({
        slug: info.id.toString(10)
    }));

const Post = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const post = await getPostById(parseInt((await params).slug));
    const postVersion = post?.currentVersion;
    if (!postVersion) {
        return notFound();
    }
    const content = await unified()
        .use(remarkGithubAlerts)
        .use(remarkGfm)
        .use(remarkMath)
        .use(remarkRehype)
        .use(rehypePrettyCode)
        .use(rehypeKatex)
        .use(rehypeStringify)
        // 类型不兼容
        .use(remarkParse as any) // eslint-disable-line @typescript-eslint/no-explicit-any

        .process(postVersion.content);
    return (
        <div>
            <ResizablePanelGroup
                direction="horizontal"
                className="w-full rounded-lg border min-h-[calc(100vh-56px)]"
                style={{
                    height: "auto"
                }}
            >
                <ResizablePanel defaultSize={75}>
                    <article className="py-8 min-h-[calc(100vh-56px)] flex flex-col">
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-bold">{postVersion?.title}</h1>
                            <time
                                dateTime={format(post.create_time, "yyyy-MM-dd")}
                                className="mb-1 text-xs text-gray-600"
                            >
                                Created: {format(post.create_time, "yyyy-MM-dd")}
                            </time>
                        </div>
                        <main
                            className={
                                `prose prose-zinc max-w-full mx-8 lg:prose-lg prose-table:w-11/12 prose-table:border prose-table:m-auto px-2 prose-td:border-x prose-th:border-x prose-li:my-0 ` +
                                `prose-h1:mb-0 prose-h1:mt-4 prose-h1:pb-4 prose-h1:border-b ` +
                                `prose-h2:mb-0 prose-h2:mt-4 prose-h2:pb-4 ` +
                                `prose-h3:mb-0 prose-h3:mt-4 prose-h3:pb-4 ` +
                                `prose-h4:mb-0 prose-h4:mt-4 prose-h4:pb-4 ` +
                                `prose-p:my-2` +
                                // 横向可滚动
                                `prose-figure:overflow-x-auto`
                            }
                            dangerouslySetInnerHTML={{
                                __html: String(content)
                            }}
                        />
                        <time
                            dateTime={format(postVersion.update_time, "yyyy-MM-dd")}
                            className="ml-2 mt-4 mb-1 text-xs text-gray-600"
                        >
                            Updated: {format(postVersion.update_time, "yyyy-MM-dd")}
                        </time>
                    </article>
                </ResizablePanel>
                <ResizableHandle className="hidden lg:block" />
                <ResizablePanel defaultSize={23} className="hidden lg:block">
                    <Image
                        src="/avatar.jpg"
                        alt={postVersion.title ? postVersion.title : "Oveln"}
                        width={500}
                        height={500}
                        className="rounded-xl p-1"
                    />
                    {/* <Calendar mode="single" selected={post.create_time}>
					</Calendar> */}
                </ResizablePanel>
            </ResizablePanelGroup>
            <div className="mt-4">
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
