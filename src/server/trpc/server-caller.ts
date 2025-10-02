/**
 * tRPC 服务器端调用助手
 *
 * 这个文件提供了在服务器组件中调用 tRPC 程序的工具函数。
 * 用于实现 SSR（服务器端渲染）时直接调用 tRPC API。
 *
 * @see https://trpc.io/docs/client/nextjs/server-side-helpers
 * @see https://trpc.io/docs/server/server-side-calls
 */

import { appRouter } from "./router";
import { createContext } from "./context";

/**
 * 创建服务器端 tRPC caller
 *
 * 使用 createCaller 直接在服务器组件中调用 tRPC procedures。
 * 这种方式不会发起 HTTP 请求，而是直接调用服务器端的函数。
 *
 * 优势：
 * - 无 HTTP 开销，性能更好
 * - 完整的类型安全
 * - 自动序列化/反序列化（通过 superjson）
 * - 复用相同的上下文创建逻辑
 *
 * @returns tRPC caller 实例
 *
 * @example
 * ```tsx
 * // 在 App Router 服务器组件中使用
 * import { createServerCaller } from '@/server/trpc/server-caller';
 *
 * export default async function Page() {
 *   const trpc = await createServerCaller();
 *   const posts = await trpc.posts.getAllPostCardInfo();
 *
 *   return <div>{posts.map(post => ...)}</div>;
 * }
 * ```
 */
export async function createServerCaller() {
    const context = await createContext();
    return appRouter.createCaller(context);
}
