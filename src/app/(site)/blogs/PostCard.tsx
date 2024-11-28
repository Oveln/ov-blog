import { format } from "date-fns";
import Link from "next/link";
import React from "react";
import { Badge } from "@/components/ui/badge";

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
        tags: { tagName: string }[];
    } | null;
};

export default function PostCard({ dataFade, info }: { dataFade: number; info: PostCardInfo }) {
    return (
        <Link href={`/blogs/${info.id}`}>
            <div
                className="mb-8 rounded-lg border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md p-4 group relative animate-fade-up animate-ease-in-out transition-all"
                style={{
                    animationDelay: `${dataFade * 100}ms`
                }}
            >
                <div className="relative mb-2">
                    <h2 className="text-xl font-semibold text-gray-800 group-hover:text-gray-900 pr-32">
                        {info.currentVersion?.title}
                    </h2>
                    <time
                        dateTime={format(info.create_time, "LLLL d, yyyy")}
                        className="absolute right-0 top-0 text-xs text-gray-500"
                    >
                        {format(info.create_time, "LLLL d, yyyy")}
                    </time>
                </div>

                {info.currentVersion?.description != "" && (
                    <div className="text-sm text-gray-600 mb-4 [&>*]:mb-3 [&>*:last-child]:mb-0">
                        {info.currentVersion?.description}
                    </div>
                )}

                <div className="flex justify-between items-center mt-3">
                    <div className="flex flex-wrap gap-2">
                        {info.currentVersion?.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                                {tag.tagName}
                            </Badge>
                        ))}
                    </div>
                    <span className="text-sm text-gray-600 group-hover:text-gray-800 font-medium animated-underline group-hover:animated-underline-hover">
                        Go to →
                    </span>
                </div>
            </div>
        </Link>
    );
}
