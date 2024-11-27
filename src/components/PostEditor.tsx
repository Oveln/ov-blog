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
    const cherryInstance = useRef<Cherry | null>(null);

    useEffect(() => {
        // 其他组件加载完毕后再加载编辑器
        const timer = setTimeout(() => {
            import("cherry-markdown/dist/cherry-markdown").then((Cherry) => {
                const cherry = new Cherry.default({
                    id: "markdown-container",
                    value: postVersion.content
                });
                cherryInstance.current = cherry;
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
                content: cherryInstance.current?.getValue() ?? "",
                postId: postVersion.postId,
                publish: publish
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
                content: cherryInstance.current?.getValue() ?? ""
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

    return (
        <div className="flex h-full gap-6 bg-background">
            {/* 左侧编辑器区域 - 移除边框和背景 */}
            <div className="flex-1 overflow-hidden border-r">
                <div className="editor h-full" id="markdown-container"></div>
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
                    </div>
                </div>

                <div className="flex flex-col gap-3 mt-auto">
                    <Button
                        className="h-11 text-base"
                        onClick={submit}
                    >
                        <Send className="h-5 w-5 mr-2" />
                        <span>发布文章</span>
                    </Button>

                    <Button
                        variant="outline"
                        className="h-11 text-base"
                        onClick={() => {
                            toast("重置成功", {
                                description: "内容已恢复到上次保存状态"
                            });
                            cherryInstance.current?.setValue(postVersion.content);
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
