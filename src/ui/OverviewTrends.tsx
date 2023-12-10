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

function getData(
  date: Date,
  mode: DateRangeData["mode"],
  status: RouterOutputs["leads"]["getLeads"][number]["status"],
  leads: RouterOutputs["leads"]["getLeads"]
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

export function OverviewTrends({
  leads,
  dateRange,
}: {
  leads: RouterOutputs["leads"]["getLeads"];
  dateRange: DateRangeData;
}) {
  const data = useMemo(() => {
    let dates = [];
    switch (dateRange.mode) {
      case "weekly":
        for (let i = dateRange.from!; i < dateRange.to!; i = addDays(i, 1)) {
          dates.push(i);
        }
        break;
      case "monthly":
        for (let i = dateRange.from!; i < dateRange.to!; i = addDays(i, 1)) {
          dates.push(i);
        }
        break;
      case "quarterly":
        for (let i = dateRange.from!; i < dateRange.to!; i = addMonths(i, 1)) {
          dates.push(i);
        }
        break;
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
          ? dateFormat(date, "d")
          : dateRange.mode === "quarterly"
          ? dateFormat(date, "MMMM")
          : dateFormat(date, "MMM"),
      confirmed: getData(date, dateRange.mode, "confirmed", leads).length,
      tentative: getData(date, dateRange.mode, "tentative", leads).length,
      lost: getData(date, dateRange.mode, "lost", leads).length,
    }));
  }, [leads, dateRange]);

  return (
    <ResponsiveContainer width="100%" height="100%" className="min-h-[560px]">
      <LineChart height={600} width={800} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="confirmed"
          stroke="#4ade80"
          //   activeBar={<Rectangle className="fill-green-300" />}
          //   className="fill-green-200"
        />
        <Line
          type="monotone"
          dataKey="tentative"
          stroke="#fbbf24"
          //   activeBar={<Rectangle className="fill-yellow-300" />}
          //   className="fill-yellow-200"
        />
        <Line
          type="monotone"
          dataKey="lost"
          stroke="#f87171"
          //   activeBar={<Rectangle className="fill-red-300" />}
          //   className="fill-red-200"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
