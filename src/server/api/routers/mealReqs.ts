import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const mealReqsRouter = createTRPCRouter({
  getMealReqs: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.mealReq.findMany();
  }),
});
