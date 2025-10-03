import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Calendar, Hash, FileText } from "lucide-react";
import type { TRPCUserPost } from "./types";

interface PostListProps {
    posts: TRPCUserPost[];
    selectedPost: TRPCUserPost | null;
    onPostSelect: (post: TRPCUserPost) => void;
}

export function PostList({ posts, selectedPost, onPostSelect }: PostListProps) {
    return (
        <div className="overflow-auto flex-1">
            {posts.map((post) => (
                <div
                    key={post.id}
                    onClick={() => onPostSelect(post)}
                    className={cn(
                        "p-4 border-b border-gray-200 dark:border-gray-800 cursor-pointer transition-all duration-200",
                        "hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 hover:border-l-4 hover:border-l-primary",
                        selectedPost?.id === post.id &&
                            "bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-l-primary"
                    )}
                >
                    <div className="flex flex-col gap-3">
                        <h3 className="font-semibold text-base line-clamp-2 text-gray-900 dark:text-gray-100 leading-snug">
                            {post.currentVersion?.title ?? post.postVersions[0].title}
                        </h3>

                        {post.currentVersion?.tags &&
                            post.currentVersion.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {post.currentVersion.tags.map(
                                        (tag: { tagName: string }) => (
                                            <span
                                                key={tag.tagName}
                                                className="inline-flex items-center text-xs px-2 py-1 bg-primary/10 text-primary rounded-md font-medium"
                                            >
                                                <Hash className="h-3 w-3 mr-0.5" />
                                                {tag.tagName}
                                            </span>
                                        )
                                    )}
                                </div>
                            )}

                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md font-medium">
                                <FileText className="h-3 w-3" />v{post.current_version}
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(post.create_time, "yyyy/MM/dd", { locale: zhCN })}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
            {posts.length === 0 && (
                <div className="p-8 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                                没有找到匹配的文章
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                尝试调整搜索条件或标签筛选
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
