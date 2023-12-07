import { useEffect, useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  format as dateFormat,
  isSameDay,
  isSameMonth,
  isToday,
} from "date-fns";

import { RouterOutputs } from "~/utils/api";

import type { DateRangeData } from "./DateRangeMode";
const overviewItems = ["calendar", "trends", "stats"] as const;

export function Overview({
  dateRange,
  leads,
  className,
}: {
  leads: RouterOutputs["leads"]["getLeads"];
  dateRange: DateRangeData;
  className?: string;
}) {
  const [overview, setOverview] =
    useState<(typeof overviewItems)[number]>("calendar");
  const [internalDate, setInternalDate] = useState<Date>(
    dateRange.from ?? new Date()
  );

  useEffect(() => {
    setInternalDate(dateRange.from ?? new Date());
  }, [dateRange]);

  const tentatives = leads
    .filter((lead) => lead.status === "tentative")
    .map((lead) => lead.startDate);
  const confirms = leads
    .filter((lead) => lead.status === "confirmed")
    .map((lead) => lead.startDate);

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Overview</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1 capitalize ring-1 ring-slate-200">
              {overview}
              <ChevronDown size="20" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {overviewItems.map((item) => (
                <DropdownMenuItem
                  className="capitalize"
                  onClick={() => {
                    if (item !== overview) {
                      setOverview(item);
                    }
                  }}
                >
                  {item}
                  {item === overview && (
                    <Check className="ml-2 text-purple-400" size="20" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {overview === "calendar" && (
          <Calendar
            fixedWeeks
            classNames={{
              head_row:
                "border-b border-slate-300 divide-x divide-x-slate-300 w-full flex",
              head_cell: "w-full",
              caption_start: "w-full",
              cell: "w-full",
              tbody: "divide-y divide-y-slate-300",
              table: "ring-1 ring-slate-300 w-full",
              row: "w-full flex divide-x divide-x-slate-300",
            }}
            className="p-0"
            modifiers={{
              tentatives,
              confirms,
            }}
            modifiersClassNames={{
              tentatives: "bg-yellow-200",
              confirms: "bg-green-200",
            }}
            month={internalDate}
            disableNavigation={
              dateRange.mode === "weekly" || dateRange.mode === "monthly"
            }
            fromDate={dateRange.from}
            toDate={dateRange.to}
            onMonthChange={setInternalDate}
            components={{
              Day: (day) => {
                const today = isToday(day.date);
                const insideDay = isSameMonth(day.date, internalDate);
                const tentativeCount = tentatives.filter((t) =>
                  isSameDay(t, day.date)
                );
                const confirmedCount = confirms.filter((c) =>
                  isSameDay(c, day.date)
                );
                const counts = [
                  confirmedCount.length,
                  tentativeCount.length,
                ].filter((x) => x);

                return (
                  <div
                    className={`relative h-20 w-full p-1 ${
                      today
                        ? "bg-gradient-to-tr from-pink-200 to-purple-200"
                        : ""
                    } ${!insideDay ? "bg-gray-300 opacity-50" : ""}`}
                  >
                    <div className="text-right">
                      {dateFormat(day.date, "d")}
                    </div>
                    {counts.length > 0 && (
                      <div className="absolute bottom-1 flex gap-2">
                        {counts.map((count, i) => (
                          <div
                            className={`grid h-6 w-6 place-items-center rounded-full text-xs shadow-sm ${
                              i == 0 ? "bg-green-200" : "bg-yellow-200"
                            }`}
                            aria-label={
                              i === 0 ? `Confirmed Events` : "Tentative Events"
                            }
                          >
                            {count}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              },
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}

Overview.defaultProps = {
  className: "",
};
