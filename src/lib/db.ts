import { PrismaClient } from "@prisma/client";
import { Role, roleStringToEnum, User } from "../data/user";


const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export type PostCardInfo = {
    title: string;
    description: string | null;
    update_time: Date;
    published: boolean;
    Post: {
        id: number;
        create_time: Date;
        User: {
            name: string | null;
        };
    };
};
export const getAllPostCardInfo = async () => {
    const ret: PostCardInfo[] = await prisma.post_Version.findMany({
        where: {
            published: true
        },
        select: {
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
        },
        orderBy: {
            Post: {
                create_time: "desc"
            }
        }
    });
    return ret;
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

export const getUserById = async (id: string): Promise<User | null> => {
    const dbUser = await prisma.user.findUnique({
        where: {
            id: id
        }
    });
    if (dbUser === null) {
        return null;
    }
    const user: User = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: roleStringToEnum(dbUser.role)
    };
    return user;
};

export const setUserRole = async (id: string, role: string) => {
    await prisma.user.update({
        where: {
            id: id
        },
        data: {
            role: role
        }
    });
}

export const getUserCount = async () => {
    return await prisma.user.count();
}

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
}