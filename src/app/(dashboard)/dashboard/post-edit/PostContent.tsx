import { UserPostRetType } from "@/app/(auth)/api/user/route";
import { PostActionButtons } from "./PostActionButton";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import Cherry from "cherry-markdown";

interface PostContentProps {
    post: UserPostRetType | null;
    isLoading: boolean;
    handleChange: (postId: number, version: number, action: "delete" | "check_out") => void;
}

export function PostContent({ post, isLoading, handleChange }: PostContentProps) {
    const cherryRef = useRef<Cherry | null>(null);

    useEffect(() => {
        const initCherry = async () => {
            if (!post) return;
            const { default: CherryMarkdown } = await import('cherry-markdown');

            if (cherryRef.current) {
                cherryRef.current.destroy();
                cherryRef.current = null;
            }

            cherryRef.current = new CherryMarkdown({
                id: 'cherry-markdown',
                value: '',
                editor: {
                    defaultModel: 'previewOnly'
                }
            });

            try {
                const response = await fetch(`/api/post/${post.id}/${post.current_version}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch post content');
                }
                const data = await response.json();
                cherryRef.current.setValue(data.content);
            } catch (error) {
                console.error('Error fetching post content:', error);
            }
        };

        initCherry();

        return () => {
            if (cherryRef.current) {
                cherryRef.current.destroy();
                cherryRef.current = null;
            }
        };
    }, [post]);

    if (!post) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                Select a post to view details
            </div>
        );
    }

    return (
        <div className="">
            <div className="flex items-center justify-between mb-6 py-6">
                <h2 className="text-2xl font-semibold">
                    {post.currentVersion?.title ?? post.postVersions[0].title}
                </h2>
                <PostActionButtons post={post} handleChange={handleChange} />
            </div>
            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div id="cherry-markdown" className="h-[calc(100vh-200px)] border">
                    <style>
                        {`
              .cherry-markdown {
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
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
            )}
        </div>
    );
} 