import dynamic from "next/dynamic";
import React, { useRef, useState } from "react";
import { RotateCcw, Send, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { trpc } from "@/lib/trpc";
import type { AppRouter } from "@/server/trpc";
import type { inferRouterOutputs } from "@trpc/server";
import MarkdownEditor, { MarkdownEditorRef } from "./MarkdownEditor";

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
    const router = useRouter();
    if (!postVersion) {
        router.push("/404");
        return null;
    }
    // 文章主信息
    const [title, setTitle] = useState<string>(postVersion.title);
    const [description, setDescription] = useState<string>(postVersion.description ?? "");
    const [tags, setTags] = useState<string[]>(
        postVersion.tags?.map((tag) => tag.tagName) ?? []
    );
    const [newTag, setNewTag] = useState<string>("");
    // CherryMarkdown 编辑器实例
    const markdownRef = useRef<MarkdownEditorRef>(null);

    // tRPC 标签
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
                    onClick: () => router.push(`/blogs/${data.post_id}`),
                },
            });
        },
        onError: (error) => {
            if (error.message.includes("访客用户")) {
                toast("提交失败", { description: "无提交权限" });
            } else {
                toast("提交失败", { description: error.message || "请检查网络连接" });
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
                    onClick: () => router.push(`/blogs/${postVersion.postId}`),
                },
            });
        },
        onError: (error) => {
            toast("提交失败", { description: error.message || "请检查网络连接" });
        },
    });

    // 标签操作
    const addTag = () => {
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
            setNewTag("");
        }
    };

    // 提交
    const submit = async () => {
        if (!title) {
            toast("不可以是空标题！");
            return;
        }
        const content = markdownRef.current?.getValue() ?? "";
        const postData = {
            title,
            description: description === "" ? null : description,
            content,
            tags,
        };
        if (postVersion.postId !== 0) {
            createVersion.mutate({ ...postData, postId: postVersion.postId, publish });
        } else {
            createPost.mutate(postData);
        }
    };

    return (
        <div className="flex h-full gap-6 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-900 dark:to-gray-950">
            {/* 左侧 Markdown 编辑器 */}
            <div className="flex-1 overflow-hidden">
                <MarkdownEditor ref={markdownRef} initialContent={postVersion.content} />
            </div>
            {/* 右侧信息面板 */}
            <div className="w-96 flex flex-col gap-6 rounded-r-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-lg p-6 my-6 mr-6">
                <div className="flex-1 overflow-y-auto">
                    <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                        文章信息
                    </h2>
                    <div className="space-y-5 px-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 px-2">
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
                            <div className="flex gap-2 relative z-10 bg-white dark:bg-gray-950">
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
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    标签
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {/* 新标签和可用标签合并去重显示 */}
                                    {[
                                        ...new Set([
                                            ...availableTags.map((t) => t.name),
                                            ...tags,
                                        ]),
                                    ].map((tag, index) => (
                                        <Badge
                                            key={`${tag}-${index}`}
                                            variant={
                                                tags.includes(tag)
                                                    ? "secondary"
                                                    : "outline"
                                            }
                                            className={`cursor-pointer px-2 py-0.5 text-xs rounded-full transition-all flex items-center`}
                                            style={{
                                                minHeight: "1.5rem",
                                                borderRadius: "999px",
                                            }}
                                            onClick={() => {
                                                if (tags.includes(tag)) {
                                                    setTags(
                                                        tags.filter((t) => t !== tag)
                                                    );
                                                } else {
                                                    setTags([...tags, tag]);
                                                }
                                            }}
                                        >
                                            {tag}
                                            {tags.includes(tag) && (
                                                <X className="ml-1 h-3 w-3 cursor-pointer hover:text-red-600 transition-colors" />
                                            )}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
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
                            markdownRef.current?.setValue(postVersion.content);
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
