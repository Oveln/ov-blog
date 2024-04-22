"use client";
import MDEditor from "@uiw/react-md-editor";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loading } from "@/components/ui/loading";
import { GetPostVersionType } from "@/app/(auth)/api/post/[id]/[version]/route";
import { NewPostVersionRetType, NewPostVersionType } from "@/app/(auth)/api/post/[id]/route";
import { toast } from "sonner";
import { RotateCcw, Send } from "lucide-react";

type ERROR = {
    error: string;
};

export default function PostEdit({ params }: { params: { id: string; version: string } }) {
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [postVersion, setPostVersion] = useState<GetPostVersionType>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await fetch(`/api/post/${params.id}/${params.version}`);
                const data = await res.json();
                console.log(data);
                if (!data) {
                    useRouter().push("404");
                }
                setPostVersion(data as GetPostVersionType);
                setTitle(data.title);
                setDescription(data.description || "");
                setContent(data.content);
            } catch {
                useRouter().push("404");
            }
        };
        loadData();
    }, []);

    if (!postVersion) {
        return <Loading />;
    }

    const submit = async () => {
        if (!title) {
            toast("不可以是空标题！");
            return;
        }
        const postData: NewPostVersionType = {
            title: title,
            description: description == "" ? null : description,
            content: content,
            postId: postVersion.postId,
            published: true
        };
        const res: NewPostVersionRetType = await (
            await fetch(`/api/post/${postVersion.postId}`, {
                method: "POST",
                body: JSON.stringify(postData),
                headers: {
                    "Content-Type": "application/json"
                }
            })
        ).json();
        switch (res.status) {
            case "ok":
                toast("提交成功", {
                    description: "提交成功",
                    action: {
                        label: "查看",
                        onClick: () => {
                            useRouter().push(`/dashboard/post/${postVersion.postId}`);
                        }
                    }
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

    const handleChange = (value: string | undefined) => {
        setContent(value || "");
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
                            className="flex-1 w-"
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
                    onChange={handleChange}
                />
            </div>
        </div>
    );
}
