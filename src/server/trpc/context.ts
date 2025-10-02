import { auth } from '@/lib/auth/auth';

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export async function createContext() {
  // Using the new NextAuth.js v5 auth() function which is compatible with App Router
  const session = await auth();
  
  // Return context object
  return {
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;