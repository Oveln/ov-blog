import MDEditor from "@uiw/react-md-editor";
import { Send, RotateCcw } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { Loading } from "./ui/loading";
import { NewPostVersionRetType, NewPostVersionType } from "@/app/(auth)/api/post/[id]/route";
import { NewPostRetType, NewPostType } from "@/app/(auth)/api/post/route";
import { GetPostVersionType } from "@/app/(auth)/api/post/[id]/[version]/get";

export default function PostEditor({ postVersion }: { postVersion: GetPostVersionType }) {
    if (!postVersion) {
        return <Loading />;
    }

    const [title, setTitle] = useState<string>(postVersion.title);
    const [description, setDescription] = useState<string>(postVersion.description ?? "");
    const [content, setContent] = useState<string>(postVersion.content);
    const router = useRouter();

    const submit = async () => {
        if (!title) {
            toast("不可以是空标题！");
            return;
        }
        let res;
        if (postVersion.postId != 0) {
            const postData: NewPostVersionType = {
                title: title,
                description: description == "" ? null : description,
                content: content,
                postId: postVersion.postId,
                published: true
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
                content: content
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
                toast("提交成功", {
                    description: "提交成功",
                    action: {
                        label: "查看",
                        onClick: () => {
                            router.push(`/blogs/${postVersion.postId}`);
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
                    description: "请先登录"
                });
                return;
        }
    };
    return (
        <div className="flex flex-col relative h-full">
            <div className="flex">
                <div className="flex flex-col flex-1 py-2">
                    <div className="flex w-3/5 mb-2 flex-1">
                        <span className="flex items-center justify-center text-xl px-2">标题</span>
                        <Input
                            value={title}
                            onChange={(s) => setTitle(s.target.value)}
                            placeholder="请输入标题"
                            className="flex-1"
                        ></Input>
                    </div>
                    <div className="flex w-3/5 flex-1">
                        <span className="flex items-center justify-center text-xl px-2">简介</span>
                        <Input
                            value={description}
                            onChange={(s) => setDescription(s.target.value)}
                            placeholder=""
                            className="flex-1"
                        ></Input>
                    </div>
                </div>
                <div className="flex flex-col flex-1 py-2">
                    <Button className="ml-auto mr-2 mb-2 flex-1" variant="outline" onClick={submit}>
                        <Send className="h-5 w-5 mr-2 " />
                        <span>提交</span>
                    </Button>

                    <Button
                        className="ml-auto mr-2 flex-1 mb-2"
                        variant="outline"
                        onClick={() => {
                            toast("重置!", {
                                description: "重置成功"
                            });
                            setContent(postVersion.content);
                        }}
                    >
                        <RotateCcw className="h-5 w-5 mr-2 " />
                        <span>重置</span>
                    </Button>
                </div>
            </div>
            <div className="flex-1 p-2">
                <MDEditor
                    className="editor h-full"
                    height="100%"
                    value={content}
                    onChange={(s) => setContent(s || "")}
                />
            </div>
        </div>
    );
}
