import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const roomSetupsRouter = createTRPCRouter({
  getRoomSetups: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.roomSetup.findMany();
  }),
});
