import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";

export type PostTagsResponse = {
    status: "ok" | "unauthorized" | "error" | "not_found";
    tags?: string[];
};

// 获取文章版本的标签
export async function GET(
    req: Request,
    context: { params: Promise<{ id: string; version: string }> }
): Promise<Response> {
    const user = (await auth())?.user;
    if (!user?.id) {
        const response: PostTagsResponse = { status: "unauthorized" };
        return Response.json(response);
    }
    const params = await context.params;
    const postId = parseInt(params.id);
    const version = parseInt(params.version);

    if (isNaN(postId) || isNaN(version)) {
        const response: PostTagsResponse = { status: "error" };
        return Response.json(response);
    }

    try {
        // 检查文章是否存在
        const postVersion = await prisma.post_Version.findUnique({
            where: {
                postId_version: {
                    postId,
                    version,
                },
            },
        });

        if (!postVersion) {
            const response: PostTagsResponse = { status: "not_found" };
            return Response.json(response);
        }

        const tags = await prisma.tagOnPostVersion.findMany({
            where: {
                post_VersionPostId: postId,
                post_VersionVersion: version,
            },
            select: {
                tagName: true,
            },
        });

        const response: PostTagsResponse = {
            status: "ok",
            tags: tags.map((t) => t.tagName),
        };
        return Response.json(response);
    } catch (error) {
        console.error("Error fetching post tags:", error);
        const response: PostTagsResponse = { status: "error" };
        return Response.json(response);
    }
}
