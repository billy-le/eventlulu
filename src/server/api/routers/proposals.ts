import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const proposalsRouter = createTRPCRouter({
  getProposals: protectedProcedure.query((ctx) => {
    return {
      yes: "",
    };
  }),
});
