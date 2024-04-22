import { getPostByUserName, getPostVersionByPostIdAndVersion, prisma } from "@/data/db";
import { auth } from "@/lib/auth/auth";

type Params = {
    userName: string;
};

export type UserPostRetType = {
    id: number;
    postVersions: {
        title: string;
        version: number;
        create_time: Date;
        update_time: Date;
        published: boolean;
    }[];
};
export const GET = async (req: Request, context: { params: Params }) => {
    const session = await auth();
    const userName = session?.user?.name;
    if (!session || !userName) {
        return Response.json({
            error: "Unauthorized"
        });
    }
    const retPosts = await prisma.post.findMany({
        where: {
            User: {
                name: userName
            }
        },
        select: {
            id: true,
            postVersions: {
                select: {
                    title: true,
                    create_time: true,
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
