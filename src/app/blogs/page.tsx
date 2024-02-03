"use client";
import Link from "next/link";
import { compareDesc, format, parseISO } from "date-fns";
import { allPosts, Post } from "contentlayer/generated";
import React from "react";
import useLoaded from "@/hooks/useLoaded";
import clsx from "clsx";
function PostCard({ dataFade, post }: { dataFade: number; post: Post }) {
    return (
        <Link href={post.url}>
            <div
                className="mb-8 border-2 shadow-md p-2 group relative"
                data-fade={(dataFade + 10) % 9}
            >
                <h2 className="mb-1 text-xl">
                    {post.title ? post.title : post._raw.sourceFileName.replace(".md", "")}
                </h2>
                <time dateTime={post.create_time} className="mb-2 block text-xs text-gray-600">
                    {format(parseISO(post.create_time), "LLLL d, yyyy")}
                </time>
                {post.description && (
                    <div className="text-sm [&>*]:mb-3 [&>*:last-child]:mb-0">
                        {post.description}
                    </div>
                )}
                <span className="absolute right-2 bottom-2 animated-underline group-hover:animated-underline-hover">
                    Go to →
                </span>
            </div>
        </Link>
    );
}
const Blogs: React.FC = () => {
    const posts = allPosts.sort((a, b) =>
        compareDesc(new Date(a.create_time), new Date(b.create_time))
    );
    const isLoaded = useLoaded();
    return (
        <div
            className={clsx(
                "mx-auto max-w-3xl py-8 min-h-[calc(100vh-56px)]",
                isLoaded && "fade-in-start"
            )}
        >
            {posts.map((post, idx) => (
                <PostCard key={idx} dataFade={idx} post={post} />
            ))}
        </div>
    );
};

export default Blogs;
