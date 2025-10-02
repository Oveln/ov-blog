import { router, publicProcedure } from './trpc';
import { postsRouter } from './routers/posts';
import { userRouter } from './routers/user';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'OK'),
  posts: postsRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;