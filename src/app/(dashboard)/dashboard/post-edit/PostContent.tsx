import { UserPostRetType } from "@/app/(auth)/api/user/route";
import { PostActionButtons } from "./PostActionButton";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Cherry from "cherry-markdown";
import { cn } from "@/lib/utils";

interface PostContentProps {
    post: UserPostRetType;
    isLoading: boolean;
    handleChange: (postId: number, version: number, action: "delete" | "check_out") => void;
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
                const Cherry = await import('cherry-markdown/dist/cherry-markdown');
                const instance = new Cherry.default({
                    el: cherryRef.current,
                    value: '',
                    editor: {
                        defaultModel: 'previewOnly'
                    }
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
    useEffect(() => {
        setContent("");
        const fetchContent = async () => {
            if (!post) return;

            try {
                const response = await fetch(`/api/post/${post.id}/${post.current_version}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch post content');
                }
                const data = await response.json();
                setContent(data.content);
            } catch (error) {
                console.error('Error fetching post content:', error);
            }
        };

        fetchContent();
    }, [post]); // 只在 post 变化时获取新内容

    return (
        <div className="overflow-hidden">
            <div className="flex items-center justify-between mb-6 py-6">
                <h2 className="text-2xl font-semibold">
                    {post.currentVersion?.title ?? post.postVersions[0].title}
                </h2>
                <PostActionButtons post={post} handleChange={handleChange} />
            </div>
            {isLoading && (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}
            <div className="h-[calc(100vh-250px)] overflow-auto mb-2">
                <div ref={cherryRef} id="cherry-markdown" className={cn("border", isLoading ? "hidden" : "")}>
                    <style>
                        {`
              .cherry-markdown {
                border: none !important;
                box-shadow: none !important;
                padding: 2 !important;
              }
              .cherry {
                box-shadow: none !important;
              }
              .cherry-editor,
              .cherry-previewer {
                box-shadow: none !important;
              }
            `}
                    </style>
                </div>
            </div>
        </div>
    );
} 