import { PostCardInfo } from "@/app/(site)/blogs/PostCard";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllPostCardInfo = async () => {
    const posts = await prisma.post.findMany({});
    const retPostCardsInfo: PostCardInfo[] = await Promise.all(
        posts.map(async (post) => {
            return await getPostVersionByPostIdAndVersion(post.id, post.published_version);
        })
    )
    return retPostCardsInfo;
};

export const getUserById = async (id: number) => {
    return await prisma.user.findUnique({
        where: {
            id: id
        }
    });
};
export const getUserByName = async (name: string) => {
    return await prisma.user.findUnique({
        where: {
            name: name
        }
    });
};

export const getPostByUserName = async (userName: string) => {
    return await prisma.post.findMany({
        where: {
            User: {
                name: userName
            }
        }
    });
}

export const getPostById = async (id: number) => {
    return await prisma.post.findUnique({
        where: {
            id: id
        }
    });
};

export const getPostByIdAndUser = async (id: number, userName: string) => {
    return await prisma.post.findUnique({
        where: {
            id: id,
            User: {
                name: userName
            }
        }
    });
};


export const getPostVersionByPostIdAndVersion = async (post_id: number, version: number) => {
    return await prisma.post_Version.findFirst({
        where: {
            version: version,
            Post: {
                id: post_id
            }
        }
    });
};