import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";

export const leadTypesRouter = createTRPCRouter({
  publicProcedure: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.leadType.findMany({ orderBy: { name: "asc" } });
  }),
  createLeadType: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const leadType = await ctx.prisma.leadType.create({
          data: {
            name: input.name,
          },
        });

        return leadType;
      } catch (err) {
        console.log(err);
      }
    }),
  updateLeadType: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const leadType = await ctx.prisma.leadType.update({
          where: {
            id: input.id,
          },
          data: {
            name: input.name,
          },
        });

        return leadType;
      } catch (err) {
        console.log(err);
      }
    }),
  deleteLeadType: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const leadType = await ctx.prisma.leadType.delete({
          where: {
            id: input.id,
          },
        });

        return leadType;
      } catch (err) {
        console.log(err);
      }
    }),
});
