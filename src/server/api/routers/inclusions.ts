import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const inclusionsRouter = createTRPCRouter({
  getInclusions: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.inclusion.findMany();
  }),
  createInclusions: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ ctx, input }) => {
      const inclusions: {
        id: string;
        name: string;
        leadFormId?: string | null;
      }[] = [];

      for (let item of input) {
        const inclusion = await ctx.prisma.inclusion.create({
          data: { name: item },
        });
        inclusions.push(inclusion);
      }

      return inclusions;
    }),
  updateInclusions: protectedProcedure
    .input(z.array(z.object({ id: z.string(), name: z.string() })))
    .mutation(async ({ ctx, input }) => {
      let inclusions: {
        id: string;
        name: string;
        leadFormId?: string | null;
      }[] = [];
      for (let item of input) {
        const inclusion = await ctx.prisma.inclusion.update({
          where: {
            id: item.id,
          },
          data: {
            name: item.name,
          },
        });
        inclusions.push(inclusion);
      }
      return inclusions;
    }),
  deleteInclusions: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.inclusion.deleteMany({
        where: {
          id: {
            in: input,
          },
        },
      });
    }),
});
