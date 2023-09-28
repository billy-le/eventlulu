import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const calendarEventsRouter = createTRPCRouter({
  getCalendarEvents: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const events = await ctx.prisma.leadForm.findMany({
        where: {
          startDate: {
            gte: input.startDate,
            lte: input.endDate,
          },
        },
        select: {
          startDate: true,
          eventDetails: true,
          endDate: true,
        },
      });

      return events;
    }),
});
