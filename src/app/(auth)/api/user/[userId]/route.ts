import { prisma } from "@/lib/db";
import { getUser, Role } from "@/data/user";

type Params = {
    userId: string;
};
export const GET = async (_req: Request, context: { params: Promise<Params> }) => {
    const params = await context.params;
    const user = await getUser();
    if (!user) {
        return Response.json({ status: "unauthorized" });
    }
    if (user.id != params.userId && user.role != Role.ADMIN) {
        return Response.json({ status: "unauthorized" });
    }
    const retPosts = await prisma.post.findMany({
        where: {
            User: {
                id: user.id
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
