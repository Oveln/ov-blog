/**
 * tRPC 工具函数
 *
 * 这个文件提供了用于 tRPC 中间件的辅助函数，
 * 主要用于权限验证和用户认证。
 */

import { TRPCError } from "@trpc/server";
import type { Context } from "./context";
import { Role } from "@prisma/client";

/**
 * 验证用户是否已认证
 *
 * 检查上下文中是否存在有效的用户会话。
 * 如果用户未登录，抛出 UNAUTHORIZED 错误。
 *
 * @param ctx - tRPC 上下文对象
 * @returns 已认证的用户对象
 * @throws {TRPCError} 当用户未登录时抛出 UNAUTHORIZED 错误
 *
 * @example
 * ```ts
 * const authedProcedure = t.procedure.use(({ ctx, next }) => {
 *   const user = requireAuth(ctx);
 *   return next({ ctx: { user } });
 * });
 * ```
 */
export function requireAuth(ctx: Context) {
    if (!ctx.session?.user) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "需要登录才能访问此资源",
        });
    }
    if (!ctx.session.user.id) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "用户信息不完整，缺少用户ID",
        });
    }
    return ctx.session.user;
}

/**
 * 验证用户是否具有管理员权限
 *
 * 首先检查用户是否已登录，然后验证用户角色是否为管理员。
 * 如果用户不是管理员，抛出 FORBIDDEN 错误。
 *
 * @param ctx - tRPC 上下文对象
 * @returns 具有管理员权限的用户对象
 * @throws {TRPCError} 当用户未登录时抛出 UNAUTHORIZED 错误
 * @throws {TRPCError} 当用户不是管理员时抛出 FORBIDDEN 错误
 *
 * @example
 * ```ts
 * const adminProcedure = t.procedure.use(({ ctx, next }) => {
 *   const user = requireAdmin(ctx);
 *   return next({ ctx: { user } });
 * });
 * ```
 */
export function requireAdmin(ctx: Context) {
    // 首先验证用户是否已登录
    const user = requireAuth(ctx);

    // 验证用户角色
    if (user.role !== Role.ADMIN) {
        throw new TRPCError({
            code: "FORBIDDEN",
            message: "需要管理员权限才能访问此资源",
        });
    }

    return user;
}
