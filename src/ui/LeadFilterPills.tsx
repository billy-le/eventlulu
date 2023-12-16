"use client";

// components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { X } from "lucide-react";

// helpers
import { EventStatus } from "@prisma/client";

// interfaces
import { RouterOutputs } from "~/utils/api";
import { useMemo } from "react";

const filterKeyText = {
  eventTypes: "Type",
  activities: "Activity",
  statuses: "Status",
} as const;

export function LeadFilterPills({
  filters,
  setFilters,
  eventTypes,
}: {
  filters: {
    eventTypes: string[];
    activities: string[];
    statuses: EventStatus[];
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      eventTypes: string[];
      activities: string[];
      statuses: EventStatus[];
    }>
  >;
  eventTypes: RouterOutputs["eventTypes"]["getEventTypes"];
}) {
  const filterEntries = useMemo(() => {
    return Object.entries(filters);
  }, [filters]);

  if (!filterEntries.filter(([, arr]) => arr.length).length) {
    return null;
  }

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {filterEntries.map(([key, values]) => {
        if (!values.length) return null;
        return values.map((value) => (
          <Badge key={value} className="capitalize" variant="secondary">
            <span className="mr-1 text-xs text-slate-500">
              {filterKeyText[key as keyof typeof filters]}:
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
                    [key]: filters[key as keyof typeof filters].filter(
                      (f) => f !== value
                    ),
                    activities,
                  }));
                } else {
                  setFilters((filters) => ({
                    ...filters,
                    [key]: filters[key as keyof typeof filters].filter(
                      (f) => f !== value
                    ),
                  }));
                }
              }}
            >
              <X size="12" />
            </Button>
          </Badge>
        ));
      })}
    </div>
  );
}
