/**
 * tRPC 上下文配置
 *
 * 这个文件负责为每个 tRPC 请求创建上下文对象。
 * 上下文包含了请求处理过程中需要的共享数据，如用户会话信息。
 */

import { auth } from "@/lib/auth/auth";

/**
 * 创建 tRPC 请求上下文
 *
 * 每个 tRPC 请求都会调用此函数来创建上下文。
 * 上下文对象会被传递给所有的 procedure 和中间件。
 *
 * @returns 包含用户会话信息的上下文对象
 * @link https://trpc.io/docs/context
 */
export async function createContext() {
    // 使用 NextAuth.js v5 的 auth() 函数获取会话信息
    // 这个函数与 App Router 兼容
    const session = await auth();

    // 返回上下文对象
    return {
        session,
    };
}

/** 上下文类型定义 */
export type Context = Awaited<ReturnType<typeof createContext>>;
