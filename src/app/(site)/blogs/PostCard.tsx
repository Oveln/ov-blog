import { PostCardInfo } from "@/lib/db";
import { format } from "date-fns";
import Link from "next/link";
import React from "react";

export default function PostCard({
    dataFade,
    postVersion
}: {
    dataFade: number;
    postVersion: PostCardInfo;
}) {
    return (
        <Link href={`/blogs/${postVersion.Post.id}`}>
            <div
                className="mb-8 border-2 shadow-md p-2 group relative animate-fade-up animate-ease-in-out animate-duration-300"
                style={{
                    animationDelay: `${dataFade * 100}ms`
                }}
            >
                <h2 className="mb-1 text-xl">{postVersion.title}</h2>
                <time
                    dateTime={format(postVersion.Post.create_time, "LLLL d, yyyy")}
                    className="mb-2 block text-xs text-gray-600"
                >
                    {format(postVersion.Post.create_time, "LLLL d, yyyy")}
                </time>
                {postVersion.description != "" && (
                    <div className="text-sm [&>*]:mb-3 [&>*:last-child]:mb-0">
                        {postVersion.description}
                    </div>
                )}
                <span className="absolute right-2 bottom-2 animated-underline group-hover:animated-underline-hover">
                    Go to →
                </span>
            </div>
        </Link>
    );
}
