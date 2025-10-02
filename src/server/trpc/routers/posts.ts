import { z } from "zod";
import { publicProcedure, authedProcedure, router } from "../trpc";
import { prisma } from "@/lib/db";
import { Role, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

// ==================== 输入验证模式 ====================

/**
 * 创建文章的输入模式
 * @property {string} title - 文章标题
 * @property {string | null} description - 文章描述（可为空）
 * @property {string} content - 文章内容（Markdown 格式）
 * @property {string[]} tags - 标签名称数组
 */
const createPostInput = z.object({
    title: z.string(),
    description: z.string().nullable(),
    content: z.string(),
    tags: z.array(z.string()),
});

/**
 * 创建文章版本的输入模式
 * @property {string} title - 文章标题
 * @property {string | null} description - 文章描述（可为空）
 * @property {string} content - 文章内容（Markdown 格式）
 * @property {number} postId - 文章ID
 * @property {boolean} publish - 是否立即发布该版本
 * @property {string[]} [tags] - 标签名称数组（可选）
 */
const createVersionInput = z.object({
    title: z.string(),
    description: z.string().nullable(),
    content: z.string(),
    postId: z.number(),
    publish: z.boolean(),
    tags: z.array(z.string()).optional(),
});

/**
 * 文章版本查询输入模式
 * @property {number} id - 文章ID
 * @property {number} version - 版本号
 */
const postVersionInput = z.object({
    id: z.number(),
    version: z.number(),
});

// ==================== 辅助函数 ====================

/**
 * 检查用户是否有权限操作文章
 * @param postId - 文章ID
 * @param userId - 用户ID
 * @throws {TRPCError} 如果文章不存在或用户无权限
 */
async function verifyPostOwnership(postId: number, userId: string) {
    const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { userId: true },
    });

    if (!post) {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: "文章不存在",
        });
    }

    if (post.userId !== userId) {
        throw new TRPCError({
            code: "FORBIDDEN",
            message: "无权操作此文章",
        });
    }

    return post;
}

/**
 * 批量创建或更新标签
 * @param tags - 标签名称数组
 * @param postId - 文章ID
 * @param version - 版本号
 * @param tx - Prisma 事务客户端
 */
async function upsertTagsForPostVersion(
    tags: string[],
    postId: number,
    version: number,
    tx: Prisma.TransactionClient
) {
    if (tags.length === 0) return;

    // 批量创建标签（忽略重复）
    await tx.tag.createMany({
        data: tags.map((tag) => ({ name: tag })),
        skipDuplicates: true,
    });

    // 创建文章版本与标签的关联
    await tx.tagOnPostVersion.createMany({
        data: tags.map((tag) => ({
            post_VersionPostId: postId,
            post_VersionVersion: version,
            tagName: tag,
        })),
    });
}

// ==================== 路由定义 ====================

