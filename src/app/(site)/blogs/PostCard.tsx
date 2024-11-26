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
                className="mb-8 rounded-lg border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md p-4 group relative animate-fade-up animate-ease-in-out animate-duration-300 transition-all"
                style={{
                    animationDelay: `${dataFade * 100}ms`
                }}
            >
                <h2 className="mb-2 text-xl font-semibold text-gray-800 group-hover:text-gray-900">
                    {info.currentVersion?.title}
                </h2>
                {info.currentVersion?.description != "" && (
                    <div className="text-sm text-gray-600 [&>*]:mb-3 [&>*:last-child]:mb-0">
                        {info.currentVersion?.description}
                    </div>
                )}
                <time
                    dateTime={format(info.create_time, "LLLL d, yyyy")}
                    className="mt-3 block text-xs text-gray-500"
                >
                    {format(info.create_time, "LLLL d, yyyy")}
                </time>
                <span className="absolute right-4 bottom-4 text-sm text-gray-600 group-hover:text-gray-800 font-medium animated-underline group-hover:animated-underline-hover">
                    Go to →
                </span>
            </div>
        </Link>
    );
}
