import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const mealReqsRouter = createTRPCRouter({
  getMealReqs: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.mealReq.findMany();
  }),
});
