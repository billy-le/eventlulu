import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const roomSetupsRouter = createTRPCRouter({
  getRoomSetups: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.roomSetup.findMany();
  }),
  createRoomSetup: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const roomSetup = await ctx.prisma.roomSetup.create({
          data: {
            name: input.name,
          },
        });

        return roomSetup;
      } catch (err) {
        console.log(err);
      }
    }),
  updateRoomSetup: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const roomSetup = await ctx.prisma.roomSetup.update({
          where: {
            id: input.id,
          },
          data: {
            name: input.name,
          },
        });

        return roomSetup;
      } catch (err) {
        console.log(err);
      }
    }),
  deleteRoomSetup: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const roomSetup = await ctx.prisma.roomSetup.delete({
          where: {
            id: input.id,
          },
        });

        return roomSetup;
      } catch (err) {
        console.log(err);
      }
    }),
});
