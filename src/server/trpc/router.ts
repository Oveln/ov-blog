/**
 * tRPC 应用路由配置
 *
 * 这个文件是 tRPC API 的入口点，负责：
 * - 聚合所有子路由
 * - 定义 API 的整体结构
 * - 导出路由类型供客户端使用
 */

import { router, publicProcedure } from "./trpc";
import { postsRouter } from "./routers/posts";
import { userRouter } from "./routers/user";
import { appsRouter } from "./routers/apps";
import { tagsRouter } from "./routers/tags";
import { versionRouter } from "./routers/version";

/**
 * 应用主路由
 *
 * 所有的 API 端点都通过这个路由暴露：
 * - healthcheck: 健康检查端点
 * - posts: 文章相关 API
 * - user: 用户相关 API
 * - apps: 应用相关 API
 * - tags: 标签相关 API
 * - version: trpc 版本信息接口
 */
export const appRouter = router({
    /** 健康检查端点 - 用于监控服务状态 */
    healthcheck: publicProcedure.query(() => "OK"),

    /** 文章管理 API */
    posts: postsRouter,

    /** 用户管理 API */
    user: userRouter,

    /** 应用管理 API */
    apps: appsRouter,

    /** 标签管理 API */
    tags: tagsRouter,

    /** trpc 版本信息接口 */
    version: versionRouter,
});

/**
 * 导出路由类型
 * 供客户端使用，实现类型安全的 API 调用
 */
export type AppRouter = typeof appRouter;
