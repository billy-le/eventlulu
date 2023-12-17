import { useMemo } from "react";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  TooltipProps,
} from "recharts";

// helpers
import {
  addDays,
  addMonths,
  format as dateFormat,
  isSameDay,
  isSameMonth,
} from "date-fns";

// types
import type { DateRangeData } from "./DateRangeMode";
import type { RouterOutputs } from "~/utils/api";
import type { TrendItem } from "./Overview";
import type { EventStatus } from "@prisma/client";
import millify from "millify";

function getStatusCountData(
  date: Date,
  mode: DateRangeData["mode"],
  status: EventStatus,
  leads: RouterOutputs["dashboard"]["getDashboardOverview"]
) {
  switch (mode) {
    case "weekly":
    case "monthly":
      return leads.filter(
        (lead) => isSameDay(lead.startDate, date) && lead.status === status
      );
    case "quarterly":
    case "yearly":
      return leads.filter(
        (lead) => isSameMonth(lead.startDate, date) && lead.status === status
      );
  }
}

function getLeadGenerationData(
  date: Date,
  mode: DateRangeData["mode"],
  leads: RouterOutputs["dashboard"]["getDashboardOverview"]
) {
  switch (mode) {
    case "weekly":
    case "monthly":
      return leads.filter((lead) => isSameDay(lead.createDate, date));
    case "quarterly":
    case "yearly":
      return leads.filter((lead) => isSameMonth(lead.createDate, date));
  }
}

function getRevenueGrowthData(
  date: Date,
  mode: DateRangeData["mode"],
  leads: RouterOutputs["dashboard"]["getDashboardOverview"]
) {
  switch (mode) {
    case "weekly":
    case "monthly":
      return leads
        .filter(
          (lead) =>
            isSameDay(lead.startDate, date) && lead.status === "confirmed"
        )
        .reduce((sum, lead) => {
          const banRoomBudget =
            (lead.banquetsBudget ?? 0) + (lead.roomsBudget ?? 0);
          let rate = 0;
          for (const eventDetail of lead.eventDetails) {
            if (lead.rateType?.name == "per person") {
              rate += (eventDetail.rate ?? 0) * (eventDetail.pax ?? 0);
            } else {
              rate += eventDetail.rate ?? 0;
            }
          }
          return sum + banRoomBudget + rate;
        }, 0);
    case "quarterly":
    case "yearly":
      return leads
        .filter(
          (lead) =>
            isSameMonth(lead.startDate, date) && lead.status === "confirmed"
        )
        .reduce((sum, lead) => {
          const banRoomBudget =
            (lead.banquetsBudget ?? 0) + (lead.roomsBudget ?? 0);
          let rate = 0;
          for (const eventDetail of lead.eventDetails) {
            if (lead.rateType?.name == "per person") {
              rate += (eventDetail.rate ?? 0) * (eventDetail.pax ?? 0);
            } else {
              rate += eventDetail.rate ?? 0;
            }
          }
          return sum + banRoomBudget + rate;
        }, 0);
  }
}

function CustomTooltip({
  active,
  payload,
  label,
}: TooltipProps<string, string> & {}) {
  if (active && payload && payload.length) {
    return (
      <div className="w-32 border border-blue-200 bg-white p-2 shadow-sm">
        <p>{label}</p>
        <p>
          <span className="text-green-500">₱</span>
          {parseInt(payload[0]!.value!, 10)?.toLocaleString()}
        </p>
      </div>
    );
  }

  return null;
}

export function OverviewTrends({
  trend,
  leads,
  dateRange,
}: {
  trend: TrendItem;
  leads: RouterOutputs["dashboard"]["getDashboardOverview"];
  dateRange: DateRangeData;
}) {
  const data = useMemo(() => {
    let dates = [];
    switch (dateRange.mode) {
      case "weekly":
      case "monthly":
        for (let i = dateRange.from!; i < dateRange.to!; i = addDays(i, 1)) {
          dates.push(i);
        }
        break;
      case "quarterly":
      case "yearly":
        for (let i = dateRange.from!; i < dateRange.to!; i = addMonths(i, 1)) {
          dates.push(i);
        }
        break;
    }

    return dates.map((date) => ({
      name:
        dateRange.mode === "weekly"
          ? dateFormat(date, "EEEE")
          : dateRange.mode === "monthly"
          ? dateFormat(date, "M/d")
          : dateRange.mode === "quarterly"
          ? dateFormat(date, "MMMM")
          : dateFormat(date, "MMM"),
      statusCount: {
        confirmed: getStatusCountData(date, dateRange.mode, "confirmed", leads)
          .length,
        tentative: getStatusCountData(date, dateRange.mode, "tentative", leads)
          .length,
        lost: getStatusCountData(date, dateRange.mode, "lost", leads).length,
      },
      leadGeneration: getLeadGenerationData(date, dateRange.mode, leads).length,
      revenueGrowth: getRevenueGrowthData(date, dateRange.mode, leads),
    }));
  }, [leads, dateRange]);

  return (
    <ResponsiveContainer width="100%" height="100%" className="min-h-[560px]">
      <LineChart height={600} width={800} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis
          tickFormatter={
            trend === "revenue growth"
              ? (value, index) => {
                  return millify(parseInt(value, 10));
                }
              : undefined
          }
        />
        <Tooltip
          content={trend === "revenue growth" ? <CustomTooltip /> : undefined}
        />
        <Legend />
        {trend === "status count" ? (
          <>
            <Line
              type="monotone"
              name="Confirmed"
              dataKey="statusCount.confirmed"
              stroke="#4ade80"
            />
            <Line
              type="monotone"
              name="Tentative"
              dataKey="statusCount.tentative"
              stroke="#fbbf24"
            />
            <Line
              type="monotone"
              name="Lost"
              dataKey="statusCount.lost"
              stroke="#f87171"
            />
          </>
        ) : trend === "lead generation" ? (
          <Line
            type="monotone"
            name="Lead Generation"
            dataKey="leadGeneration"
            stroke="#38bdf8"
          />
        ) : trend === "revenue growth" ? (
          <Line
            type="monotone"
            name="Revenue Growth"
            dataKey="revenueGrowth"
            stroke="#38bdf8"
          />
        ) : null}
      </LineChart>
    </ResponsiveContainer>
  );
}
