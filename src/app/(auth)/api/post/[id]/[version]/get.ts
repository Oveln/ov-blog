import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";

type Params = {
    id: string;
    version: string;
};

export type GetPostVersionType = {
    content: string;
    title: string;
    description: string | null;
    version: number;
    update_time: Date;
    postId: number;
    tags: string[];
} | null;

export default async function GET(req: Request, context: { params: Promise<Params> }) {
    const params = await context.params;
    const user = (await auth())?.user;
    if (!user?.id) {
        return Response.json(null);
    }
    const id = parseInt(params.id);
    const version = parseInt(params.version);
    if (!id || !version) {
        return Response.json(null);
    }

    const post_version = await prisma.post_Version.findFirst({
        where: {
            version: version,
            Post: {
                id: id,
                User: {
                    id: user.id
                }
            }
        },
        select: {
            title: true,
            description: true,
            content: true,
            version: true,
            update_time: true,
            postId: true,
            tags: {
                select: {
                    tagName: true
                }
            },
            Post: {
                select: {
                    create_time: true
                }
            }
        }
    });

    const transformed_post_version: GetPostVersionType = post_version ? {
        ...post_version,
        tags: post_version.tags.map(tag => tag.tagName)
    } : null;

    return Response.json(transformed_post_version);
}
