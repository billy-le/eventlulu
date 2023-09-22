import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { Contact, Organization } from "@prisma/client";

const nameId = z.object({ id: z.string(), name: z.string() });

export const leadsRouter = createTRPCRouter({
  getLeads: protectedProcedure
    .input(
      z
        .object({
          cursorId: z.string().optional(),
          leadId: z.string().nullable().optional(),
          orderBy: z.array(z.any({})).optional(),
          skip: z.number().int().optional(),
          take: z.number().int().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const leads = await ctx.prisma.leadForm.findMany({
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
              mealReqs: true,
              roomSetup: true,
            },
          },
          activities: {
            include: {
              updatedBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              date: "asc",
            },
          },
          company: true,
          eventType: true,
          leadType: true,
          rateType: true,
          salesAccountManager: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          inclusions: true,
        },
        take: input?.take,
        orderBy: input?.orderBy ?? [
          { startDate: "desc" },
          { createDate: "desc" },
        ],
        ...(input?.cursorId && {
          cursor: {
            id: input.cursorId,
          },
        }),
        ...(input?.skip && {
          skip: input.skip,
        }),
      });

      return leads;
    }),
  mutateLead: protectedProcedure
    .input(
      z.object({
        id: z.string().optional(),
        salesAccountManager: nameId,
        leadType: nameId,
        dateReceived: z.date().optional(),
        lastDateSent: z.date().optional(),
        onSiteDate: z.date().optional(),
        isCorporate: z.boolean().optional(),
        isLiveIn: z.boolean().optional(),
        eventType: nameId.optional(),
        eventTypeOther: z.string().optional(),
        startDate: z.date(),
        endDate: z.date(),
        eventLengthInDays: z.number().int().positive(),
        banquetsBudget: z.number().int().optional(),
        roomsBudget: z.number().int().optional(),
        otherHotelConsiderations: z.string().optional(),
        contact: z.object({
          id: z.string().optional(),
          firstName: z.string(),
          lastName: z.string().optional(),
          email: z.string(),
          phoneNumber: z.string().optional(),
          mobileNumber: z.string().optional(),
          title: z.string().optional(),
        }),
        rateType: nameId.optional(),
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
              pax: z.number().int().optional(),
              roomSetup: nameId.optional(),
              mealReqs: z.array(nameId).optional().default([]),
              functionRoom: nameId.optional(),
              remarks: z.string().optional(),
              rate: z.number().int().optional(),
            })
          )
          .optional(),
        activities: z
          .array(
            z.object({
              date: z.date(),
              updatedBy: nameId,
              clientFeedback: z.string().optional(),
              nextTraceDate: z.date().optional(),
            })
          )
          .optional(),
        inclusions: z.array(nameId).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        let company: Organization | null = null;
        let contact: Contact | null = null;
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
        if (input.contact?.id) {
          contact = await ctx.prisma.contact.update({
            where: {
              id: input.contact.id,
              email: input.contact.email,
            },
            data: {
              firstName: input.contact.firstName,
              lastName: input.contact.lastName,
              email: input.contact.email,
              mobileNumber: input.contact.mobileNumber,
              phoneNumber: input.contact.phoneNumber,
              title: input.contact.title,
            },
          });
        } else {
          contact = await ctx.prisma.contact.create({
            data: {
              email: input.contact.email,
              firstName: input.contact.firstName,
              lastName: input.contact.lastName,
              phoneNumber: input.contact.phoneNumber,
              mobileNumber: input.contact.mobileNumber,
            },
          });
        }

        if (input.id) {
          const orig = await ctx.prisma.leadForm.findUnique({
            where: { id: input.id },
            select: { inclusions: true },
          });
          const disconnectInclusions =
            orig?.inclusions?.filter(
              (inc) => !input.inclusions.some((i) => i.id === inc.id)
            ) ?? [];

          const lead = await ctx.prisma.leadForm.update({
            where: {
              id: input.id,
            },
            data: {
              dateReceived: input.dateReceived ?? new Date(),
              lastDateSent: input.lastDateSent,
              leadTypeId: input.leadType.id,
              salesAccountManagerId: input.salesAccountManager.id,
              isCorporate: input.isCorporate,
              isLiveIn: input.isLiveIn,
              startDate: input.startDate,
              endDate: input.endDate,
              eventLengthInDays: input.eventLengthInDays,
              banquetsBudget: input.banquetsBudget,
              roomsBudget: input.roomsBudget,
              contactId: contact!.id,
              rateTypeId: input.rateType?.id,
              inclusions: {
                connect: input.inclusions,
                disconnect: disconnectInclusions,
              },
              ...(company && {
                companyId: company.id,
              }),
              ...(input.eventType?.id && {
                eventTypeId: input.eventType?.id,
              }),
              ...(input.eventTypeOther && {
                eventTypeOther: input.eventTypeOther,
              }),
              ...(input.onSiteDate && {
                onSiteDate: input.onSiteDate,
              }),
            },
          });

          return lead;
        } else {
          const lead = await ctx.prisma.leadForm.create({
            data: {
              dateReceived: input.dateReceived ?? new Date(),
              lastDateSent: input.lastDateSent,
              leadTypeId: input.leadType.id,
              salesAccountManagerId: input.salesAccountManager.id,
              isCorporate: input.isCorporate,
              isLiveIn: input.isLiveIn,
              startDate: input.startDate,
              endDate: input.endDate,
              eventLengthInDays: input.eventLengthInDays,
              banquetsBudget: input.banquetsBudget,
              roomsBudget: input.roomsBudget,
              contactId: contact!.id,
              rateTypeId: input.rateType?.id,
              inclusions: {
                connect: input.inclusions,
              },
              ...(company && {
                companyId: company.id,
              }),
              ...(input.eventType?.id && {
                eventTypeId: input.eventType.id,
              }),
              ...(input.eventTypeOther && {
                eventTypeOther: input.eventTypeOther,
              }),
              ...(input.onSiteDate && {
                onSiteDate: input.onSiteDate,
              }),
              ...((input.activities?.length ?? 0) > 0 && {
                activities: {
                  createMany: {
                    data: input.activities!.map((activity) => ({
                      date: activity.date,
                      clientFeedback: activity.clientFeedback,
                      nextTraceDate: activity.nextTraceDate,
                      updatedById: activity.updatedBy?.id,
                    })),
                  },
                },
              }),
            },
          });

          for (const event of input.eventDetails ?? []) {
            await ctx.prisma.eventDetails.create({
              data: {
                date: event.date,
                pax: event.pax,
                roomSetupId: event.roomSetup?.id,
                functionRoomId: event.functionRoom?.id,
                remarks: event.remarks,
                rate: event.rate,
                mealReqs: {
                  connect: event.mealReqs,
                },
                startTime: event.startTime,
                endTime: event.endTime,
                leadFormId: lead.id,
              },
            });
          }

          return lead;
        }
      } catch (err) {
        console.log(err);
      }
    }),
  sentLead: protectedProcedure
    .input(z.object({ id: z.string(), date: z.date() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.leadForm.update({
          where: {
            id: input.id,
          },
          data: {
            lastDateSent: input.date,
          },
        });
      } catch (err) {}
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
      const inclusions = await ctx.prisma.inclusion.findMany({
        orderBy: { name: "asc" },
      });

      return {
        salesManagers,
        functionRooms,
        mealReqs,
        roomSetups,
        rateTypes,
        eventTypes,
        leadTypes,
        inclusions,
      };
    } catch (err) {
      console.log(err);
    }
  }),
});
