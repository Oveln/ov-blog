import { prisma } from "@/data/db";
import { auth } from "@/lib/auth/auth";

type Params = {
    id: string;
    version: string;
};

export type DeletePostVersionRetType = {
    status: "ok" | "unauthorized" | "not_found" | "error" | "db_error";
};
// 对不起，这是答辩山
export default async function DELETE(req: Request, context: { params: Params }) {
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
        return Response.json(null);
    }
    // 检测是否是本用户的Post
    if (
        (await prisma.post.count({
            where: {
                id: id,
                User: {
                    name: userName
                }
            }
        })) == 0
    ) {
        return Response.json({
            status: "unauthorized"
        });
    }

    //如果仅有这个版本，则删除post
    if (
        (await prisma.post_Version.count({
            where: {
                postId: id,
                version: {
                    not: version
                }
            }
        })) == 0
    ) {
        await prisma.post.delete({
            where: {
                id: id
            }
        });
        console.log(`delete post ${id}`);
        return Response.json({ status: "ok" });
    } else {
        // 如果删除版本正在发布，则删除时将发布权交给最新版本
        if (
            (await prisma.post_Version.count({
                where: {
                    postId: id,
                    version: version,
                    published: true
                }
            })) == 1
        ) {
            // 找到最新版本
            const latest_version = (
                await prisma.post_Version.findFirst({
                    where: {
                        postId: id,
                        version: {
                            not: version
                        }
                    },
                    orderBy: {
                        version: "desc"
                    }
                })
            )?.version;
            if (latest_version === undefined) {
                return Response.json({ status: "db_error" });
            }
            try {
                await prisma.$transaction([
                    prisma.post_Version.delete({
                        where: {
                            postId_version: {
                                postId: id,
                                version: version
                            }
                        }
                    }),
                    prisma.post_Version.update({
                        where: {
                            postId_version: {
                                postId: id,
                                version: latest_version
                            }
                        },
                        data: {
                            published: true
                        }
                    })
                ]);
            } catch (e) {
                return Response.json({ status: "db_error" });
            }
        } else {
            try {
                await prisma.post_Version.delete({
                    where: {
                        postId_version: {
                            postId: id,
                            version: version
                        },
                        Post: {
                            User: {
                                name: userName
                            }
                        }
                    }
                });
            } catch (e) {
                return Response.json({
                    status: "not_found"
                });
            }
        }
    }
    console.log(`delete ${id} ${version}`);
    return Response.json({ status: "ok" });
}
