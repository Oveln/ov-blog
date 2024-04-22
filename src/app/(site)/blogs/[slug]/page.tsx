import { getAllPostCardInfo, getPostById } from "@/data/db";
import { notFound } from "next/navigation";
import React from "react";
import Image from "next/image";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import RehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "./code.css";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

export const revalidate = 30;

export const generateStaticParams = async () =>
    (await getAllPostCardInfo()).map((post) => {
        // eslint-disable-next-line no-unused-labels
        post?.id;
    });

const Post = async ({ params }: { params: { slug: string } }) => {
    const post = await getPostById(parseInt(params.slug));
    const postVersion = post?.postVersions[0];
    if (!postVersion) {
        return notFound();
    }
    return (
        <ResizablePanelGroup
            direction="horizontal"
            className="w-full rounded-lg border min-h-[calc(100vh-56px)]"
        >
            <ResizablePanel defaultSize={75}>
                <article className="mx-auto max-w-3xl py-8 min-h-[calc(100vh-56px)] flex flex-col">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold">{postVersion?.title}</h1>
                        <time
                            dateTime={format(postVersion.create_time, "yyyy-MM-dd")}
                            className="mb-1 text-xs text-gray-600"
                        >
                            Created: {format(postVersion.create_time, "yyyy-MM-dd")}
                        </time>
                    </div>
                    <main className="prose lg:prose-xl prose-table:w-11/12 prose-table:border prose-table:m-auto px-2 prose-td:border-x prose-th:border-x">
                        <Markdown
                            remarkPlugins={[remarkMath, remarkGfm]}
                            rehypePlugins={[RehypeKatex]}
                        >
                            {postVersion.content}
                        </Markdown>
                    </main>
                    <time
                        dateTime={format(postVersion.update_time, "yyyy-MM-dd")}
                        className="mb-1 text-xs text-gray-600"
                    >
                        Updated: {format(postVersion.update_time, "yyyy-MM-dd")}
                    </time>
                </article>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={25}>
                <Image
                    src="/avatar.jpg"
                    alt={postVersion.title ? postVersion.title : "Oveln"}
                    width={500}
                    height={500}
                    className="rounded-xl p-1"
                />
                <Calendar
                    mode="single"
                    selected={postVersion.create_time}
                    // className="rounded-md border shadow"
                ></Calendar>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
};

export default Post;
