import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

import type { Context } from './context';
import { requireAdmin, requireAuth } from './utils';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const authedProcedure = t.procedure.use(({ ctx, next }) => {
  // 如果没有登录，抛出错误
  const user = requireAuth(ctx);
  
  // 已登录，继续执行
  return next({
    ctx: {
      // 将用户信息添加到上下文中
      user
    },
  });
});
export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  // 检查管理员权限
  const user = requireAdmin(ctx);
  
  return next({
    ctx: {
      user: user
    },
  });
});