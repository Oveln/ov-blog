import { auth } from "@/lib/auth/auth";
import { checkPermissionsForPost, prisma } from "@/lib/db";

type Params = {
    id: string;
    version: string;
};

export type DeletePostVersionRetType = {
    status: "ok" | "unauthorized" | "not_found" | "error" | "db_error";
};
// 对不起，这是答辩山
export default async function DELETE(req: Request, context: { params: Promise<Params> }) {
    const params = await context.params;
    const user = (await auth())?.user;
    if (!user?.id) {
        return Response.json({ status: "unauthorized" });
    }
    const id = parseInt(params.id);
    const version = parseInt(params.version);
    if (!id || !version) {
        return Response.json(null);
    }
    // 检测是否是本用户的Post
    if ((await checkPermissionsForPost(user.id, id)) === false) {
        return Response.json({
            status: "unauthorized",
        });
    }

    //如果仅有这个版本，则删除post
    if (
        (await prisma.post_Version.count({
            where: {
                postId: id,
                version: {
                    not: version,
                },
            },
        })) == 0
    ) {
        await prisma.post.delete({
            where: {
                id,
            },
        });
    } else {
        // 如果删除版本正在发布，则删除时将发布权交给最新版本
        if (
            (await prisma.post.findUnique({ where: { id } }))?.current_version === version
        ) {
            // 找到最新版本
            const latest_version = (
                await prisma.post_Version.findFirst({
                    where: {
                        postId: id,
                        version: {
                            not: version,
                        },
                    },
                    orderBy: {
                        version: "desc",
                    },
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
                                version,
                            },
                        },
                    }),
                    prisma.post.update({
                        where: {
                            id,
                        },
                        data: {
                            current_version: latest_version,
                        },
                    }),
                ]);
            } catch {
                return Response.json({ status: "db_error" });
            }
        } else {
            try {
                await prisma.post_Version.delete({
                    where: {
                        postId_version: {
                            postId: id,
                            version,
                        },
                        Post: {
                            User: {
                                id: user.id,
                            },
                        },
                    },
                });
            } catch {
                return Response.json({
                    status: "not_found",
                });
            }
        }
    }
    return Response.json({ status: "ok" });
}
