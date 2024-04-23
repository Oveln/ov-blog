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

export const PostActionButton = ({ post }: { post: UserPostRetType }) => {
    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">Edit</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mr-2">
                {
                    // 0..3循环
                    post.postVersions.map((postVersion) => (
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
                    ))
                }
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
