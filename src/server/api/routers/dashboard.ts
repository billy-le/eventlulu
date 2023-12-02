import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import {
  subDays,
  subWeeks,
  subMonths,
  subQuarters,
  subYears,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfQuarter,
  startOfYear,
} from "date-fns";

function calcGrowthPercentage(previous: number, current: number) {
  return previous === current
    ? 0
    : previous > 0
    ? parseFloat(((current / previous - 1) * 100).toFixed(2))
    : 100;
}

export const dashboardRouter = createTRPCRouter({
  getDashboardStats: protectedProcedure
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
        mode: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]),
      })
    )
    .query(async ({ ctx, input }) => {
      let prevDate: Date;
      switch (input.mode) {
        case "daily":
          prevDate = startOfDay(subDays(input.from, 1));
          break;
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

        const leadGenerationGrowth = calcGrowthPercentage(
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

        const revenueGrowth = calcGrowthPercentage(
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

        const potentialGrowth = calcGrowthPercentage(
          previousPotentialRevenue,
          potentialRevenue
        );

        const eventsHappening = leads.filter(
          (lead) => lead.status === "confirmed"
        ).length;

        return {
          confirmedRevenue,
          leadsGenerated,
          potentialRevenue,
          eventsHappening,
          leadGenerationGrowth,
          revenueGrowth,
          potentialGrowth,
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
        };
      }
    }),
});
