import { prisma } from "@/data/db";
import { Role, getUser } from "@/data/user";

type Params = {
    userName: string;
};
export const GET = async (_req: Request, context: { params: Params }) => {
    const user = await getUser();
    if (!user) {
        return Response.json({ status: "unauthorized" });
    }
    if (user.name != context.params.userName && user.role != Role.ADMIN) {
        return Response.json({ status: "unauthorized" });
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
