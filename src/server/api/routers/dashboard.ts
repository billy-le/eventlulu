import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import {
  subWeeks,
  subMonths,
  subQuarters,
  subYears,
  startOfWeek,
  startOfMonth,
  startOfQuarter,
  startOfYear,
} from "date-fns";

function calcGrowthRate(previous: number, current: number) {
  return previous === current
    ? null
    : previous > 0
    ? parseFloat((((current - previous) / previous) * 100).toFixed(2))
    : 100;
}

export const dashboardRouter = createTRPCRouter({
  getDashboardStats: publicProcedure
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
        mode: z.enum(["weekly", "monthly", "quarterly", "yearly"]),
      })
    )
    .query(async ({ ctx, input }) => {
      let prevDate: Date;
      switch (input.mode) {
        case "weekly":
          prevDate = startOfWeek(subWeeks(input.from, 1));
          break;
        case "monthly":
          prevDate = startOfMonth(subMonths(input.from, 1));
          break;
        case "quarterly":
          prevDate = startOfQuarter(subQuarters(input.from, 1));
          break;
        case "yearly":
          prevDate = startOfYear(subYears(input.from, 1));
          break;
      }

      try {
        const leadsGenerated = await ctx.prisma.leadForm.count({
          where: {
            createDate: {
              gte: input.from,
              lte: input.to,
            },
          },
        });

        const previousLeadsGenerated = await ctx.prisma.leadForm.count({
          where: {
            createDate: {
              gte: prevDate,
              lte: input.from,
            },
          },
        });

        const leadGenerationGrowth = calcGrowthRate(
          previousLeadsGenerated,
          leadsGenerated
        );

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

        const previousLeads = await ctx.prisma.leadForm.findMany({
          where: {
            startDate: {
              gte: prevDate,
              lte: input.from,
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

        const previousConfirmedRevenue = previousLeads.reduce((acc, lead) => {
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

        const revenueGrowth = calcGrowthRate(
          previousConfirmedRevenue,
          confirmedRevenue
        );

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

        const previousPotentialRevenue = previousLeads.reduce((acc, lead) => {
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

        const potentialGrowth = calcGrowthRate(
          previousPotentialRevenue,
          potentialRevenue
        );

        const eventsHappening = leads.filter(
          (lead) => lead.status === "confirmed"
        ).length;
        const previousEventsHappening = previousLeads.filter(
          (lead) => lead.status === "confirmed"
        ).length;
        const eventsGrowth = calcGrowthRate(
          previousEventsHappening,
          eventsHappening
        );

        return {
          confirmedRevenue,
          leadsGenerated,
          potentialRevenue,
          eventsHappening,
          leadGenerationGrowth,
          revenueGrowth,
          potentialGrowth,
          eventsGrowth,
        };
      } catch (err) {
        return {
          confirmedRevenue: 0,
          leadsGenerated: 0,
          potentialRevenue: 0,
          eventsHappening: 0,
          leadGenerationGrowth: 0,
          revenueGrowth: 0,
          potentialGrowth: 0,
          eventsGrowth: 0,
        };
      }
    }),
  getDashboardOverview: publicProcedure
    .input(
      z.object({
        from: z.date().optional(),
        to: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const leads = await ctx.prisma.leadForm.findMany({
        where: {
          startDate: {
            gte: input.from,
            lte: input.to,
          },
        },
        select: {
          id: true,
          createDate: true,
          status: true,
          startDate: true,
          endDate: true,
          rateType: true,
          roomsBudget: true,
          banquetsBudget: true,
          contact: {
            select: {
              firstName: true,
            },
          },
          eventDetails: {
            select: {
              date: true,
              functionRoom: true,
              startTime: true,
              endTime: true,
              rate: true,
              pax: true,
            },
          },
        },
      });

      return leads;
    }),

  /**
   * TODO - add getOverviewStats - avg/mean time to send proposals, avg/mean time to confirmation, avg time to lost,
   * avg/mean event duration in hours/days, revenue per event per day, most popular event type, number of repeat clients,
   * number of new clients,
   */
});
