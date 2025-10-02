import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const postsRouter = router({
  getAll: publicProcedure.query(async () => {
    // This is a placeholder - in a real app, you would fetch from your database
    return [
      {
        id: '1',
        title: 'Hello tRPC',
        content: 'This is a post fetched via tRPC!',
        createdAt: new Date(),
      },
    ];
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // This is a placeholder - in a real app, you would fetch from your database
      return {
        id: input.id,
        title: 'Sample Post',
        content: 'This is a sample post content',
        createdAt: new Date(),
      };
    }),
});