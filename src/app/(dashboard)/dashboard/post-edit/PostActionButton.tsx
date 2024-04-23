import { DeletePostVersionRetType } from "@/app/(auth)/api/post/[id]/[version]/delete";
import { UserPostRetType } from "@/app/(auth)/api/user/route";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { BadgeCheck, BadgeMinus } from "lucide-react";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";

export const PostActionButtons = ({
    post,
    handleChange
}: {
    post: UserPostRetType;
    handleChange: (postId: number, version: number, action: "delete" | "check_out") => void;
}) => {
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
                                {postVersion.published ? (
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
                                handleChange(post.id, postVersion.version, "check_out");
                            }}
                        >
                            {postVersion.published ? (
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
                            onClick={async () => {
                                console.log("Delete", postVersion.version);
                                const res: DeletePostVersionRetType = await (
                                    await fetch(`/api/post/${post.id}/${postVersion.version}`, {
                                        method: "DELETE"
                                    })
                                ).json();
                                switch (res.status) {
                                    case "ok":
                                        toast("删除成功", {
                                            description: "Delete Success"
                                        });
                                        handleChange(post.id, postVersion.version, "delete");
                                        break;
                                    case "unauthorized":
                                        toast("删除失败", {
                                            description: "Unauthorized"
                                        });
                                        break;
                                    case "not_found":
                                        toast("删除失败", {
                                            description: "Not Found"
                                        });
                                        break;
                                    case "error":
                                        toast("删除失败", {
                                            description: "Error"
                                        });
                                        break;
                                }
                            }}
                        >
                            {postVersion.published ? (
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
