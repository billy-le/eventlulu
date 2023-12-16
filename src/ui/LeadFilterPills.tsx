"use client";

// core
import { useMemo } from "react";

// components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// helpers
import { format as dateFormat } from "date-fns";

// interfaces
import type { RouterOutputs } from "~/utils/api";
import type { LeadsPageFilters } from "~/pages/leads";

const filterKeyText = {
  eventTypes: "Type",
  activities: "Activity",
  statuses: "Status",
  dateRange: "Date Range",
} as const;

export function LeadFilterPills({
  filters,
  setFilters,
  eventTypes,
}: {
  filters: LeadsPageFilters;
  setFilters: React.Dispatch<React.SetStateAction<LeadsPageFilters>>;
  eventTypes: RouterOutputs["eventTypes"]["getEventTypes"];
}) {
  const filterEntries = useMemo(() => {
    return Object.entries(filters);
  }, [filters]);

  console.log(filterEntries);

  if (!filterEntries.filter(([, arr]) => arr.length).length) {
    return null;
  }

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {filterEntries.map(([key, values]) => {
        if (!values.length) return null;
        return values.map((value) => {
          if (typeof value === "string") {
            return (
              <Badge key={value} className="capitalize" variant="secondary">
                <span className="mr-1 text-xs text-slate-500">
                  {filterKeyText[key as keyof LeadsPageFilters]}:
                </span>
                <span className="mr-1">{value}</span>
                <Button
                  variant="ghost"
                  type="button"
                  className="h-6 w-6 p-0 text-pink-500"
                  onClick={() => {
                    if (key === "eventTypes" && filters.eventTypes.length > 1) {
                      const removeActivities = eventTypes.filter(
                        (eventType) => eventType.name === value
                      );
                      const activities = filters.activities.filter(
                        (activity) =>
                          !removeActivities.find((a) => a.activity === activity)
                      );
                      setFilters((filters) => ({
                        ...filters,
                        [key]: filters[key].filter((f) => f !== value),
                        activities,
                      }));
                    } else {
                      setFilters((filters) => ({
                        ...filters,
                        [key]: filters[key as keyof LeadsPageFilters].filter(
                          (f) => f !== value
                        ),
                      }));
                    }
                  }}
                >
                  <X size="12" />
                </Button>
              </Badge>
            );
          } else if (value?.from instanceof Date) {
            return (
              <Badge
                key={value.from?.getMilliseconds()}
                className="capitalize"
                variant="secondary"
              >
                <span className="mr-1 text-xs text-slate-500">
                  {filterKeyText[key as keyof LeadsPageFilters]}:
                </span>
                <span className="mr-1">
                  {dateFormat(value.from, "MM/dd/yyyy")}
                </span>
                <Button
                  variant="ghost"
                  type="button"
                  className="h-6 w-6 p-0 text-pink-500"
                  onClick={() => {
                    setFilters((filters) => ({
                      ...filters,
                      dateRange: filters.dateRange.filter(
                        (date) =>
                          date.from !== value.from && date.to !== value.to
                      ),
                    }));
                  }}
                >
                  <X size="12" />
                </Button>
              </Badge>
            );
          }
        });
      })}
    </div>
  );
}
