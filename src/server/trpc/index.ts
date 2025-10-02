/**
 * tRPC 路由器统一导出
 */

export { appRouter, type AppRouter } from './router';
export { router, publicProcedure } from './trpc';
export { createContext, type Context } from './context';
export { postsRouter } from './routers/posts';
export { userRouter } from './routers/user';
export { requireAuth, requireAdmin } from './utils';