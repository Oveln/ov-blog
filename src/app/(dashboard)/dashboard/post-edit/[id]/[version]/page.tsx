"use client";
import MDEditor from "@uiw/react-md-editor";
import React, { useState, ChangeEvent, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ERROR = {
    error: string;
};

type Post_Version = {
    id: number;
    title: string;
    description: string | null;
    content: string;
    version: number;
    create_time: Date;
    update_time: Date;
    postId: number;
} | null;

enum PageState {
    LOADING,
    ERROR,
    LOADED
}

export default function PostEdit({ params }: { params: { id: string; version: string } }) {
    const [pageState, setPageState] = useState<PageState>(PageState.LOADING);
    const [content, setContent] = useState<string>("");
    let postVersion: Post_Version = null;
    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await fetch(`/api/post/${params.id}/${params.version}`);
                const data = await res.json();
                console.log(data);
                postVersion = data;
                if (!postVersion) {
                    setPageState(PageState.ERROR);
                    return;
                }
                setContent(postVersion?.content);
                setPageState(PageState.LOADED);
            } catch {
                setPageState(PageState.ERROR);
            }
        };
        loadData();
    }, []);
    const handleChange = (value: string | undefined) => {
        setContent(value || "");
        console.log(value);
    };

    if (pageState == PageState.LOADING) {
        return loading();
    }

    if (pageState == PageState.ERROR) {
        return loading();
    }

    return (
        <div className="flex flex-col relative h-full">
            <div className="flex w-1/4 my-2">
                <span className="flex items-center justify-center text-xl px-2">标题</span>
                <Input className="flex-1 w-"></Input>
            </div>
            <div className="flex w-1/4 my-2">
                <span className="flex items-center justify-center text-xl px-2">描述</span>
                <Input className="flex-1 w-"></Input>
            </div>
            <div className="flex-1 p-2">
                <MDEditor
                    className="editor h-full"
                    height="100%"
                    value={content}
                    onChange={handleChange}
                />
            </div>
            <div className="flex mx-auto">
                <Button className="w-24 h-12 my-auto m-2" variant="outline" onClick={() => {}}>
                    <span>重置</span>
                </Button>
                <Button className="w-24 h-12 my-auto m-2" variant="outline" onClick={() => {}}>
                    <span>提交</span>
                </Button>
            </div>
        </div>
    );
}
function loading() {
    return <div>Loading...</div>;
}
