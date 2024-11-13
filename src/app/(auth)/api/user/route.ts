import { prisma } from "@/data/db";
import { getUser, Role } from "@/data/user";

// 获取当前用户的所有文章和其对应的版本
export type UserPostRetType = {
    id: number;
    create_time: Date;
    postVersions: {
        version: number;
        title: string;
        update_time: Date;
        published: boolean;
    }[];
    User: {
        name: string;
        email: string;
    };
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
            postVersions: {
                select: {
                    title: true,
                    update_time: true,
                    version: true,
                    published: true
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
