import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export type PostCardInfo = {
    id: number;
    title: string;
    description: string | null;
    update_time: Date;
    published: boolean;
    Post: {
        id: number;
        create_time: Date;
        User: {
            name: string;
        };
    };
};
export const getAllPostCardInfo = async () => {
    const ret: PostCardInfo[] = await prisma.post_Version.findMany({
        where: {
            published: true
        },
        select: {
            id: true,
            title: true,
            description: true,
            update_time: true,
            published: true,
            Post: {
                select: {
                    id: true,
                    create_time: true,
                    User: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        }
    });
    return ret;
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
};

export const getPostById = async (id: number) => {
    return await prisma.post.findUnique({
        where: {
            id: id
        },
        select: {
            create_time: true,
            postVersions: {
                where: {
                    published: true
                }
            }
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
