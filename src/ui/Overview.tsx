import { useEffect, useState, useMemo } from "react";

// components
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverPortal,
} from "@radix-ui/react-popover";

// helpers
import { cn } from "@/lib/utils";
import {
  addDays,
  format as dateFormat,
  isAfter,
  isSameDay,
  isSameMonth,
  isToday,
  isWithinInterval,
  formatDistanceToNow,
  formatDistance,
} from "date-fns";

import type { RouterOutputs } from "~/utils/api";
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

  const tentatives = useMemo(
    () => leads.filter((lead) => lead.status === "tentative"),
    [leads]
  );
  const confirms = useMemo(
    () => leads.filter((lead) => lead.status === "confirmed"),
    [leads]
  );

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
                  isSameDay(t.startDate, day.date)
                );
                const confirmedCount = confirms.filter((c) =>
                  isSameDay(c.startDate, day.date)
                );

                return (
                  <div
                    className={`relative h-20 w-full p-1 ${
                      today ? "isolate ring ring-pink-200" : ""
                    } ${!insideDay ? "bg-gray-300 opacity-50" : ""}`}
                  >
                    <div className="text-right">
                      {dateFormat(day.date, "d")}
                    </div>
                    <div className="absolute bottom-1 flex gap-2">
                      {confirmedCount.length > 0 && (
                        <Popover>
                          <PopoverTrigger>
                            <div className="grid h-6 w-6 place-items-center rounded-full bg-green-200 text-xs shadow-sm">
                              <span className="sr-only">
                                view confirmed events
                              </span>
                              {confirmedCount.length}
                            </div>
                          </PopoverTrigger>
                          <PopoverPortal>
                            <PopoverContent className="max-h-60 w-40 overflow-y-auto rounded-md bg-white p-2 shadow-md">
                              <ul className="space-y-2">
                                {confirmedCount.map((confirmed) => {
                                  const eventDetail =
                                    confirmed.eventDetails.find((d) =>
                                      isSameDay(d.date, day.date)
                                    );
                                  const start = new Date(eventDetail?.date);
                                  let end: Date | undefined = new Date(
                                    eventDetail?.date
                                  );

                                  start.setSeconds(0);
                                  start.setMilliseconds(0);
                                  end.setSeconds(0);
                                  end.setMilliseconds(0);
                                  const [shours, sminutes] =
                                    eventDetail?.startTime?.split(":") ?? [];
                                  const [ehours, eminutes] =
                                    eventDetail?.endTime?.split(":") ?? [];
                                  if (shours) {
                                    start.setHours(parseInt(shours, 10));
                                  }
                                  if (sminutes) {
                                    start.setMinutes(parseInt(sminutes, 10));
                                  }
                                  if (ehours) {
                                    end.setHours(parseInt(ehours, 10));
                                  }
                                  if (eminutes) {
                                    end.setMinutes(parseInt(eminutes), 10);
                                  }
                                  if (isAfter(start, end)) {
                                    end = addDays(end, 1);
                                  }

                                  return (
                                    <li key={confirmed.id} className="text-xs">
                                      <p className="flex items-center gap-1">
                                        <span>
                                          {confirmed.contact?.firstName}
                                        </span>
                                        {isWithinInterval(new Date(), {
                                          start,
                                          end,
                                        }) ? (
                                          <div className="relative grid place-items-center">
                                            <div className="absolute h-2 w-2 rounded-full bg-green-400"></div>
                                            <div className="absolute h-2 w-2 animate-ping rounded-full bg-green-600"></div>
                                          </div>
                                        ) : (
                                          <span className="text-gray-400">
                                            -{" "}
                                            {formatDistanceToNow(start, {
                                              addSuffix: true,
                                            })}
                                          </span>
                                        )}
                                      </p>
                                      {eventDetail?.functionRoom && (
                                        <p className="capitalize">
                                          {eventDetail.functionRoom.name}
                                        </p>
                                      )}
                                      <p>
                                        {dateFormat(start, "hh:mm a")} -{" "}
                                        {dateFormat(end, "hh:mm a")}
                                      </p>
                                    </li>
                                  );
                                })}
                              </ul>
                            </PopoverContent>
                          </PopoverPortal>
                        </Popover>
                      )}
                      {tentativeCount.length > 0 && (
                        <Popover>
                          <PopoverTrigger>
                            <div className="grid h-6 w-6 place-items-center rounded-full bg-yellow-200 text-xs shadow-sm">
                              <span className="sr-only">
                                view tentative events
                              </span>
                              {tentativeCount.length}
                            </div>
                          </PopoverTrigger>
                          <PopoverPortal>
                            <PopoverContent className="max-h-60 w-40 overflow-y-auto rounded-md bg-white p-2 shadow-md">
                              <ul>
                                {tentativeCount.map((tentative) => {
                                  return (
                                    <li key={tentative.id} className="text-xs">
                                      <span>
                                        {tentative.contact?.firstName}
                                      </span>
                                    </li>
                                  );
                                })}
                              </ul>
                            </PopoverContent>
                          </PopoverPortal>
                        </Popover>
                      )}
                    </div>
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
