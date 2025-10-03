import { PostActionButtons } from "./PostActionButton";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import type Cherry from "cherry-markdown";
import { trpc } from "@/lib/trpc";
import type { TRPCUserPost } from "./types";

interface PostContentProps {
    post: TRPCUserPost;
    isLoading: boolean;
    handleChange: () => void;
}

export function PostContent({ post, isLoading, handleChange }: PostContentProps) {
    const cherryRef = useRef<HTMLDivElement | null>(null);
    const cherryInstanceRef = useRef<Cherry | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // 获取文章内容
    const postQuery = trpc.posts.getPostById.useQuery(
        { id: post?.id ?? 0 },
        { enabled: !!post }
    );

    // 清理 Cherry 实例
    // 注意：Cherry Markdown 没有公开的 destroy() 方法
    // 正确的清理方式是清空 DOM 引用，让垃圾回收处理
    const destroyCherry = useCallback(() => {
        if (cherryInstanceRef.current && cherryRef.current) {
            try {
                // 清空容器内容，释放 DOM 引用
                if (cherryRef.current) {
                    cherryRef.current.innerHTML = "";
                }
            } catch (error) {
                console.warn("Failed to clean Cherry container:", error);
            }
            cherryInstanceRef.current = null;
            setIsInitialized(false);
        }
    }, []);

    // 初始化 Cherry Markdown 实例（只初始化一次）
    useEffect(() => {
        let isMounted = true;

        const initCherry = async () => {
            // 条件检查：必须有容器，且还没有实例
            if (!cherryRef.current || cherryInstanceRef.current) {
                return;
            }

            try {
                // 动态导入 Cherry Markdown
                const CherryModule = await import(
                    "cherry-markdown/dist/cherry-markdown.core"
                );

                // 检查组件是否还挂载
                if (!isMounted || !cherryRef.current) {
                    return;
                }

                // 创建新实例 - 使用纯预览模式配置
                const instance = new CherryModule.default({
                    el: cherryRef.current,
                    value: "", // 初始为空，后续通过 setMarkdown 更新
                    // 编辑器配置
                    editor: {
                        defaultModel: "previewOnly", // 纯预览模式
                    },
                    // 工具栏配置 - 预览模式下不显示
                    toolbars: {
                        toolbar: false,
                    },
                    // 性能优化配置
                    engine: {
                        syntax: {
                            table: {
                                enableChart: false, // 禁用图表生成（如果不需要）
                            },
                            mathBlock: {
                                engine: "katex", // 数学公式引擎
                            },
                        },
                    },
                    // 预览区域配置
                    previewer: {
                        // 启用 DOM 性能优化
                        enablePreviewerBubble: false, // 禁用气泡菜单
                        // 懒加载图片
                        lazyLoadImg: {
                            loadingImgPath: "", // 加载中图片路径
                            maxNumPerTime: 5, // 每次最多加载图片数
                            noLoadImgNum: 3, // 不懒加载的图片数
                        },
                    },
                    // 回调函数
                    callback: {
                        // 初始化完成回调
                        afterInit: () => {
                            if (isMounted) {
                                setIsInitialized(true);
                                console.log(
                                    "Cherry Markdown 预览实例初始化成功（复用实例）"
                                );
                            }
                        },
                    },
                });

                cherryInstanceRef.current = instance;
            } catch (error) {
                console.error("Failed to initialize Cherry Markdown:", error);
            }
        };

        initCherry();

        return () => {
            isMounted = false;
        };
    }, []); // 空依赖数组 - 只在组件挂载时初始化一次

    // 组件卸载时清理
    useEffect(() => {
        return () => {
            destroyCherry();
        };
    }, [destroyCherry]);

    // 更新内容（复用同一个实例）
    useEffect(() => {
        // 必须：实例已初始化、有文章数据、不在加载状态
        if (
            !cherryInstanceRef.current ||
            !isInitialized ||
            !post ||
            isLoading ||
            !postQuery.isSuccess ||
            !postQuery.data?.currentVersion?.content
        ) {
            return;
        }

        const newContent = postQuery.data.currentVersion.content;

        // 使用 setMarkdown 方法更新内容（Cherry 官方推荐）
        try {
            cherryInstanceRef.current.setMarkdown(newContent);
            console.log("Cherry 实例内容已更新（复用实例）");
        } catch {
            // 降级到 setValue 方法
            const currentContent = cherryInstanceRef.current.getValue?.();
            if (newContent !== currentContent) {
                cherryInstanceRef.current.setValue?.(newContent);
            }
        }
    }, [
        post?.id,
        isLoading,
        postQuery.data?.currentVersion?.content,
        postQuery.isSuccess,
        isInitialized,
    ]);

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
