import { PrismaClient, Role } from "@prisma/client";
import { User } from "next-auth";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL
            }
        }
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const getAllPostCardInfo = async () => {
    if (process.env.BUILDTIME == "true") {
        return [];
    }
    return await prisma.post.findMany({
        where: {
            // current_version不为null
            current_version: {
                not: null
            }
        },
        select: {
            id: true,
            create_time: true,
            User: {
                select: {
                    name: true
                }
            },
            currentVersion: {
                select: {
                    title: true,
                    description: true,
                    update_time: true,
                    tags: {
                        select: {
                            tagName: true
                        }
                    }
                }
            }
        },
        orderBy: {
            create_time: "desc"
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
            currentVersion: true
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

export const getUserById = async (id: string): Promise<User | null> => {
    const user = await prisma.user.findUnique({
        where: {
            id: id
        }
    });
    return user;
};

export const setUserRole = async (id: string, role: Role) => {
    await prisma.user.update({
        where: {
            id: id
        },
        data: {
            role: role
        }
    });
};

export const getUserCount = async () => {
    return await prisma.user.count();
};

// 检测用户对Post的权限
export const checkPermissionsForPost = async (userId: string, postId: number) => {
    // 如果是ADMIN
    const user = await getUserById(userId);
    if (!user) {
        return false;
    }
    if (user.role === Role.ADMIN) {
        return true;
    }

    // 如果是Post的作者
    const post = await prisma.post.findUnique({
        where: {
            id: postId
        }
    });
    if (!post) {
        return false;
    } else {
        return post.userId === userId;
    }
};
