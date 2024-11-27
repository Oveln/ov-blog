import { auth } from "@/lib/auth/auth";
import { checkPermissionsForPost, prisma } from "@/lib/db";

export type NewPostVersionType = {
    title: string;
    description: string | null;
    content: string;
    postId: number;
    publish: boolean;
    tags?: string[];
};

export type NewPostVersionRetType = {
    status: "ok" | "error" | "busy" | "unauthorized" | "db_error" | "data_error";
};

const debounceMap = new Map<string, NodeJS.Timeout>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isNewPostVersionType = (data: any): data is NewPostVersionType => {
    const basicCheck = typeof data.title === "string" &&
        (typeof data.description === "string" || data.description === null) &&
        typeof data.content === "string";

    if (data.tags !== undefined) {
        return basicCheck &&
            Array.isArray(data.tags) &&
            data.tags.every((tag: string) => typeof tag === "string");
    }

    return basicCheck;
};

const newVersion = async (
    data: NewPostVersionType,
    userId: string
): Promise<NewPostVersionRetType> => {
    //检查用户是否有权限
    if ((await checkPermissionsForPost(userId, data.postId)) == false) {
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
        postId: data.postId
    };

    try {
        // 使用事务来确保tags和版本同时更新
        await prisma.$transaction(async (tx) => {
            // 创建新版本
            const new_version = await tx.post_Version.create({
                data: insertVersion
            });

            // 如果提供了tags，更新post的tags
            if (data.tags) {
                // 对每个标签进行处理
                for (const tagName of data.tags) {
                    // 检查标签是否存在，如果不存在则创建
                    const tag = await tx.tag.upsert({
                        where: { name: tagName },
                        update: {},
                        create: { name: tagName }
                    });

                    // 创建新的tags关联
                    await tx.tagOnPostVersion.create({
                        data: {
                            post_VersionPostId: data.postId,
                            post_VersionVersion: new_version.version,
                            tagName: tag.name
                        }
                    });
                }
            }

            // 如果需要发布，更新当前版本
            if (data.publish) {
                await tx.post.update({
                    where: {
                        id: data.postId
                    },
                    data: {
                        current_version: new_version.version
                    }
                });
            }
        });
    } catch (e) {
        console.log(e);
        return { status: "db_error" };
    }

    return {
        status: "ok"
    };
};

export const POST = async (req: Request) => {
    const user = (await auth())?.user;

    if (!user?.id) {
        return Response.json({ status: "unauthorized" });
    }
    //对每个用户分开防抖，间隔5秒
    const delay = 5;
    if (debounceMap.has(user.id)) {
        clearTimeout(debounceMap.get(user.id));
        debounceMap.set(
            user.id,
            setTimeout(() => {
                debounceMap.delete(user.id!);
            }, delay)
        );
        return Response.json({ status: "busy" });
    } else {
        debounceMap.set(
            user.id,
            setTimeout(() => {
                debounceMap.delete(user.id!);
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
