import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const dashboardRouter = createTRPCRouter({
  getDashboardStats: protectedProcedure
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const leadsGenerated = await ctx.prisma.leadForm.count({
          where: {
            createDate: {
              gte: input.from,
            },
            endDate: {
              lte: input.to,
            },
          },
        });

        const leads = await ctx.prisma.leadForm.findMany({
          where: {
            startDate: {
              gte: input.from,
              lte: input.to,
            },
          },
          select: {
            rateType: {
              select: {
                name: true,
              },
            },
            banquetsBudget: true,
            roomsBudget: true,
            eventDetails: {
              select: {
                pax: true,
                rate: true,
              },
            },
            status: true,
          },
        });

        const confirmedRevenue = leads.reduce((acc, lead) => {
          if (lead.status === "lost" || lead.status === "tentative") return acc;

          let total = (lead.banquetsBudget ?? 0) + (lead.roomsBudget ?? 0);
          if (lead.rateType?.name?.toLowerCase() === "per person") {
            const _ = lead.eventDetails.reduce((sum, detail) => {
              return sum + (detail.pax ?? 0) * (detail.rate ?? 0);
            }, 0);

            total = total + _;
          } else {
            const _ = lead.eventDetails.reduce(
              (sum, detail) => sum + (detail.rate ?? 0),
              0
            );
            total = total + _;
          }

          return acc + total;
        }, 0);

        const potentialRevenue = leads.reduce((acc, lead) => {
          if (lead.status === "lost" || lead.status === "confirmed") return acc;

          let total = (lead.banquetsBudget ?? 0) + (lead.roomsBudget ?? 0);
          if (lead.rateType?.name?.toLowerCase() === "per person") {
            const _ = lead.eventDetails.reduce((sum, detail) => {
              return sum + (detail.pax ?? 0) * (detail.rate ?? 0);
            }, 0);

            total = total + _;
          } else {
            const _ = lead.eventDetails.reduce(
              (sum, detail) => sum + (detail.rate ?? 0),
              0
            );
            total = total + _;
          }

          return acc + total;
        }, 0);

        const eventsHappening = leads.filter(
          (lead) => lead.status === "confirmed"
        ).length;

        return {
          confirmedRevenue,
          leadsGenerated,
          potentialRevenue,
          eventsHappening,
        };
      } catch (err) {
        return {
          confirmedRevenue: 0,
          leadsGenerated: 0,
          potentialRevenue: 0,
          eventsHappening: 0,
        };
      }
    }),
});
