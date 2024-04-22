import { getPostById, getPostVersionByPostIdAndVersion, getUserByName, prisma } from "@/data/db";
import { auth } from "@/lib/auth/auth";

type Params = {
    id: string;
    version: string;
};

export async function GET(req: Request, context: { params: Params }) {
    const session = await auth();
    const userName = session?.user?.name;
    if (!session || !userName) {
        return Response.json({
            error: "Unauthorized"
        });
    }
    const id = parseInt(context.params.id);
    const version = parseInt(context.params.version);
    if (!id || !version) {
        return Response.json(null);
    }

    const post_version = await prisma.post_Version.findFirst({
        where: {
            version: version,
            Post: {
                id: id,
                User: {
                    name: userName
                }
            }
        }
    });
    return Response.json(post_version);
}
