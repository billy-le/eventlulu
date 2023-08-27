import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";

export const leadsRouter = createTRPCRouter({
  getLeads: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.leadForm.findMany({
      include: {
        contact: true,
        eventDetails: true,
      },
    });
  }),
  getLeadFormData: protectedProcedure.query(async ({ ctx }) => {
    try {
      const salesManagers = await ctx.prisma.user.findMany({
        where: {
          role: "salesManager",
        },
      });
      const functionRooms = await ctx.prisma.functionRoom.findMany();
      const mealReqs = await ctx.prisma.mealReq.findMany();
      const roomSetups = await ctx.prisma.roomSetup.findMany();
      const rateTypes = await ctx.prisma.rateType.findMany();
      const eventTypes = await ctx.prisma.eventType.findMany();
      const leadTypes = await ctx.prisma.leadType.findMany();

      return {
        salesManagers,
        functionRooms,
        mealReqs,
        roomSetups,
        rateTypes,
        eventTypes,
        leadTypes,
      };
    } catch (err) {
      console.log(err);
    }
  }),
  createLead: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        salesManagerId: z.string(),
        leadTypeId: z.string(),
        dateReceived: z.date().optional(),
        siteInspectionDate: z.date().optional(),
        siteInspectionDateOptional: z.date().optional(),
        isCorporate: z.boolean().optional(),
        isLiveIn: z.boolean().optional(),
        eventTypeId: z.string().optional(),
        eventTypeOther: z.string().optional(),
        contact: z
          .object({
            firstName: z.string().optional(),
            lastName: z.string().optional(),
            email: z.string().optional(),
            phoneNumber: z.string().optional(),
            mobileNumber: z.string().optional(),
          })
          .optional(),
        company: z
          .object({
            name: z.string().optional(),
            address: z.string().optional(),
          })
          .optional(),
        eventDetails: z
          .array(
            z.object({
              date: z.date().optional(),
              optionalDate: z.date().optional(),
              time: z.date().optional(),
              pax: z.number().int().positive().optional(),
              roomSetupId: z.string().optional(),
              mealReqId: z.string().optional(),
              functionRoomId: z.string().optional(),
              remarks: z.string().optional(),
            })
          )
          .optional(),
        budget: z
          .object({
            banquet: z.number().int().positive().optional(),
            rooms: z.number().int().positive().optional(),
            rate: z.number().int().positive(),
            rateTypeId: z.string().optional(),
            otherHotelsBeingConsidered: z.array(z.string()).optional(),
          })
          .optional(),
        activities: z
          .array(
            z.object({
              date: z.date().optional(),
              updatedById: z.string(),
              clientFeedback: z.string().optional(),
              nextTraceDate: z.date().optional(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const lead = await ctx.prisma.leadForm.create({
          data: {
            dateReceived: new Date(),
            leadTypeId: input.leadTypeId,
            salesAccountManagerId: input.salesManagerId,
            isCorporate: input.isCorporate,
            isLiveIn: input.isLiveIn,
            ...(input.eventTypeId && {
              eventTypeId: input.eventTypeId,
            }),
            ...(input.eventTypeOther && {
              eventTypeOther: input.eventTypeOther,
            }),
            ...(input.siteInspectionDate && {
              onSiteDate: input.siteInspectionDate,
            }),
            ...(input.siteInspectionDateOptional && {
              onSiteDateOptional: input.siteInspectionDateOptional,
            }),
            ...(input.eventDetails && {
              eventDetails: {
                createMany: {
                  skipDuplicates: true,
                  data: input.eventDetails.map((detail) => ({
                    date: detail.date || new Date(),
                    optionalDate: detail.optionalDate,
                    functionRoomId: detail.functionRoomId,
                    mealReqId: detail.mealReqId,
                    pax: detail.pax,
                    roomSetupId: detail.roomSetupId,
                    remarks: detail.remarks,
                    startTime: undefined,
                    endTime: undefined,
                  })),
                },
              },
            }),
            ...(input.budget && {
              banquetsBudget: input.budget.banquet,
              roomsBudget: input.budget.rooms,
              rate: input.budget.rate,
              rateTypeId: input.budget.rateTypeId,
            }),
            ...(input.activities && {
              activities: {
                createMany: {
                  data: input.activities.map((activity) => ({
                    date: activity.date,
                    clientFeedback: activity.clientFeedback,
                    nextTraceDate: activity.nextTraceDate,
                    userId: input.userId,
                  })),
                },
              },
            }),
          },
        });

        return lead;
      } catch (err) {
        console.log(err);
      }
    }),
});
