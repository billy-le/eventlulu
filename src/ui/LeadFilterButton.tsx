"use client";

// core
import React from "react";

// components
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSub,
} from "@/components/ui/dropdown-menu";
import { Check, Filter } from "lucide-react";

// helpers
import { EventStatus } from "@prisma/client";

// interfaces
import type { RouterOutputs } from "~/utils/api";
import type { LeadsPageFilters } from "~/pages/leads";
import { DatePicker } from "./DatePicker";
import { DateRangePicker } from "./DateRangePicker";
import { endOfDay, startOfDay } from "date-fns";

const parentEventTypes = ["corporate", "social function"];

export function LeadFilterButton({
  filters,
  setFilters,
  eventTypes,
}: {
  filters: LeadsPageFilters;
  setFilters: React.Dispatch<React.SetStateAction<LeadsPageFilters>>;
  eventTypes: RouterOutputs["eventTypes"]["getEventTypes"];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="h-10">
        <Button className="h-10 w-12 p-0">
          <span className="sr-only">Open Filter Menu</span>
          <Filter size="16" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span>Event Type</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {parentEventTypes.concat("other").map((eventType) => (
                <React.Fragment key={eventType}>
                  {eventType === "other" && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setFilters((filters) => {
                        if (eventType === "other") {
                          return {
                            ...filters,
                            eventTypes: filters.eventTypes.includes("other")
                              ? []
                              : ["other"],
                            activities: [],
                          };
                        }

                        const withoutOther = filters.eventTypes.filter(
                          (type) => type !== "other"
                        );

                        return {
                          ...filters,
                          eventTypes: withoutOther.includes(eventType)
                            ? withoutOther.filter((f) => f !== eventType)
                            : withoutOther.concat(eventType),
                        };
                      });
                    }}
                    className="capitalize"
                  >
                    <div className="flex items-center gap-2">
                      <span>
                        {filters.eventTypes.includes(eventType) && (
                          <Check size="16" className="text-pink-400" />
                        )}
                      </span>
                      {eventType}
                    </div>
                  </DropdownMenuItem>
                </React.Fragment>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        {eventTypes.length > 0 && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>Event Activity</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {eventTypes
                  .sort((a, b) => a.activity.localeCompare(b.activity))
                  .map(({ name, activity }) => {
                    let isDisabled = false;
                    const pEventTypes = filters.eventTypes.filter(
                      (f) => f !== name
                    );
                    if (pEventTypes.length) {
                      isDisabled = true;
                    }
                    if (filters.eventTypes.length === parentEventTypes.length) {
                      isDisabled = false;
                    }

                    return (
                      <DropdownMenuItem
                        key={activity}
                        className="capitalize"
                        disabled={isDisabled}
                        onSelect={(e) => {
                          e.preventDefault();
                          setFilters((filters) => ({
                            ...filters,
                            activities: filters.activities.includes(activity)
                              ? filters.activities.filter((f) => f !== activity)
                              : filters.activities.concat(activity),
                          }));
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span>
                            {filters.activities.includes(activity) && (
                              <Check size="16" className="text-pink-400" />
                            )}
                          </span>
                          {activity}
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        )}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span>Status</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {Object.values(EventStatus).map((status) => (
                <DropdownMenuItem
                  key={status}
                  className="capitalize"
                  onSelect={(e) => {
                    e.preventDefault();
                    setFilters((filters) => ({
                      ...filters,
                      statuses: filters.statuses.includes(status)
                        ? filters.statuses.filter((f) => f !== status)
                        : filters.statuses.concat(status),
                    }));
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span>
                      {filters.statuses.includes(status) && (
                        <Check size="16" className="text-pink-400" />
                      )}
                    </span>
                    {status}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span>Date Range</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DateRangePicker
                dateRange={filters.dateRange[0]}
                onDateChange={(dateRange) => {
                  if (dateRange?.from) {
                    setFilters({
                      ...filters,
                      dateRange: [
                        {
                          from: startOfDay(dateRange.from),
                          to: endOfDay(dateRange?.to ?? dateRange.from),
                        },
                      ],
                    });
                  }
                }}
              />
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
