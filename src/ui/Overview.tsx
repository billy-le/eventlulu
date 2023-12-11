import { useState } from "react";

// components
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check } from "lucide-react";

// helpers
import { cn } from "@/lib/utils";

import type { RouterOutputs } from "~/utils/api";
import type { DateRangeData } from "./DateRangeMode";
import { OverviewCalendar } from "./OverviewCalendar";
import { OverviewTrends } from "./OverviewTrends";
const overviewItems = ["calendar", "trends", "stats"] as const;
const trendItems = [
  "status count",
  "lead generation",
  "revenue growth",
] as const;
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
  const [trend, setTrend] = useState<TrendItem>("status count");

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Overview</CardTitle>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-between gap-2 rounded-md px-2 py-1 capitalize ring-1 ring-slate-200">
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
            <DropdownMenu>
              <DropdownMenuTrigger
                className={`w-48 items-center justify-between gap-2 rounded-md px-2 py-1 capitalize ring-1 ring-slate-200 transition-all duration-300 ease-linear ${
                  overview === "trends" ? "flex" : "hidden"
                }`}
              >
                {trend}
                <ChevronDown size="20" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                {trendItems.map((item) => (
                  <DropdownMenuItem
                    className="capitalize"
                    onClick={() => {
                      if (item !== trend) {
                        setTrend(item);
                      }
                    }}
                  >
                    {item}
                    {item === trend && (
                      <Check className="ml-2 text-purple-400" size="20" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {overview === "calendar" ? (
          <OverviewCalendar leads={leads} dateRange={dateRange} />
        ) : overview === "trends" ? (
          <OverviewTrends trend={trend} leads={leads} dateRange={dateRange} />
        ) : null}
      </CardContent>
    </Card>
  );
}

Overview.defaultProps = {
  className: "",
};

export type TrendItem = (typeof trendItems)[number];
