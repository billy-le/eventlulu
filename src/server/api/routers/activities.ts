import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import * as z from "zod";

export const activitiesRouter = createTRPCRouter({
  createActivities: protectedProcedure
    .input(
      z.object({
        leadFormId: z.string(),
        activities: z.array(
          z.object({
            date: z.date(),
            clientFeedback: z.string().optional(),
            nextTraceDate: z.date().optional(),
            updatedBy: z.object({ id: z.string(), name: z.string() }),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const activities = [];
      for (let activity of input.activities) {
        const act = await ctx.prisma.leadFormActivity.create({
          data: {
            date: activity.date,
            clientFeedback: activity.clientFeedback,
            nextTraceDate: activity.nextTraceDate,
            updatedById: activity.updatedBy.id,
            leadFormId: input.leadFormId,
          },
        });

        activities.push(act);
      }
      return activities;
    }),
  updateActivities: protectedProcedure
    .input(
      z.array(
        z.object({
          id: z.string(),
          clientFeedback: z.string().optional(),
        })
      )
    )
    .mutation(async ({ input, ctx }) => {
      let activities = [];

      for (let activity of input) {
        const act = await ctx.prisma.leadFormActivity.update({
          where: {
            id: activity.id,
          },
          data: {
            clientFeedback: activity.clientFeedback,
          },
        });
        activities.push(act);
      }
      return activities;
    }),
});
