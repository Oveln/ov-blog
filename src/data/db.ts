import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllPostCardInfo = async (onlyPublished: boolean) => {
    if (onlyPublished)
        return await prisma.post.findMany(
            // published
            // 只需要文章标题和描述
            {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    create_time: true
                },
                where: {
                    published: true
                }
            }
        );
    return await prisma.post.findMany(
        // published
        // 只需要文章标题和描述
        {
            select: {
                id: true,
                title: true,
                description: true,
                create_time: true
            }
        }
    );
};

export const getPostById = async (id: number) => {
    return await prisma.post.findUnique({
        where: {
            id: id
        }
    });
};
