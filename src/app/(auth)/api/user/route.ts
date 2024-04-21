import { getPostByUserName, getPostVersionByPostIdAndVersion } from "@/data/db";
import { auth } from "@/lib/auth/auth";

type Params = {
    userName: string;
};

export type UserPostRetType = {
    id: number;
    title: string;
    create_time: Date;
    update_time: Date;
    published_version: number;
};

export const GET = async (req: Request, context: { params: Params }) => {
    const session = await auth();
    const userName = session?.user?.name;
    if (!session || !userName) {
        return Response.json({
            error: "Unauthorized"
        });
    }
    const posts = await getPostByUserName(userName);
    const retPosts: UserPostRetType[] = await Promise.all(
        posts.map(async (post) => {
            const newest_version = await getPostVersionByPostIdAndVersion(
                post.id,
                post.published_version
            );
            if (!newest_version) {
                return {
                    id: post.id,
                    title: "",
                    create_time: new Date(),
                    update_time: new Date(),
                    published_version: post.published_version
                };
            }
            return {
                id: post.id,
                title: newest_version.title,
                create_time: newest_version.create_time,
                update_time: newest_version.update_time,
                published_version: post.published_version
            };
        })
    );
    return Response.json(retPosts);
};
