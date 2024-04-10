import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";

export const rateTypesRouter = createTRPCRouter({
  getRateTypes: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.rateType.findMany();
  }),
  createRateType: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const rateType = await ctx.prisma.rateType.create({
          data: {
            name: input.name,
          },
        });

        return rateType;
      } catch (err) {
        console.log(err);
      }
    }),
  updateRateType: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const rateType = await ctx.prisma.rateType.update({
          where: {
            id: input.id,
          },
          data: {
            name: input.name,
          },
        });

        return rateType;
      } catch (err) {
        console.log(err);
      }
    }),
  deleteRateType: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const rateType = await ctx.prisma.rateType.delete({
          where: {
            id: input.id,
          },
        });

        return rateType;
      } catch (err) {
        console.log(err);
      }
    }),
});
