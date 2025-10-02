import "cherry-markdown/dist/cherry-markdown.css";
import Cherry from "cherry-markdown/dist/cherry-markdown.core";
import dynamic from "next/dynamic";
import { RotateCcw, Send } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { NewPostVersionRetType, NewPostVersionType } from "@/app/(auth)/api/post/[id]/route";
import { NewPostRetType, NewPostType } from "@/app/(auth)/api/post/route";
import { GetPostVersionType } from "@/app/(auth)/api/post/[id]/[version]/get";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { X, Plus } from "lucide-react";

export default dynamic(() => Promise.resolve(PostEditor), { ssr: false });
export function PostEditor({
    postVersion,
    publish
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
            console.log()
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
                                body: formData  
                            }).then(async (res) => {
                                const data = await res.json();
                                if (data.status === "ok") {
                                    callback(data.url);
                                    toast("图片上传成功", { duration: 3000 });
                                } else {
                                    toast("图片上传失败", {
                                        description: data.message,
                                        duration: 5000
                                    });
                                }
                            }).catch((e) => {
                                console.error(e);
                                toast("图片上传失败", {
                                    description: "请检查网络连接",
                                    duration: 5000
                                });
                            });
                        }
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
        let res: NewPostRetType | NewPostVersionRetType;
        if (postVersion.postId != 0) {
            const postData: NewPostVersionType = {
                title: title,
                description: description == "" ? null : description,
                content: cherryInstance?.getValue() ?? "",
                postId: postVersion.postId,
                publish: publish,
                tags: tags
            };
            const r: NewPostVersionRetType = await (
                await fetch(`/api/post/${postVersion.postId}`, {
                    method: "POST",
                    body: JSON.stringify(postData),
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
            ).json();
            res = r;
        } else {
            const postData: NewPostType = {
                title: title,
                description: description == "" ? null : description,
                content: cherryInstance?.getValue() ?? "",
                tags: tags
            };
            const r: NewPostRetType = await (
                await fetch(`/api/post`, {
                    method: "POST",
                    body: JSON.stringify(postData),
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
            ).json();
            res = r;
        }
        switch (res.status) {
            case "ok":
                router.refresh();
                toast("提交成功", {
                    description: "提交成功",
                    action: {
                        label: "查看",
                        onClick: () => {
                            // 判断res类型
                            if ("post_id" in res) {
                                router.push(`/blogs/${res.post_id}`);
                            } else {
                                router.push(`/blogs/${postVersion.postId}`);
                            }
                        }
                    }
                });
                return;
            case "data_error":
                toast("提交失败", {
                    description: "数据错误"
                });
                return;
            case "db_error":
                toast("提交失败", {
                    description: "数据库错误"
                });
                return;
            case "error":
                toast("提交失败", {
                    description: "请检查网络连接"
                });
                return;
            case "busy":
                toast("提交失败", {
                    description: "请勿频繁提交"
                });
                return;
            case "unauthorized":
                toast("提交失败", {
                    description: "无提交权限"
                });
                return;
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

    const [tags, setTags] = useState<string[]>(postVersion.tags ?? []);
    const [availableTags, setAvailableTags] = useState<{ name: string }[]>([]);
    const [newTag, setNewTag] = useState<string>("");

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await fetch("/api/tags");
                const data = await response.json();
                if (data.status === "ok" && Array.isArray(data.tags)) {
                    setAvailableTags(data.tags);
                } else {
                    setAvailableTags([]);
                    console.warn("获取标签失败：返回数据格式不正确");
                }
            } catch (error) {
                console.error("获取标签失败：", error);
                setAvailableTags([]);
                toast("获取标签失败", {
                    description: "请检查网络连接"
                });
            }
        };

        fetchTags();
    }, []);

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
                <div className="editor h-full" ref={cherryRef} id="markdown-container"></div>
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
                                <p className="text-sm text-muted-foreground mb-1">可用标签：</p>
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
                                description: "内容已恢复到上次保存状态"
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
