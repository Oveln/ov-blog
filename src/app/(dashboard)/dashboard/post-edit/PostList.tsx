import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { AppRouter } from "@/server/trpc";
import type { inferRouterOutputs } from "@trpc/server";

// 从 tRPC router 推断返回类型
type RouterOutput = inferRouterOutputs<AppRouter>;
type TRPCUserPost = RouterOutput["user"]["getUserPosts"][number];

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
                        "p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors",
                        selectedPost?.id === post.id && "bg-muted"
                    )}
                >
                    <div className="flex flex-col gap-2">
                        <h3 className="font-semibold text-lg truncate">
                            {post.currentVersion?.title ?? post.postVersions[0].title}
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {post.currentVersion?.tags.map((tag: { tagName: string }) => (
                                <span
                                    key={tag.tagName}
                                    className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full"
                                >
                                    {tag.tagName}
                                </span>
                            ))}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">
                                版本: {post.current_version}
                            </span>
                            <span>{format(post.create_time, "yyyy年MM月dd日")}</span>
                        </div>
                    </div>
                </div>
            ))}
            {posts.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                    没有找到匹配的文章
                </div>
            )}
        </div>
    );
}
