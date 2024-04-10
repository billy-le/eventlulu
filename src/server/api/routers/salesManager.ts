import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const salesManagersRouter = createTRPCRouter({
  getSalesManagers: publicProcedure.query(async ({ ctx }) => {
    const salesManagers = await ctx.prisma.user.findMany({
      where: {
        roles: {
          has: "salesManager",
        },
      },
    });
    return salesManagers;
  }),
});
