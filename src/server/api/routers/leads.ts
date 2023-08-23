import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";

export const leadsRouter = createTRPCRouter({
  getLeads: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.leadForm.findMany({
      include: {
        contact: true,
        eventDetails: true,
      },
    });
  }),
  createLead: protectedProcedure
    .input(
      z.object({
        salesManagerId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const leadForm = await ctx.prisma.leadForm.create({
        data: {
          dateReceived: new Date(),
          salesAccountManager: {
            connect: {
              id: input.salesManagerId,
            },
          },
        },
      });
      return leadForm;
    }),
});
