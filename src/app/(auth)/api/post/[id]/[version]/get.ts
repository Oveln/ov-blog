import { prisma } from "@/data/db";
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
    published: boolean;
} | null;

export default async function GET(req: Request, context: { params: Params }) {
    const user = await getUser();
    if (!user) {
        return Response.json(null);
    }
    const id = parseInt(context.params.id);
    const version = parseInt(context.params.version);
    if (!id || !version) {
        return Response.json(null);
    }

    const post_version: GetPostVersionType = await prisma.post_Version.findFirst({
        where: {
            version: version,
            Post: {
                id: id,
                User: {
                    name: user.name
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
            published: true,
            Post: {
                select: {
                    create_time: true
                }
            }
        }
    });
    return Response.json(post_version);
}
