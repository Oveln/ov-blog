import { z } from "zod";
import { publicProcedure, adminProcedure, router } from "../trpc";
import { prisma } from "@/lib/db";
import { TRPCError } from "@trpc/server";

// ==================== 输入验证模式 ====================

/**
 * 标签名称输入模式
 * @property {string} name - 标签名称（不能为空）
 */
const tagNameInput = z.object({
    name: z.string().min(1, "标签名称不能为空"),
});

/**
 * 标签更新输入模式
 * @property {string} name - 当前标签名称
 * @property {string} newName - 新的标签名称（不能为空）
 */
const tagUpdateInput = z.object({
    name: z.string(),
    newName: z.string().min(1, "新标签名称不能为空"),
});

// ==================== 辅助函数 ====================

/**
 * 验证标签是否存在
 * @param tagName - 标签名称
 * @throws {TRPCError} 如果标签不存在
 */
async function verifyTagExists(tagName: string) {
    const tag = await prisma.tag.findUnique({
        where: { name: tagName },
    });

    if (!tag) {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: "标签不存在",
        });
    }

    return tag;
}

/**
 * 处理数据库操作错误
 * @param error - 错误对象
 * @param operation - 操作描述
 * @throws {TRPCError}
 */
function handleDatabaseError(error: unknown, operation: string): never {
    if (error instanceof TRPCError) {
        throw error;
    }
    console.error(`${operation}失败:`, error);
    throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `${operation}失败`,
        cause: error,
    });
}

// ==================== 路由定义 ====================

export const tagsRouter = router({
    /**
     * 获取所有已发布的标签
     * - 仅返回至少有一篇已发布文章的标签
     */
    getAll: publicProcedure.query(async () => {
        try {
            const tags = await prisma.tag.findMany({
                where: {
                    postVersions: {
                        some: {
                            postVersion: {
                                isCurrent: {
                                    isNot: null,
                                },
                            },
                        },
                    },
                },
                select: { name: true },
            });

            return tags;
        } catch (error) {
            handleDatabaseError(error, "获取标签列表");
        }
    }),

    /**
     * 创建新标签
     * - 仅管理员可用
     * - 自动去除首尾空格
     */
    create: adminProcedure.input(tagNameInput).mutation(async ({ input }) => {
        try {
            await prisma.tag.create({
                data: {
                    name: input.name.trim(),
                },
            });
        } catch (error) {
            handleDatabaseError(error, "创建标签");
        }
    }),

    /**
     * 删除标签
     * - 仅管理员可用
     * - 会级联删除所有相关的文章版本关联
     */
    delete: adminProcedure.input(tagNameInput).mutation(async ({ input }) => {
        try {
            // 验证标签存在
            await verifyTagExists(input.name);

            // 删除标签
            await prisma.tag.delete({
                where: { name: input.name },
            });
        } catch (error) {
            handleDatabaseError(error, "删除标签");
        }
    }),

    /**
     * 更新标签名称
     * - 仅管理员可用
     * - 自动去除首尾空格
     * - 会更新所有使用该标签的文章版本
     */
    update: adminProcedure.input(tagUpdateInput).mutation(async ({ input }) => {
        try {
            // 验证标签存在
            await verifyTagExists(input.name);

            // 更新标签名称
            await prisma.tag.update({
                where: { name: input.name },
                data: { name: input.newName.trim() },
            });
        } catch (error) {
            handleDatabaseError(error, "更新标签");
        }
    }),
});
