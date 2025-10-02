import { z } from "zod";
import { publicProcedure, adminProcedure, router } from "../trpc";
import { prisma } from "@/lib/db";
import { TRPCError } from "@trpc/server";

// ==================== 输入验证模式 ====================

/**
 * 应用ID输入模式
 * @property {string} id - 应用的唯一标识符
 */
const appIdInput = z.object({
    id: z.string(),
});

/**
 * 创建应用输入模式
 * @property {string} name - 应用名称
 * @property {string} url - 应用访问URL
 * @property {string} [description] - 应用描述（可选）
 */
const createAppInput = z.object({
    name: z.string(),
    url: z.string(),
    description: z.string().optional(),
});

// ==================== 辅助函数 ====================

/**
 * 处理数据库操作错误
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

export const appsRouter = router({
    /**
     * 获取所有应用
     * - 公开接口
     */
    getAll: publicProcedure.query(async () => {
        try {
            const apps = await prisma.app.findMany();
            return apps;
        } catch (error) {
            handleDatabaseError(error, "获取应用列表");
        }
    }),

    /**
     * 创建新应用
     * - 仅管理员可用
     */
    create: adminProcedure.input(createAppInput).mutation(async ({ input }) => {
        try {
            const app = await prisma.app.create({
                data: {
                    name: input.name,
                    url: input.url,
                    description: input.description,
                },
            });
            return app;
        } catch (error) {
            handleDatabaseError(error, "创建应用");
        }
    }),

    /**
     * 删除应用
     * - 仅管理员可用
     */
    delete: adminProcedure.input(appIdInput).mutation(async ({ input }) => {
        try {
            await prisma.app.delete({
                where: { id: input.id },
            });
        } catch (error) {
            handleDatabaseError(error, "删除应用");
        }
    }),
});
