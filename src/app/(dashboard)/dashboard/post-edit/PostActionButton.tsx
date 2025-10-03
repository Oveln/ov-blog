import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BadgeCheck, BadgeMinus, Edit, GitBranch, Trash2 } from "lucide-react";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { TRPCUserPost } from "./types";

export const PostActionButtons = ({
    post,
    handleChange,
}: {
    post: TRPCUserPost;
    handleChange: () => void;
}) => {
    const deleteVersion = trpc.posts.deleteVersion.useMutation({
        onSuccess: () => {
            toast.success("删除成功", {
                description: "Delete Success",
            });
            handleChange();
        },
        onError: (error) => {
            toast.error("删除失败", {
                description: error.message,
            });
        },
    });

    const checkoutVersion = trpc.posts.checkoutVersion.useMutation({
        onSuccess: () => {
            toast.success("切换成功", {
                description: "CheckOut Success",
            });
            handleChange();
        },
        onError: (error) => {
            toast.error("切换失败", {
                description: error.message,
            });
        },
    });
    return (
        <div className="flex gap-2">
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Edit className="h-4 w-4" />
                        编辑
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="text-xs text-gray-500 font-normal">
                        选择版本进行编辑
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {post.postVersions.map((postVersion) => (
                        <Link
                            key={postVersion.version}
                            href={`/dashboard/post-edit/${post.id}/${postVersion.version}`}
                        >
                            <DropdownMenuItem className="cursor-pointer gap-2">
                                {postVersion.version == post.current_version ? (
                                    <BadgeCheck className="h-4 w-4 text-green-600" />
                                ) : (
                                    <BadgeMinus className="h-4 w-4 text-gray-400" />
                                )}
                                <span className="flex-1">版本 {postVersion.version}</span>
                                {postVersion.version == post.current_version && (
                                    <span className="text-xs text-green-600 bg-green-50 dark:bg-green-950 px-1.5 py-0.5 rounded">
                                        当前
                                    </span>
                                )}
                            </DropdownMenuItem>
                        </Link>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                        <GitBranch className="h-4 w-4" />
                        切换版本
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="text-xs text-gray-500 font-normal">
                        切换到其他版本
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {post.postVersions.map((postVersion) => (
                        <DropdownMenuItem
                            key={postVersion.version}
                            onClick={() => {
                                if (postVersion.version === post.current_version) {
                                    toast.info("已经是当前版本");
                                    return;
                                }
                                checkoutVersion.mutate({
                                    id: post.id,
                                    version: postVersion.version,
                                });
                            }}
                            className="cursor-pointer gap-2"
                            disabled={postVersion.version === post.current_version}
                        >
                            {postVersion.version == post.current_version ? (
                                <BadgeCheck className="h-4 w-4 text-green-600" />
                            ) : (
                                <BadgeMinus className="h-4 w-4 text-gray-400" />
                            )}
                            <span className="flex-1">版本 {postVersion.version}</span>
                            {postVersion.version == post.current_version && (
                                <span className="text-xs text-green-600 bg-green-50 dark:bg-green-950 px-1.5 py-0.5 rounded">
                                    当前
                                </span>
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                        <Trash2 className="h-4 w-4" />
                        删除
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="text-xs text-gray-500 font-normal">
                        选择要删除的版本
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {post.postVersions.map((postVersion) => (
                        <DropdownMenuItem
                            key={postVersion.version}
                            onClick={() => {
                                if (post.postVersions.length === 1) {
                                    toast.error("无法删除", {
                                        description: "至少需要保留一个版本",
                                    });
                                    return;
                                }
                                deleteVersion.mutate({
                                    id: post.id,
                                    version: postVersion.version,
                                });
                            }}
                            className="cursor-pointer gap-2 text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950"
                        >
                            {postVersion.version == post.current_version ? (
                                <BadgeCheck className="h-4 w-4" />
                            ) : (
                                <BadgeMinus className="h-4 w-4" />
                            )}
                            <span className="flex-1">版本 {postVersion.version}</span>
                            {postVersion.version == post.current_version && (
                                <span className="text-xs bg-red-100 dark:bg-red-950 px-1.5 py-0.5 rounded">
                                    当前
                                </span>
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};
