// post一个版本表示切换到这个版本
import { prisma } from "@/data/db";
import { auth } from "@/lib/auth/auth";

type Params = {
    id: string;
    version: string;
};

export type CheckOutPostVersionRetType = {
    status: "ok" | "unauthorized" | "not_found" | "error" | "db_error";
};

export default async function POST(req: Request, context: { params: Params }) {
    const session = await auth();
    const userName = session?.user?.name;
    if (!session || !userName) {
        return Response.json({
            status: "unauthorized"
        });
    }
    const id = parseInt(context.params.id);
    const version = parseInt(context.params.version);
    if (!id || !version) {
        return Response.json({
            status: "error"
        });
    }
    // 如果这个文章不是该用户的
    if (
        !(await prisma.post.findUnique({
            where: {
                id: id,
                User: {
                    name: userName
                }
            }
        }))
    ) {
        return Response.json({
            status: "unauthorized"
        });
    }

    try {
        await prisma.$transaction([
            prisma.post_Version.updateMany({
                where: {
                    Post: {
                        id: id
                    }
                },
                data: {
                    published: false
                }
            }),
            prisma.post_Version.update({
                where: {
                    postId_version: {
                        postId: id,
                        version: version
                    }
                },
                data: {
                    published: true
                }
            })
        ]);
    } catch (e) {
        return Response.json({
            status: "db_error"
        });
    }
    return Response.json({
        status: "ok"
    });
}
