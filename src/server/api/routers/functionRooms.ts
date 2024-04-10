import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";

export const functionRoomsRouter = createTRPCRouter({
  getFunctionRooms: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.functionRoom.findMany();
  }),
  createFunctionRoom: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const functionRoom = await ctx.prisma.functionRoom.create({
          data: {
            name: input.name,
          },
        });

        return functionRoom;
      } catch (err) {
        console.log(err);
      }
    }),
  updateFunctionRoom: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const functionRoom = await ctx.prisma.functionRoom.update({
          where: {
            id: input.id,
          },
          data: {
            name: input.name,
          },
        });

        return functionRoom;
      } catch (err) {
        console.log(err);
      }
    }),
  deleteFunctionRoom: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const functionRoom = await ctx.prisma.functionRoom.delete({
          where: {
            id: input.id,
          },
        });

        return functionRoom;
      } catch (err) {
        console.log(err);
      }
    }),
});
