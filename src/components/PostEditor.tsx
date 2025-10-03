import "cherry-markdown/dist/cherry-markdown.css";
import Cherry from "cherry-markdown/dist/cherry-markdown.core";
import dynamic from "next/dynamic";
import { RotateCcw, Send } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { X, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { uploadFile } from "@/lib/upload";
import type { AppRouter } from "@/server/trpc";
import type { inferRouterOutputs } from "@trpc/server";

type RouterOutput = inferRouterOutputs<AppRouter>;
type GetPostVersionType = RouterOutput["posts"]["getVersion"] | null;

export default dynamic(() => Promise.resolve(PostEditor), { ssr: false });
export function PostEditor({
    postVersion,
    publish,
}: {
    postVersion: GetPostVersionType;
    publish: boolean;
}) {
    if (!postVersion) {
        useRouter().push("/404");
        return;
    }

    const [title, setTitle] = useState<string>(postVersion.title);
    const [description, setDescription] = useState<string>(postVersion.description ?? "");
    const router = useRouter();
    const cherryRef = useRef<HTMLDivElement | null>(null);
    const [cherryInstance, setCherryInstance] = useState<Cherry | null>(null);

    useEffect(() => {
        // 渲染完毕后再渲染这个
        const timer = setTimeout(() => {
            console.log();
            import("cherry-markdown/dist/cherry-markdown").then((Cherry) => {
                if (cherryRef.current) {
                    const cherry = new Cherry.default({
                        el: cherryRef.current,
                        value: postVersion.content,
                        fileUpload: async (
                            file: File,
                            callback: (url: string) => void
                        ) => {
                            const result = await uploadFile(file, {
                                onSuccess: (data) => {
                                    if (data) {
                                        callback(data.url);
                                        toast("文件上传成功", { duration: 3000 });
                                    }
                                },
                                onError: (error) => {
                                    toast("文件上传失败", {
                                        description: error,
                                        duration: 5000,
                                    });
                                },
                            });

                            // 如果上传失败但没有触发回调，显示默认错误
                            if (result.status === "error" && !result.message) {
                                toast("文件上传失败", {
                                    description: "请检查网络连接",
                                    duration: 5000,
                                });
                            }
                        },
                    });
                    setCherryInstance(cherry);
                }
            });
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    const submit = async () => {
        if (!title) {
            toast("不可以是空标题！");
            return;
        }

        const content = cherryInstance?.getValue() ?? "";
        const postData = {
            title,
            description: description === "" ? null : description,
            content,
            tags,
        };

        if (postVersion.postId !== 0) {
            // 创建新版本
            createVersion.mutate({
                ...postData,
                postId: postVersion.postId,
                publish,
            });
        } else {
            // 创建新文章
            createPost.mutate(postData);
        }
    };
    // 获取高度
    // const buttonsRef = useRef<HTMLDivElement>(null);
    // const pageRef = useRef<HTMLDivElement>(null);
    // const [height, setHeight] = useState<number>(0);
    // useEffect(() => {
    //     // 监听resize
    //     const resize = () => {
    //         if (!pageRef.current || !buttonsRef.current) {
    //             return;
    //         }
    //         const height = pageRef.current.clientHeight - buttonsRef.current.clientHeight - 16;
    //         setHeight(height);
    //     };
    //     window.addEventListener("resize", resize);
    //     resize();
    // }, []);
    // const editorRef = useRef<Cherry | null>(null);

    const [tags, setTags] = useState<string[]>(
        postVersion.tags?.map((tag) => tag.tagName) ?? []
    );
    const [newTag, setNewTag] = useState<string>("");

    // 使用 tRPC 获取标签
    const { data: availableTagsData = [] } = trpc.tags.getAll.useQuery();
    const availableTags = availableTagsData;

    // tRPC mutations
    const createPost = trpc.posts.create.useMutation({
        onSuccess: (data) => {
            router.refresh();
            toast("提交成功", {
                description: "文章创建成功",
                action: {
                    label: "查看",
                    onClick: () => {
                        router.push(`/blogs/${data.post_id}`);
                    },
                },
            });
        },
        onError: (error) => {
            if (error.message.includes("访客用户")) {
                toast("提交失败", {
                    description: "无提交权限",
                });
            } else {
                toast("提交失败", {
                    description: error.message || "请检查网络连接",
                });
            }
        },
    });

    const createVersion = trpc.posts.createVersion.useMutation({
        onSuccess: () => {
            router.refresh();
            toast("提交成功", {
                description: "版本创建成功",
                action: {
                    label: "查看",
                    onClick: () => {
                        router.push(`/blogs/${postVersion.postId}`);
                    },
                },
            });
        },
        onError: (error) => {
            toast("提交失败", {
                description: error.message || "请检查网络连接",
            });
        },
    });

    const addTag = () => {
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
            setNewTag("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    return (
        <div className="flex h-full gap-6 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-900 dark:to-gray-950">
            {/* 左侧编辑器区域 */}
            <div className="flex-1 overflow-hidden">
                <div
                    className="editor h-full rounded-l-xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden bg-white dark:bg-gray-950"
                    ref={cherryRef}
                    id="markdown-container"
                ></div>
            </div>

            {/* 右侧信息面板 */}
            <div className="w-96 flex flex-col gap-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-lg p-6 my-6 mr-6">
                <div className="flex-1 overflow-y-auto">
                    <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                        文章信息
                    </h2>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                文章标题 <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={title}
                                onChange={(s) => setTitle(s.target.value)}
                                placeholder="请输入标题"
                                className="h-10 border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-primary"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                文章简介
                            </label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="请输入简介"
                                className="min-h-[100px] resize-none border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-primary"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                文章标签
                            </label>

                            <div className="flex gap-2">
                                <Input
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addTag();
                                        }
                                    }}
                                    placeholder="输入新标签并按回车"
                                    className="flex-1 border-gray-300 dark:border-gray-700"
                                />
                                <Button
                                    onClick={addTag}
                                    variant="outline"
                                    size="sm"
                                    className="px-4"
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    添加
                                </Button>
                            </div>

                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                                    {tags.map((tag, index) => (
                                        <Badge
                                            key={`${tag}-${index}`}
                                            variant="secondary"
                                            className="px-3 py-1.5 text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                        >
                                            {tag}
                                            <X
                                                className="ml-2 h-3.5 w-3.5 cursor-pointer hover:text-red-600 transition-colors"
                                                onClick={() => removeTag(tag)}
                                            />
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {availableTags.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                        可用标签
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {availableTags.map((tag, index) => (
                                            <Badge
                                                key={`${tag.name}-${index}`}
                                                variant="outline"
                                                className="cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary transition-all"
                                                onClick={() => {
                                                    if (!tags.includes(tag.name)) {
                                                        setTags([...tags, tag.name]);
                                                    }
                                                }}
                                            >
                                                {tag.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <Button
                        className="h-11 text-base bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
                        onClick={submit}
                        disabled={createPost.isPending || createVersion.isPending}
                    >
                        <Send className="h-5 w-5 mr-2" />
                        <span>
                            {createPost.isPending || createVersion.isPending
                                ? "发布中..."
                                : "发布文章"}
                        </span>
                    </Button>

                    <Button
                        variant="outline"
                        className="h-11 text-base border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => {
                            cherryInstance?.setValue(postVersion.content);
                            toast.success("重置成功", {
                                description: "内容已恢复到上次保存状态",
                            });
                        }}
                    >
                        <RotateCcw className="h-5 w-5 mr-2" />
                        <span>重置内容</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
