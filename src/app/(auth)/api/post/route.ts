import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";

export type NewPostType = {
    title: string;
    description: string | null;
    content: string;
    tags: string[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const idNewPostType = (data: any): data is NewPostType => {
    return (
        typeof data.title === "string" &&
        (typeof data.description === "string" || data.description === null) &&
        typeof data.content === "string" &&
        Array.isArray(data.tags) &&
        data.tags.every((tag: string) => typeof tag === "string")
    );
};

// 若ok，返回新建的文章的id
export type NewPostRetType = {
    status: "ok" | "error" | "busy" | "unauthorized" | "db_error" | "data_error";
    post_id: number | null;
};

const debounceMap = new Map<string, NodeJS.Timeout>();

const newPost = async (data: NewPostType, userId: string): Promise<NewPostRetType> => {
    let post_id: number;
    try {
        post_id = await prisma.$transaction(async (tx) => {
            const post_version = await tx.post_Version.create({
                data: {
                    title: data.title,
                    description: data.description,
                    content: data.content,
                    Post: {
                        create: {
                            User: {
                                connect: {
                                    id: userId
                                }
                            }
                        }
                    }
                }
            });

            if (data.tags.length > 0) {
                await tx.tagOnPostVersion.createMany({
                    data: data.tags.map(tag => ({
                        post_VersionPostId: post_version.postId,
                        post_VersionVersion: post_version.version,
                        tagName: tag
                    }))
                });
            }

            await tx.post.update({
                where: {
                    id: post_version.postId
                },
                data: {
                    current_version: post_version.version
                }
            });
            return post_version.postId;
        });
    } catch {
        return { status: "db_error", post_id: null };
    }
    return {
        status: "ok",
        post_id: post_id
    };
};

async function handler(req: Request): Promise<NewPostRetType> {
    const user = (await auth())?.user;
    if (!user?.id) {
        return { status: "unauthorized", post_id: null };
    }
    if (user.role == Role.GUEST) {
        return { status: "unauthorized", post_id: null };
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
        return { status: "busy", post_id: null };
    } else {
        debounceMap.set(
            user.id,
            setTimeout(() => {
                debounceMap.delete(user.id!);
            }, delay)
        );
    }

    const data = await req.json();
    //如果提交的数据不包含 NewPostType 的内容，则返回error
    if (!idNewPostType(data)) {
        return { status: "data_error", post_id: null };
    }
    return await newPost(data, user.id);
}
export const POST = async (req: Request) => {
    return Response.json(await handler(req));
};
