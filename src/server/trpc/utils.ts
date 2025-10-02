/**
 * tRPC 工具函数
 */

import { TRPCError } from '@trpc/server';
import type { Context } from './context';

/**
 * 检查是否已认证
 */
export function requireAuth(ctx: Context) {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: '需要登录才能访问此资源',
    });
  }
  return ctx.session.user;
}

/**
 * 检查管理员权限
 */
export function requireAdmin(ctx: Context) {
  const user = requireAuth(ctx);
  
  if (user.role !== 'ADMIN') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: '需要管理员权限才能访问此资源',
    });
  }
  
  return user;
}