import { prisma } from "@/lib/db";
import { getUser } from "@/data/user";

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
} | null;

export default async function GET(req: Request, context: { params: Promise<Params> }) {
    const params = await context.params;
    const user = await getUser();
    if (!user) {
        return Response.json(null);
    }
    const id = parseInt(params.id);
    const version = parseInt(params.version);
    if (!id || !version) {
        return Response.json(null);
    }

    const post_version: GetPostVersionType = await prisma.post_Version.findFirst({
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
            Post: {
                select: {
                    create_time: true
                }
            }
        }
    });
    return Response.json(post_version);
}
