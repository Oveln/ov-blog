import { prisma } from "@/lib/db";
import { getUser } from "@/data/user";

export type NewPostVersionType = {
    title: string;
    description: string | null;
    content: string;
    postId: number;
    published: boolean;
};

export type NewPostVersionRetType = {
    status: "ok" | "error" | "busy" | "unauthorized" | "db_error" | "data_error";
};

const debounceMap = new Map<string, NodeJS.Timeout>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isNewPostVersionType = (data: any): data is NewPostVersionType => {
    return (
        typeof data.title === "string" &&
        (typeof data.description === "string" || data.description === null) &&
        typeof data.content === "string" &&
        typeof data.postId === "number" &&
        typeof data.published === "boolean"
    );
};

const newVersion = async (
    data: NewPostVersionType,
    userName: string
): Promise<NewPostVersionRetType> => {
    //检查用户是否有权限
    if (
        !(await prisma.post.findUnique({
            where: {
                id: data.postId,
                User: {
                    name: userName
                }
            }
        }))
    ) {
        return { status: "unauthorized" };
    }

    const newestVersion = await prisma.post_Version.findFirst({
        where: {
            postId: data.postId
        },
        orderBy: {
            version: "desc"
        }
    });
    if (!newestVersion) {
        return { status: "db_error" };
    }
    const insertVersion = {
        title: data.title,
        description: data.description,
        content: data.content,
        version: newestVersion.version + 1,
        postId: data.postId,
        published: data.published
    };
    try {
        if (insertVersion.published) {
            await prisma.$transaction([
                prisma.post.update({
                    where: {
                        id: data.postId
                    },
                    data: {
                        postVersions: {
                            updateMany: {
                                where: {},
                                data: {
                                    published: false
                                }
                            }
                        }
                    }
                }),
                prisma.post_Version.create({
                    data: insertVersion
                })
            ]);
        } else {
            await prisma.post_Version.create({
                data: insertVersion
            });
        }
    } catch {
        return { status: "db_error" };
    }
    return {
        status: "ok"
    };
};

export const POST = async (req: Request) => {
    const user = await getUser();
    if (!user) {
        return Response.json({ status: "unauthorized" });
    }
    //对每个用户分开防抖，间隔5秒
    const delay = 5;
    if (debounceMap.has(user.id)) {
        clearTimeout(debounceMap.get(user.id));
        debounceMap.set(
            user.id,
            setTimeout(() => {
                debounceMap.delete(user.id);
            }, delay)
        );
        return Response.json({ status: "busy" });
    } else {
        debounceMap.set(
            user.id,
            setTimeout(() => {
                debounceMap.delete(user.id);
            }, delay)
        );
    }

    const data = await req.json();
    //如果提交的数据不包含 NewPostVersionType 的内容，则返回error
    if (!isNewPostVersionType(data)) {
        return Response.json({ status: "data_error" });
    }
    return Response.json(await newVersion(data, user.id));
};
