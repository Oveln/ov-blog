// post一个版本表示切换到这个版本
import { auth } from "@/lib/auth/auth";
import { checkPermissionsForPost, prisma } from "@/lib/db";

type Params = {
    id: string;
    version: string;
};

export type CheckOutPostVersionRetType = {
    status: "ok" | "unauthorized" | "not_found" | "error" | "db_error";
};

export default async function POST(req: Request, context: { params: Promise<Params> }) {
    const params = await context.params;
    const user = (await auth())?.user;
    if (!user?.id) {
        return Response.json({ status: "unauthorized" });
    }
    const id = parseInt(params.id);
    const version = parseInt(params.version);
    if (!id || !version) {
        return Response.json({
            status: "error",
        });
    }
    // 如果这个文章不是该用户的
    if ((await checkPermissionsForPost(user.id, id)) === false) {
        return Response.json({
            status: "unauthorized",
        });
    }

    try {
        await prisma.post.update({
            where: {
                id,
            },
            data: {
                current_version: version,
            },
        });
    } catch {
        return Response.json({
            status: "db_error",
        });
    }
    return Response.json({
        status: "ok",
    });
}
