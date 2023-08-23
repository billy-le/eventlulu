import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const salesManagersRouter = createTRPCRouter({
  getSalesManagers: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany({
      where: {
        role: {
          equals: "salesManager",
        },
      },
    });
  }),
});
