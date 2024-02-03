import { format, parseISO } from "date-fns";
import { allPosts } from "contentlayer/generated";
import React from "react";
import { useMDXComponent } from "next-contentlayer/hooks";
// 引入CSS https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css
import "katex/dist/katex.min.css";
import "./code.css"

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
        <article className="mx-auto max-w-3xl py-8 min-h-[calc(100vh-56px)] flex flex-col">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold">
                    {post.title ? post.title : post._raw.sourceFileName.replace(".md", "")}
                </h1>
                <time dateTime={post.create_time} className="mb-1 text-xs text-gray-600">
                    Created: {format(parseISO(post.create_time), "yyyy-MM-dd")}
                </time>
            </div>
            {/* <div
                className="[&>*]:mb-3 [&>*:last-child]:mb-0 border p-1 flex-1 text-base"
                dangerouslySetInnerHTML={{ __html: post.body.html }}
            /> */}
            <main className="prose lg:prose-xl">
                <MDXCompent />
            </main>

            <time dateTime={post.update_time} className="mb-1 text-xs text-gray-600">
                Updated: {format(parseISO(post.update_time), "yyyy-MM-dd")}
            </time>
        </article>
    );
};

export default PostLayout;
