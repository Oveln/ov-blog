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
                        fileUpload: (file: File, callback: (url: string) => void) => {
                            const formData = new FormData();
                            formData.append("file", file);
                            // 上传到服务器
                            fetch("/api/upload", {
                                method: "POST",
                                body: formData,
                            })
                                .then(async (res) => {
                                    const data = await res.json();
                                    if (data.status === "ok") {
                                        callback(data.url);
                                        toast("图片上传成功", { duration: 3000 });
                                    } else {
                                        toast("图片上传失败", {
                                            description: data.message,
                                            duration: 5000,
                                        });
                                    }
                                })
                                .catch((e) => {
                                    console.error(e);
                                    toast("图片上传失败", {
                                        description: "请检查网络连接",
                                        duration: 5000,
                                    });
                                });
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
        <div className="flex h-full gap-6 bg-background">
            {/* 左侧编辑器区域 - 移除边框和背景 */}
            <div className="flex-1 overflow-hidden border-r">
                <div
                    className="editor h-full"
                    ref={cherryRef}
                    id="markdown-container"
                ></div>
            </div>

            {/* 右侧侧边栏 */}
            <div className="w-96 flex flex-col gap-6 rounded-lg border bg-card p-6 m-4">
                <div>
                    <h2 className="text-xl font-semibold mb-6">文章信息</h2>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                文章标题
                            </label>
                            <Input
                                value={title}
                                onChange={(s) => setTitle(s.target.value)}
                                placeholder="请输入标题"
                                className="h-10"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                文章简介
                            </label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="请输入简介"
                                className="min-h-[100px] resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                文章标签
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    placeholder="输入新标签"
                                    className="grow"
                                />
                                <Button onClick={addTag} variant="outline">
                                    <Plus className="h-4 w-4 mr-2" />
                                    添加
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {tags.map((tag, index) => (
                                    <Badge
                                        key={`${tag}-${index}`}
                                        variant="secondary"
                                        className="px-2 py-1"
                                    >
                                        {tag}
                                        <X
                                            className="ml-1 h-3 w-3 cursor-pointer"
                                            onClick={() => removeTag(tag)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                            <div className="mt-2">
                                <p className="text-sm text-muted-foreground mb-1">
                                    可用标签：
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {availableTags.map((tag, index) => (
                                        <Badge
                                            key={`${tag.name}-${index}`}
                                            variant="outline"
                                            className="cursor-pointer"
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
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 mt-auto">
                    <Button className="h-11 text-base" onClick={submit}>
                        <Send className="h-5 w-5 mr-2" />
                        <span>发布文章</span>
                    </Button>

                    <Button
                        variant="outline"
                        className="h-11 text-base"
                        onClick={() => {
                            console.log(availableTags);
                            toast("重置成功", {
                                description: "内容已恢复到上次保存状态",
                            });
                            cherryInstance?.setValue(postVersion.content);
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
