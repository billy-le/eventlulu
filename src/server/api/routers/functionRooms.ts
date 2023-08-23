import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const functionRoomsRouter = createTRPCRouter({
  getFunctionRooms: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.functionRoom.findMany();
  }),
});
