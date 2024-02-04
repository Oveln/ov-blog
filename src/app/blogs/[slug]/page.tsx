import { format, parseISO } from "date-fns";
import { allPosts } from "contentlayer/generated";
import React from "react";
import { useMDXComponent } from "next-contentlayer/hooks";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
// 引入CSS https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css
import "katex/dist/katex.min.css";
import "./code.css";
import { Calendar } from "@/components/ui/calendar";
import Image from "next/image";

export const generateStaticParams = async () =>
    allPosts.map((post) => ({ slug: post.id.toString() }));

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
    const id = parseInt(params.slug);
    const post = allPosts.find((post) => post.id === id);
    if (!post) throw new Error(`Post not found for slug: ${params.slug}`);
    return { title: post.title };
};

const PostLayout = ({ params }: { params: { slug: string } }) => {
    const id = parseInt(params.slug);
    const post = allPosts.find((post) => post.id === id);
    if (!post) throw new Error(`Post not found for slug: ${params.slug}`);
    // if (!post) post=allPosts[0];
    const MDXCompent = useMDXComponent(post.body.code);

    return (
        <ResizablePanelGroup
            direction="horizontal"
            className="w-full rounded-lg border min-h-[calc(100vh-56px)]"
        >
            <ResizablePanel defaultSize={75}>
                <article className="mx-auto max-w-3xl py-8 min-h-[calc(100vh-56px)] flex flex-col">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold">
                            {post.computedTitle}
                        </h1>
                        <time dateTime={post.create_time} className="mb-1 text-xs text-gray-600">
                            Created: {format(parseISO(post.create_time), "yyyy-MM-dd")}
                        </time>
                    </div>
                    <main className="prose lg:prose-xl prose-table:w-11/12 prose-table:border prose-table:m-auto px-2 prose-td:border-x prose-th:border-x">
                        <MDXCompent />
                    </main>
                    <time dateTime={post.update_time} className="mb-1 text-xs text-gray-600">
                        Updated: {format(parseISO(post.update_time), "yyyy-MM-dd")}
                    </time>
                </article>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={25}>
                <Image src="/avatar.jpg" alt={post.title ? post.title : "Oveln"} width={500} height={500} className="rounded-xl p-1"/>
                <Calendar
                    mode="single"
                    selected={parseISO(post.create_time)}
                    // className="rounded-md border shadow"
                ></Calendar>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
};

export default PostLayout;
