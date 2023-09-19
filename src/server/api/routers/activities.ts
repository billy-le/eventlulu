import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import * as z from "zod";

export const activitiesRouter = createTRPCRouter({
  deleteActivities: protectedProcedure
    .input(z.array(z.string()))
    .mutation(({ input, ctx }) => {
      return ctx.prisma.leadFormActivity.deleteMany({
        where: {
          id: {
            in: input,
          },
        },
      });
    }),
});
