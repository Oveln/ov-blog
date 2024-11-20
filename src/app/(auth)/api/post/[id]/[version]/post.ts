// post一个版本表示切换到这个版本
import { checkPermissionsForPost, prisma } from "@/lib/db";
import { getUser } from "@/data/user";

type Params = {
    id: string;
    version: string;
};

export type CheckOutPostVersionRetType = {
    status: "ok" | "unauthorized" | "not_found" | "error" | "db_error";
};

export default async function POST(req: Request, context: { params: Promise<Params> }) {
    const params = await context.params;
    const user = await getUser();
    if (!user) {
        return Response.json({ status: "unauthorized" });
    }
    const id = parseInt(params.id);
    const version = parseInt(params.version);
    if (!id || !version) {
        return Response.json({
            status: "error"
        });
    }
    // 如果这个文章不是该用户的
    if (await checkPermissionsForPost(user.id, id) === false) {
        return Response.json({
            status: "unauthorized"
        });
    }

    const nowVersions = await prisma.post_Version.findMany({
        where: {
            postId: id,
            published: true
        }
    });
    if (nowVersions.length > 1) {
        return Response.json({ status: "db_error" });
    }

    try {
        if (nowVersions.length == 0 || nowVersions[0].version != version) {
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
        } else {
            await prisma.post_Version.update({
                where: {
                    postId_version: {
                        postId: id,
                        version: version
                    }
                },
                data: {
                    published: false
                }
            });
        }
    } catch {
        return Response.json({
            status: "db_error"
        });
    }
    return Response.json({
        status: "ok"
    });
}

