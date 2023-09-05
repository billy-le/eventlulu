import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { hash } from "bcrypt";
import { env } from "~/env.mjs";

const saltRounds = 12;

export const usersRouter = createTRPCRouter({
  updateUser: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        currentPassword: z.string().optional(),
        password: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let currentPw: string | undefined, pw: string | undefined;

      if (input.currentPassword === env.DEFAULT_PASSWORD) {
        currentPw = input.currentPassword;
      } else if (input.currentPassword) {
        currentPw = await hash(input.currentPassword, saltRounds);
      }

      if (input.password) {
        pw = await hash(input.password, saltRounds);
      }

      const user = await ctx.prisma.user.update({
        where: {
          id: input.id,
          password: currentPw,
        },
        data: {
          ...(input.name && { name: input.name }),
          ...(pw && {
            password: pw,
          }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          role: true,
          password: false,
        },
      });

      return user;
    }),
});