export const postsRouter = router({
    /**
     * 获取所有文章卡片信息（公开访问）
     * 用于博客列表页面展示
     */
    getAllPostCardInfo: publicProcedure.query(async () => {
        return await prisma.post.findMany({
            where: {
                // current_version不为null
                current_version: {
                    not: null,
                },
            },
            select: {
                id: true,
                create_time: true,
                User: {
                    select: {
                        name: true,
                    },
                },
                currentVersion: {
                    select: {
                        title: true,
                        description: true,
                        update_time: true,
                        tags: {
                            select: {
                                tagName: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                create_time: "desc",
            },
        });
    }),

    /**
     * 根据ID获取文章详情（公开访问）
     * 用于博客详情页面展示
     */
    getPostById: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
            const post = await prisma.post.findUnique({
                where: {
                    id: input.id,
                },
                select: {
                    create_time: true,
                    currentVersion: {
                        select: {
                            title: true,
                            description: true,
                            content: true,
                            update_time: true,
                            tags: true,
                        },
                    },
                },
            });

            if (!post) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "文章不存在",
                });
            }

            return post;
        }),

    /**
     * 创建新文章
     * - 需要认证
     * - 访客用户无权限
     * - 自动创建第一个版本
     */
    create: authedProcedure.input(createPostInput).mutation(async ({ input, ctx }) => {
        const { user } = ctx;

        // 检查用户角色权限
        if (user.role === Role.GUEST) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "访客用户无权创建文章",
            });
        }

        try {
            const postId = await prisma.$transaction(async (tx) => {
                // 创建文章版本和文章主体
                const postVersion = await tx.post_Version.create({
                    data: {
                        title: input.title,
                        description: input.description,
                        content: input.content,
                        Post: {
                            create: {
                                User: {
                                    connect: { id: user.id },
                                },
                            },
                        },
                    },
                });

                // 关联标签
                await upsertTagsForPostVersion(
                    input.tags,
                    postVersion.postId,
                    postVersion.version,
                    tx
                );

                // 设置当前版本为刚创建的版本
                await tx.post.update({
                    where: { id: postVersion.postId },
                    data: { current_version: postVersion.version },
                });

                return postVersion.postId;
            });

            return { post_id: postId };
        } catch (error) {
            console.error("创建文章失败:", error);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "创建文章失败",
                cause: error,
            });
        }
    }),

    /**
     * 为已存在的文章创建新版本
     * - 需要认证
     * - 只有文章作者可以创建新版本
     * - 可选择是否立即发布
     */
    createVersion: authedProcedure
        .input(createVersionInput)
        .mutation(async ({ input, ctx }) => {
            const { user } = ctx;

            // 验证文章所有权
            await verifyPostOwnership(input.postId, user.id);

            // 获取当前最新版本号
            const latestVersion = await prisma.post_Version.findFirst({
                where: { postId: input.postId },
                orderBy: { version: "desc" },
                select: { version: true },
            });

            if (!latestVersion) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "文章不存在",
                });
            }

            try {
                await prisma.$transaction(async (tx) => {
                    const nextVersion = latestVersion.version + 1;

                    // 创建新版本
                    const newVersion = await tx.post_Version.create({
                        data: {
                            title: input.title,
                            description: input.description,
                            content: input.content,
                            version: nextVersion,
                            postId: input.postId,
                        },
                    });

                    // 更新标签（如果提供）
                    if (input.tags) {
                        await upsertTagsForPostVersion(
                            input.tags,
                            input.postId,
                            newVersion.version,
                            tx
                        );
                    }

                    // 如果需要发布，更新当前版本
                    if (input.publish) {
                        await tx.post.update({
                            where: { id: input.postId },
                            data: { current_version: newVersion.version },
                        });
                    }
                });
            } catch (error) {
                console.error("创建文章版本失败:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "创建文章版本失败",
                    cause: error,
                });
            }
        }),

    /**
     * 获取文章的指定版本
     * - 需要认证
     * - 只能查看自己的文章版本
     */
    getVersion: authedProcedure.input(postVersionInput).query(async ({ input, ctx }) => {
        const { user } = ctx;

        const postVersion = await prisma.post_Version.findFirst({
            where: {
                version: input.version,
                Post: {
                    id: input.id,
                    User: { id: user.id },
                },
            },
            select: {
                title: true,
                description: true,
                content: true,
                version: true,
                update_time: true,
                postId: true,
                tags: {
                    select: { tagName: true },
                },
                Post: {
                    select: { create_time: true },
                },
            },
        });

        if (!postVersion) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "文章版本不存在",
            });
        }

        return postVersion;
    }),

    /**
     * 删除文章的指定版本
     * - 需要认证
     * - 只有文章作者可以删除
     * - 如果是最后一个版本，删除整个文章
     * - 如果删除的是当前版本，自动切换到最新版本
     */
    deleteVersion: authedProcedure
        .input(postVersionInput)
        .mutation(async ({ input, ctx }) => {
            const { user } = ctx;

            // 验证文章所有权
            await verifyPostOwnership(input.id, user.id);

            // 检查是否是最后一个版本
            const latestOtherVersion = await prisma.post_Version.findFirst({
                where: {
                    postId: input.id,
                    version: { not: input.version },
                },
                orderBy: { version: "desc" },
            });

            try {
                // 如果是最后一个版本，删除整个文章
                if (!latestOtherVersion) {
                    await prisma.post.delete({
                        where: { id: input.id },
                    });
                    return;
                }

                // 检查是否删除的是当前发布版本
                const currentPost = await prisma.post.findUnique({
                    where: { id: input.id },
                    select: { current_version: true },
                });

                const isDeletingCurrentVersion =
                    currentPost?.current_version === input.version;

                if (isDeletingCurrentVersion) {
                    // 删除版本并更新当前版本
                    await prisma.$transaction([
                        prisma.post_Version.delete({
                            where: {
                                postId_version: {
                                    postId: input.id,
                                    version: input.version,
                                },
                            },
                        }),
                        prisma.post.update({
                            where: { id: input.id },
                            data: { current_version: latestOtherVersion.version },
                        }),
                    ]);
                } else {
                    // 直接删除版本
                    await prisma.post_Version.delete({
                        where: {
                            postId_version: {
                                postId: input.id,
                                version: input.version,
                            },
                        },
                    });
                }
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                console.error("删除文章版本失败:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "删除文章版本失败",
                    cause: error,
                });
            }
        }),

    /**
     * 切换文章到指定版本（发布指定版本）
     * - 需要认证
     * - 只有文章作者可以切换版本
     */
    checkoutVersion: authedProcedure
        .input(postVersionInput)
        .mutation(async ({ input, ctx }) => {
            const { user } = ctx;

            // 验证文章所有权
            await verifyPostOwnership(input.id, user.id);

            try {
                await prisma.post.update({
                    where: { id: input.id },
                    data: { current_version: input.version },
                });
            } catch (error) {
                console.error("切换文章版本失败:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "切换文章版本失败",
                    cause: error,
                });
            }
        }),

    /**
     * 获取文章版本的所有标签
     * - 需要认证
     */
    /**
     * 获取文章版本的所有标签
     * - 需要认证
     */
    getVersionTags: authedProcedure.input(postVersionInput).query(async ({ input }) => {
        try {
            // 检查文章版本是否存在
            const postVersion = await prisma.post_Version.findUnique({
                where: {
                    postId_version: {
                        postId: input.id,
                        version: input.version,
                    },
                },
            });

            if (!postVersion) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "文章版本不存在",
                });
            }

            // 获取标签列表
            const tags = await prisma.tagOnPostVersion.findMany({
                where: {
                    post_VersionPostId: input.id,
                    post_VersionVersion: input.version,
                },
                select: { tagName: true },
            });

            return tags.map((tag) => tag.tagName);
        } catch (error) {
            if (error instanceof TRPCError) {
                throw error;
            }
            console.error("获取文章标签失败:", error);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "获取文章标签失败",
                cause: error,
            });
        }
    }),
});
