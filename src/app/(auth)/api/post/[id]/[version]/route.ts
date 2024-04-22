import { prisma } from "@/data/db";
import { auth } from "@/lib/auth/auth";

type Params = {
    id: string;
    version: string;
};

export type GetPostVersionType = {
    content: string;
    title: string;
    id: number;
    description: string | null;
    version: number;
    create_time: Date;
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
            id: true,
            title: true,
            description: true,
            content: true,
            version: true,
            create_time: true,
            update_time: true,
            postId: true,
            published: true
        }
    });
    return Response.json(post_version);
}
