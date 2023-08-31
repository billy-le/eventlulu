import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const leadsRouter = createTRPCRouter({
  getLeads: protectedProcedure
    .input(
      z
        .object({
          leadId: z.string().nullable(),
        })
        .optional()
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.leadForm.findMany({
        ...(input?.leadId && {
          where: {
            id: input.leadId,
          },
        }),
        include: {
          contact: true,
          eventDetails: {
            include: {
              functionRoom: true,
              mealReq: true,
              roomSetup: true,
            },
          },
          activities: true,
          company: true,
          eventType: true,
          rateType: true,
          leadType: true,
          salesAccountManager: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }),
  mutateLead: protectedProcedure
    .input(
      z.object({
        id: z.string().optional(),
        userId: z.string(),
        salesManagerId: z.string(),
        leadTypeId: z.string(),
        dateReceived: z.date().optional(),
        lastDateSent: z.date().optional(),
        onSiteDate: z.date().optional(),
        isCorporate: z.boolean().optional(),
        isLiveIn: z.boolean().optional(),
        eventTypeId: z.string().optional(),
        eventTypeOther: z.string().optional(),
        startDate: z.date(),
        endDate: z.date(),
        eventLengthInDays: z.number().int().positive(),
        banquetsBudget: z.number().int().positive().optional(),
        roomsBudget: z.number().int().positive().optional(),
        rate: z.number().int().positive(),
        rateTypeId: z.string().optional(),
        otherHotelConsiderations: z.string().optional(),
        contact: z.object({
          firstName: z.string(),
          lastName: z.string().optional(),
          email: z.string(),
          phoneNumber: z.string().optional(),
          mobileNumber: z.string().optional(),
        }),
        company: z
          .object({
            name: z.string(),
            address1: z.string().optional(),
            address2: z.string().optional(),
          })
          .optional(),
        eventDetails: z
          .array(
            z.object({
              date: z.date(),
              startTime: z.string().optional(),
              endTime: z.string().optional(),
              pax: z.number().int().positive().optional(),
              roomSetupId: z.string().optional(),
              mealReqId: z.string().optional(),
              functionRoomId: z.string().optional(),
              remarks: z.string().optional(),
            })
          )
          .optional(),
        activities: z
          .array(
            z.object({
              date: z.date(),
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
        let company = null;
        let contact = null;
        if (input.company) {
          company = await ctx.prisma.organization.findUnique({
            where: {
              name: input.company.name,
            },
          });
          if (!company) {
            company = await ctx.prisma.organization.create({
              data: {
                name: input.company.name,
                address1: input.company.address1,
                address2: input.company.address2,
              },
            });
          }
        }
        if (input.contact) {
          contact = await ctx.prisma.contact.findUnique({
            where: {
              email: input.contact.email,
            },
          });
          if (!contact) {
            contact = await ctx.prisma.contact.create({
              data: {
                email: input.contact.email,
                firstName: input.contact.firstName,
                lastName: input.contact.lastName,
                phoneNumber: input.contact.phoneNumber,
              },
            });
          }
        }

        if (input.id) {
          return await ctx.prisma.leadForm.update({
            where: {
              id: input.id,
            },
            data: {},
          });
        } else {
          return await ctx.prisma.leadForm.create({
            data: {
              dateReceived: input.dateReceived ?? new Date(),
              lastDateSent: input.lastDateSent,
              leadTypeId: input.leadTypeId,
              salesAccountManagerId: input.salesManagerId,
              isCorporate: input.isCorporate,
              isLiveIn: input.isLiveIn,
              startDate: input.startDate,
              endDate: input.endDate,
              eventLengthInDays: input.eventLengthInDays,
              banquetsBudget: input.banquetsBudget,
              roomsBudget: input.roomsBudget,
              rate: input.rate,
              rateTypeId: input.rateTypeId,
              ...(company && {
                companyId: company.id,
              }),
              ...(contact && {
                contactId: contact.id,
              }),
              ...(input.eventTypeId && {
                eventTypeId: input.eventTypeId,
              }),
              ...(input.eventTypeOther && {
                eventTypeOther: input.eventTypeOther,
              }),
              ...(input.onSiteDate && {
                onSiteDate: input.onSiteDate,
              }),
              ...(input.eventDetails && {
                eventDetails: {
                  createMany: {
                    skipDuplicates: true,
                    data: input.eventDetails.map((detail) => ({
                      date: detail.date,
                      startTime: detail.startTime,
                      endTime: detail.endTime,
                      functionRoomId: detail.functionRoomId,
                      mealReqId: detail.mealReqId,
                      pax: detail.pax,
                      roomSetupId: detail.roomSetupId,
                      remarks: detail.remarks,
                    })),
                  },
                },
              }),
              ...((input.activities?.length ?? 0) > 0 && {
                activities: {
                  createMany: {
                    data: input.activities!.map((activity) => ({
                      date: activity.date,
                      clientFeedback: activity.clientFeedback,
                      nextTraceDate: activity.nextTraceDate,
                      updatedById: activity.updatedById,
                    })),
                  },
                },
              }),
            },
          });
        }
      } catch (err) {
        console.log(err);
      }
    }),
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: id }) => {
      try {
        return await ctx.prisma.leadForm.delete({
          where: {
            id,
            eventDetails: {
              every: {
                leadFormId: id,
              },
            },
            activities: {
              every: {
                leadFormId: id,
              },
            },
          },
        });
      } catch (err) {
        console.log(err);
      }
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
});
