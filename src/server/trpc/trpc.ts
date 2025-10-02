/**
 * tRPC 核心配置
 *
 * 这个文件定义了 tRPC 的基础配置，包括：
 * - tRPC 实例初始化
 * - 路由构建器
 * - 不同权限级别的 Procedure（公开、认证、管理员）
 */

import { initTRPC } from "@trpc/server";
import superjson from "superjson";

import type { Context } from "./context";
import { requireAdmin, requireAuth } from "./utils";

// ==================== tRPC 实例初始化 ====================

/**
 * 使用 superjson 作为数据转换器，支持 Date、Map、Set 等类型
 */
const t = initTRPC.context<Context>().create({
    transformer: superjson,
});

// ==================== 导出构建器和 Procedures ====================

/**
 * 路由构建器
 * 用于创建 tRPC 路由
 */
export const router = t.router;

/**
 * 公开 Procedure
 * 无需认证即可访问
 */
export const publicProcedure = t.procedure;

/**
 * 认证 Procedure
 * 需要用户登录后才能访问
 *
 * 中间件功能：
 * - 验证用户是否已登录
 * - 将用户信息注入到上下文中
 */
export const authedProcedure = t.procedure.use(({ ctx, next }) => {
    // 验证用户身份
    const user = requireAuth(ctx);

    // 将用户信息添加到上下文
    return next({
        ctx: {
            user,
        },
    });
});

/**
 * 管理员 Procedure
 * 需要管理员权限才能访问
 *
 * 中间件功能：
 * - 验证用户是否已登录
 * - 验证用户是否具有管理员角色
 * - 将用户信息注入到上下文中
 */
export const adminProcedure = t.procedure.use(({ ctx, next }) => {
    // 验证管理员权限
    const user = requireAdmin(ctx);
    return next({
        ctx: {
            user,
        },
    });
});
