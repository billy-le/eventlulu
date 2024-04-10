import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";

export const mealReqsRouter = createTRPCRouter({
  getMealReqs: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.mealReq.findMany();
  }),
  createMealReq: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const mealReq = await ctx.prisma.mealReq.create({
          data: {
            name: input.name,
          },
        });

        return mealReq;
      } catch (err) {
        console.log(err);
      }
    }),
  updateMealReq: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const mealReq = await ctx.prisma.mealReq.update({
          where: {
            id: input.id,
          },
          data: {
            name: input.name,
          },
        });

        return mealReq;
      } catch (err) {
        console.log(err);
      }
    }),
  deleteMealReq: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const mealReq = await ctx.prisma.mealReq.delete({
          where: {
            id: input.id,
          },
        });

        return mealReq;
      } catch (err) {
        console.log(err);
      }
    }),
});
