import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const roomSetupsRouter = createTRPCRouter({
  getRoomSetups: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.roomSetup.findMany();
  }),
});
