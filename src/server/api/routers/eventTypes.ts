import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const eventTypesRouter = createTRPCRouter({
  getEventTypes: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.eventType.findMany();
  }),
  createEventType: protectedProcedure
    .input(z.object({ name: z.string(), activity: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const eventType = await ctx.prisma.eventType.create({
          data: {
            name: input.name,
            activity: input.activity,
          },
        });

        return eventType;
      } catch (err) {
        console.log(err);
      }
    }),
  updateEventType: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        activity: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const eventType = await ctx.prisma.eventType.update({
          where: {
            id: input.id,
          },
          data: {
            name: input.name,
          },
        });

        return eventType;
      } catch (err) {
        console.log(err);
      }
    }),
  deleteEventType: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const eventType = await ctx.prisma.eventType.delete({
          where: {
            id: input.id,
          },
        });

        return eventType;
      } catch (err) {
        console.log(err);
      }
    }),
});
