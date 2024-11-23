import { format } from "date-fns";
import Link from "next/link";
import React from "react";

export type PostCardInfo = {
    User: {
        name: string | null;
    };
    id: number;
    create_time: Date;
    currentVersion: {
        title: string;
        description: string | null;
        update_time: Date;
    } | null;
};
export default function PostCard({ dataFade, info }: { dataFade: number; info: PostCardInfo }) {
    return (
        <Link href={`/blogs/${info.id}`}>
            <div
                className="mb-8 border-2 shadow-md p-2 group relative animate-fade-up animate-ease-in-out animate-duration-300"
                style={{
                    animationDelay: `${dataFade * 100}ms`
                }}
            >
                <h2 className="mb-1 text-xl">{info.currentVersion?.title}</h2>
                <time
                    dateTime={format(info.create_time, "LLLL d, yyyy")}
                    className="mb-2 block text-xs text-gray-600"
                >
                    {format(info.create_time, "LLLL d, yyyy")}
                </time>
                {info.currentVersion?.description != "" && (
                    <div className="text-sm [&>*]:mb-3 [&>*:last-child]:mb-0">
                        {info.currentVersion?.description}
                    </div>
                )}
                <span className="absolute right-2 bottom-2 animated-underline group-hover:animated-underline-hover">
                    Go to →
                </span>
            </div>
        </Link>
    );
}
