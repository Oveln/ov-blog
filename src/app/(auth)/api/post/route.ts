import { prisma } from "@/data/db";
import { auth } from "@/lib/auth/auth";

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

export type NewPostRetType = {
    status: "ok" | "error" | "busy" | "unauthorized" | "db_error" | "data_error";
};

const debounceMap = new Map<string, NodeJS.Timeout>();

const newPost = async (data: NewPostType, userName: string): Promise<NewPostRetType> => {
    const user = await prisma.user.findUnique({
        where: {
            name: userName
        }
    });
    if ((user?.role != "USER" && user?.role != "ADMIN") || !user) return { status: "unauthorized" };
    try {
        await prisma.post_Version.create({
            data: {
                title: data.title,
                description: data.description,
                content: data.content,
                published: true,
                Post: {
                    create: {
                        userId: user.id
                    }
                }
            }
        });
    } catch {
        return { status: "db_error" };
    }
    return {
        status: "ok"
    };
};
export const POST = async (req: Request) => {
    const session = await auth();
    const userName = session?.user?.name;
    if (!userName) return Response.json({ status: "unauthorized" });
    //对每个用户分开防抖，间隔5秒
    const delay = 5;
    if (debounceMap.has(userName)) {
        clearTimeout(debounceMap.get(userName));
        debounceMap.set(
            userName,
            setTimeout(() => {
                debounceMap.delete(userName);
            }, delay)
        );
        return Response.json({ status: "busy" });
    } else {
        debounceMap.set(
            userName,
            setTimeout(() => {
                debounceMap.delete(userName);
            }, delay)
        );
    }

    const data = await req.json();
    //如果提交的数据不包含 NewPostType 的内容，则返回error
    if (!idNewPostType(data)) {
        return Response.json({ status: "data_error" });
    }
    return Response.json(await newPost(data, userName));
};
