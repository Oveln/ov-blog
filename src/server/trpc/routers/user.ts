import { router, authedProcedure } from '../trpc';

export const userRouter = router({
  getCurrentUser: authedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
    };
  }),

  getUsername: authedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    
    return {
      username: user.name || user.email || 'Unknown User',
    };
  }),
});