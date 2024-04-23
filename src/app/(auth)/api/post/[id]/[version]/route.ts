import { prisma } from "@/data/db";
import { auth } from "@/lib/auth/auth";

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

export async function GET(req: Request, context: { params: Params }) {
    const session = await auth();
    const userName = session?.user?.name;
    if (!session || !userName) {
        return Response.json({
            status: "unauthorized"
        });
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
                    name: userName
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
                    create_time: true,
                }
            }
        }
    });
    return Response.json(post_version);
}
