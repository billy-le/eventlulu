import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import * as z from "zod";

const nameId = z.object({ id: z.string(), name: z.string() });

export const eventDetailsRouter = createTRPCRouter({
  createEventDetails: protectedProcedure
    .input(
      z.object({
        leadFormId: z.string(),
        eventDetails: z.array(
          z.object({
            date: z.date(),
            startTime: z.string().optional(),
            endTime: z.string().optional(),
            pax: z.number().int().optional(),
            roomSetup: nameId.optional(),
            mealReqs: z.array(nameId).optional().default([]),
            functionRoom: nameId.optional(),
            remarks: z.string().optional(),
            rate: z.number().int().optional(),
            rateType: nameId.optional(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      let eventDetails = [];
      for (const event of input.eventDetails ?? []) {
        const detail = await ctx.prisma.eventDetails.create({
          data: {
            date: event.date,
            pax: event.pax,
            roomSetupId: event.roomSetup?.id,
            functionRoomId: event.functionRoom?.id,
            remarks: event.remarks,
            rate: event.rate,
            rateTypeId: event.rateType?.id,
            mealReqs: {
              connect: event.mealReqs,
            },
            startTime: event.startTime,
            endTime: event.endTime,
            leadFormId: input.leadFormId,
          },
        });
        eventDetails.push(detail);
      }
      return eventDetails;
    }),
  updateEventDetails: protectedProcedure
    .input(
      z.array(
        z.object({
          id: z.string().optional(),
          date: z.date(),
          startTime: z.string().optional(),
          endTime: z.string().optional(),
          pax: z.number().int().optional(),
          roomSetup: nameId.optional(),
          mealReqs: z.array(nameId).optional().default([]),
          functionRoom: nameId.optional(),
          remarks: z.string().optional(),
          rate: z.number().int().optional(),
          rateType: nameId.optional(),
        })
      )
    )
    .mutation(async ({ input, ctx }) => {
      let eventDetails = [];
      const filteredEventDetails = input.filter((x) => x.id);
      for (let event of filteredEventDetails) {
        const prior = await ctx.prisma.eventDetails.findUnique({
          where: { id: event.id },
          include: {
            mealReqs: true,
          },
        });
        const disconnectMealReqs =
          prior?.mealReqs?.filter(
            (mealReq) => !event.mealReqs.find((req) => mealReq.id === req.id)
          ) ?? [];

        const eventDetail = await ctx.prisma.eventDetails.update({
          where: {
            id: event.id,
          },
          data: {
            date: event.date,
            pax: event.pax,
            roomSetupId: event.roomSetup?.id,
            functionRoomId: event.functionRoom?.id,
            remarks: event.remarks,
            rate: event.rate,
            rateTypeId: event.rateType?.id,
            startTime: event.startTime,
            endTime: event.endTime,
            mealReqs: {
              connect: event.mealReqs,
              disconnect: disconnectMealReqs,
            },
          },
          include: {
            functionRoom: true,
            roomSetup: true,
            rateType: true,
            mealReqs: true,
          },
        });

        eventDetails.push(eventDetail);

        return eventDetails;
      }
    }),
  deleteEventDetails: protectedProcedure
    .input(z.array(z.string()))
    .mutation(({ input, ctx }) => {
      return ctx.prisma.eventDetails.deleteMany({
        where: {
          id: {
            in: input,
          },
        },
      });
    }),
});
