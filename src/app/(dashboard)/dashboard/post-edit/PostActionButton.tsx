import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BadgeCheck, BadgeMinus } from "lucide-react";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { AppRouter } from "@/server/trpc";
import type { inferRouterOutputs } from "@trpc/server";

// 从 tRPC router 推断返回类型
type RouterOutput = inferRouterOutputs<AppRouter>;
type TRPCUserPost = RouterOutput["user"]["getUserPosts"][number];

export const PostActionButtons = ({
    post,
    handleChange,
}: {
    post: TRPCUserPost;
    handleChange: (
        postId: number,
        version: number,
        action: "delete" | "check_out"
    ) => void;
}) => {
    const deleteVersion = trpc.posts.deleteVersion.useMutation({
        onSuccess: (_data, variables) => {
            toast.success("删除成功", {
                description: "Delete Success",
            });
            handleChange(variables.id, variables.version, "delete");
        },
        onError: (error) => {
            toast.error("删除失败", {
                description: error.message,
            });
        },
    });

    const checkoutVersion = trpc.posts.checkoutVersion.useMutation({
        onSuccess: (_data, variables) => {
            toast.success("切换成功", {
                description: "CheckOut Success",
            });
            handleChange(variables.id, variables.version, "check_out");
        },
        onError: (error) => {
            toast.error("切换失败", {
                description: error.message,
            });
        },
    });
    return (
        <div className="flex justify-center">
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-24">
                        Edit
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mr-2">
                    {post.postVersions.map((postVersion) => (
                        <Link
                            key={postVersion.version}
                            href={`/dashboard/post-edit/${post.id}/${postVersion.version}`}
                        >
                            <DropdownMenuItem>
                                {postVersion.version == post.current_version ? (
                                    <BadgeCheck className="mr-2 h-5 w-5" />
                                ) : (
                                    <BadgeMinus className="mr-2 h-5 w-5" />
                                )}
                                <span>Version: {postVersion.version}</span>
                            </DropdownMenuItem>
                        </Link>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-2 w-24">
                        CheckOut
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mr-2">
                    {post.postVersions.map((postVersion) => (
                        <DropdownMenuItem
                            key={postVersion.version}
                            onClick={() => {
                                console.log("CheckOut", postVersion.version);
                                checkoutVersion.mutate({
                                    id: post.id,
                                    version: postVersion.version,
                                });
                            }}
                        >
                            {postVersion.version == post.current_version ? (
                                <BadgeCheck className="mr-2 h-5 w-5" />
                            ) : (
                                <BadgeMinus className="mr-2 h-5 w-5" />
                            )}
                            <span>Version: {postVersion.version}</span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-2 w-24">
                        Delete
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mr-2">
                    {post.postVersions.map((postVersion) => (
                        <DropdownMenuItem
                            key={postVersion.version}
                            onClick={() => {
                                console.log("Delete", postVersion.version);
                                deleteVersion.mutate({
                                    id: post.id,
                                    version: postVersion.version,
                                });
                            }}
                        >
                            {postVersion.version == post.current_version ? (
                                <BadgeCheck className="mr-2 h-5 w-5" />
                            ) : (
                                <BadgeMinus className="mr-2 h-5 w-5" />
                            )}
                            <span>Version: {postVersion.version}</span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};
