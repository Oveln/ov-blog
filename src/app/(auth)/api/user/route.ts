import { prisma } from "@/lib/db";
import { getUser } from "@/data/user";
import { User } from "next-auth";
import { Role } from "@prisma/client";

// 获取当前用户的所有文章和其对应的版本
export type UserPostRetType = {
    id: number;
    create_time: Date;
    current_version: number | null;
    currentVersion: {
        version: number;
        title: string;
        update_time: Date;
    } | null;
    postVersions: {
        version: number;
        title: string;
        update_time: Date;
    }[];
    User: User;
};
export const GET = async () => {
    const user = await getUser();
    if (!user) {
        return Response.json({ status: "unauthorized" });
    }
    if (user.role != Role.ADMIN) {
        return Response.json({ status: "unauthorized" });
    }
    const retPosts: UserPostRetType[] = await prisma.post.findMany({
        where: {},
        select: {
            id: true,
            create_time: true,
            current_version: true,
            currentVersion: {
                select: {
                    title: true,
                    update_time: true,
                    version: true,
                }
            },
            postVersions: {
                select: {
                    title: true,
                    update_time: true,
                    version: true,
                },
                orderBy: {
                    update_time: "desc"
                }
            },
            User: {
                select: {
                    name: true,
                    email: true
                }
            }
        }
    });
    return Response.json(retPosts);
};
