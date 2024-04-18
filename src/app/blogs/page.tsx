import Link from "next/link";
import React from "react";
import clsx from "clsx";
import { format, parseISO } from "date-fns";
import { getAllPostCardInfo } from "@/data/db";
import { nextAuthOption } from "../api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
export const revalidate = 10;
interface PostCardInfo {
    title: string;
    create_time: Date;
    description: string | null;
}
function PostCard({ dataFade, post }: { dataFade: number; post: PostCardInfo }) {
    return (
        <Link href={"baidu.com"}>
            <div
                className="mb-8 border-2 shadow-md p-2 group relative"
                data-fade={(dataFade + 10) % 9}
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
const Blogs: React.FC = async () => {
    const posts = await getAllPostCardInfo();
    console.log(posts);
    const isLoaded = true;
    const session = await getServerSession(nextAuthOption);
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

            {!session && <p>Not signed in</p>}
        </div>
    );
};

export default Blogs;
