import { format } from "date-fns";
import Link from "next/link";
import React from "react";

export type PostCardInfo = {
    id: number;
    title: string;
    description: string | null;
    create_time: Date;
    update_time: Date;
    published: boolean;
    Post: {
        id: number;
        User: {
            name: string;
        };
    };
};
export default function PostCard({ dataFade, post }: { dataFade: number; post: PostCardInfo }) {
    return (
        <Link href={`/blogs/${post.Post.id}`}>
            <div
                className="mb-8 border-2 shadow-md p-2 group relative animate-fade-up animate-ease-in-out animate-duration-300"
                style={{
                    animationDelay: `${dataFade * 100}ms`
                }}
            >
                <h2 className="mb-1 text-xl">{post.title}</h2>
                <time
                    dateTime={format(post.create_time, "LLLL d, yyyy")}
                    className="mb-2 block text-xs text-gray-600"
                >
                    {format(post.create_time, "LLLL d, yyyy")}
                </time>
                {post.description != "" && (
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
