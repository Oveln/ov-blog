import { prisma } from "@/data/db";
import { getUser } from "@/data/user";

export type NewPostType = {
    title: string;
    description: string | null;
    content: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const idNewPostType = (data: any): data is NewPostType => {
    return (
        typeof data.title === "string" &&
        (typeof data.description === "string" || data.description === null) &&
        typeof data.content === "string"
    );
};

// 若ok，返回新建的文章的id
export type NewPostRetType = {
    status: "ok" | "error" | "busy" | "unauthorized" | "db_error" | "data_error";
    post_id: number | null;
};

const debounceMap = new Map<string, NodeJS.Timeout>();

const newPost = async (data: NewPostType, userName: string): Promise<NewPostRetType> => {
    let post;
    try {
        post = await prisma.post_Version.create({
            data: {
                title: data.title,
                description: data.description,
                content: data.content,
                published: true,
                Post: {
                    create: {
                        User: {
                            connect: {
                                name: userName
                            }
                        }
                    }
                }
            }
        });
    } catch {
        return { status: "db_error", post_id: null };
    }
    return {
        status: "ok",
        post_id: post.postId
    };
};

async function handler(req: Request): Promise<NewPostRetType> {
    const user = await getUser();
    if (!user) {
        return { status: "unauthorized", post_id: null };
    }
    //对每个用户分开防抖，间隔5秒
    const delay = 5;
    if (debounceMap.has(user.name)) {
        clearTimeout(debounceMap.get(user.name));
        debounceMap.set(
            user.name,
            setTimeout(() => {
                debounceMap.delete(user.name);
            }, delay)
        );
        return { status: "busy", post_id: null };
    } else {
        debounceMap.set(
            user.name,
            setTimeout(() => {
                debounceMap.delete(user.name);
            }, delay)
        );
    }

    const data = await req.json();
    //如果提交的数据不包含 NewPostType 的内容，则返回error
    if (!idNewPostType(data)) {
        return { status: "data_error", post_id: null };
    }
    return await newPost(data, user.name);
}
export const POST = async (req: Request) => {
    return Response.json(await handler(req));
};
