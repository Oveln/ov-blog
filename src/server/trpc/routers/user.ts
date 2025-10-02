import { z } from "zod";
import { router, authedProcedure, adminProcedure } from "../trpc";
import { prisma } from "@/lib/db";
import { TRPCError } from "@trpc/server";
import { Role } from "@prisma/client";

// ==================== 类型定义 ====================

/**
 * 用户ID输入模式
 * @property {string} userId - 用户的唯一标识符
 */
const userIdInput = z.object({
    userId: z.string(),
});

// ==================== 查询字段定义 ====================

/** 文章版本的基础字段 */
const postVersionFields = {
    title: true,
    update_time: true,
    version: true,
} as const;

/** 文章列表的查询字段 */
const postListSelect = {
    id: true,
    create_time: true,
    current_version: true,
    currentVersion: {
        select: {
            ...postVersionFields,
            tags: {
                select: { tagName: true },
            },
        },
    },
    postVersions: {
        select: postVersionFields,
        orderBy: { update_time: "desc" as const },
    },
} as const;

// ==================== 辅助函数 ====================

/**
 * 检查用户是否有权限查看指定用户的文章
 * @param currentUserId - 当前登录用户ID
 * @param targetUserId - 目标用户ID
 * @param userRole - 用户角色
 * @throws {TRPCError} 如果用户无权限
 */
function verifyUserPostsAccess(
    currentUserId: string,
    targetUserId: string,
    userRole: Role
) {
    const isOwnPosts = currentUserId === targetUserId;
    const isAdmin = userRole === "ADMIN";

    if (!isOwnPosts && !isAdmin) {
        throw new TRPCError({
            code: "FORBIDDEN",
            message: "无权查看此用户的文章",
        });
    }
}

/**
 * 处理数据库查询错误
 * @param error - 错误对象
 * @param operation - 操作描述
 * @throws {TRPCError}
 */
function handleDatabaseError(error: unknown, operation: string): never {
    console.error(`${operation}失败:`, error);
    throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `${operation}失败`,
        cause: error,
    });
}

// ==================== 路由定义 ====================

export const userRouter = router({
    /**
     * 获取当前登录用户的基本信息
     * - 需要认证
     */
    getCurrentUser: authedProcedure.query(async ({ ctx }) => {
        const { user } = ctx;

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
        };
    }),

    /**
     * 获取当前用户的用户名
     * - 需要认证
     * - 优先返回 name，其次 email，最后为默认值
     */
    getUsername: authedProcedure.query(async ({ ctx }) => {
        const { user } = ctx;

        return {
            username: user.name || user.email || "Unknown User",
        };
    }),

    /**
     * 获取所有用户的所有文章
     * - 仅管理员可用
     * - 包含作者信息
     */
    getAllPosts: adminProcedure.query(async () => {
        try {
            const posts = await prisma.post.findMany({
                select: {
                    ...postListSelect,
                    User: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            });

            return posts;
        } catch (error) {
            handleDatabaseError(error, "获取文章列表");
        }
    }),

    /**
     * 获取指定用户的所有文章
     * - 需要认证
     * - 只能查看自己的文章，除非是管理员
     */
    getUserPosts: authedProcedure.input(userIdInput).query(async ({ input, ctx }) => {
        const { user } = ctx;

        // 验证权限
        verifyUserPostsAccess(user.id, input.userId, user.role);

        try {
            const posts = await prisma.post.findMany({
                where: {
                    User: { id: input.userId },
                },
                select: postListSelect,
            });

            return posts;
        } catch (error) {
            handleDatabaseError(error, "获取用户文章列表");
        }
    }),
});
