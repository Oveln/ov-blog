import { prisma } from "@/data/db";
import { Role, getUser } from "@/data/user";

type Params = {
    userName: string;
};
// 获取当前用户的所有文章和其对应的版本
export type UserPostRetType = {
    id: number;
    create_time: Date;
    postVersions: {
        title: string;
        version: number;
        update_time: Date;
        published: boolean;
    }[];
};
export const GET = async (req: Request, context: { params: Params }) => {
    const user = await getUser();
    if (!user) {
        return { status: "unauthorized" };
    }
    if (user.name != context.params.userName && user.role != Role.ADMIN) {
        return { status: "unauthorized" };
    }
    const retPosts = await prisma.post.findMany({
        where: {
            User: {
                name: user.name
            }
        },
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
            }
        }
    });
    return Response.json(retPosts);
};
