import { PostActionButtons } from "./PostActionButton";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Cherry from "cherry-markdown";
import { trpc } from "@/lib/trpc";
import type { TRPCUserPost } from "./types";

interface PostContentProps {
    post: TRPCUserPost;
    isLoading: boolean;
    handleChange: () => void;
}

export function PostContent({ post, isLoading, handleChange }: PostContentProps) {
    const cherryRef = useRef<HTMLDivElement | null>(null);
    const [cherryInstance, setCherryInstance] = useState<Cherry | null>(null);
    const [content, setContent] = useState<string>("");

    // 监听 post 和 isLoading 变化来管理 Cherry 实例
    useEffect(() => {
        const initCherry = async () => {
            // 只有在有 post 且不在加载状态时才创建实例
            if (post && !isLoading && cherryRef.current) {
                console.log("initCherry");
                const Cherry = await import("cherry-markdown/dist/cherry-markdown");
                const instance = new Cherry.default({
                    el: cherryRef.current,
                    value: "",
                    editor: {
                        defaultModel: "previewOnly",
                    },
                });
                setCherryInstance(instance);
            }
        };
        const timer = setTimeout(() => {
            initCherry();
        }, 0);
        return () => clearTimeout(timer);
    }, []); // 同时依赖 post 和 isLoading

    // 监听 content 变化更新内容
    useEffect(() => {
        if (cherryInstance && content) {
            cherryInstance.setValue(content);
        }
    }, [cherryInstance, content]);

    // 监听 post 变化获取内容
    const postQuery = trpc.posts.getPostById.useQuery(
        { id: post?.id ?? 0 },
        { enabled: !!post }
    );

    useEffect(() => {
        setContent("");
        if (postQuery.isSuccess) {
            setContent(postQuery.data?.currentVersion?.content ?? "");
        }
        if (postQuery.isError) {
            console.error("Error fetching post content:", postQuery.error);
        }
    }, [postQuery.data, postQuery.isSuccess, postQuery.isError, post]);

    return (
        <div className="h-full flex flex-col">
            {/* 标题栏 */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                        {post.currentVersion?.title ?? post.postVersions[0].title}
                    </h2>
                </div>
                <PostActionButtons post={post} handleChange={handleChange} />
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-hidden bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                {isLoading && (
                    <div className="h-full flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                加载中...
                            </p>
                        </div>
                    </div>
                )}
                <div className={`h-full overflow-auto ${isLoading ? "hidden" : ""}`}>
                    <div ref={cherryRef} id="cherry-markdown" className="h-full">
                        <style>
                            {`
                                .cherry-markdown {
                                    border: none !important;
                                    box-shadow: none !important;
                                    padding: 0 !important;
                                    height: 100% !important;
                                }
                                .cherry {
                                    box-shadow: none !important;
                                    height: 100% !important;
                                }
                                .cherry-editor,
                                .cherry-previewer {
                                    box-shadow: none !important;
                                }
                                .cherry-previewer {
                                    padding: 2rem !important;
                                }
                            `}
                        </style>
                    </div>
                </div>
            </div>
        </div>
    );
}
