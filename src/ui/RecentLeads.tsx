"use client";

import { Calendar } from "lucide-react";
import { eventIcons } from "~/utils/eventIcons";
import { getStatusIcon } from "~/utils/statusColors";
import type { RouterOutputs } from "~/utils/api";

export function RecentLeads({
  leads,
}: {
  leads: RouterOutputs["leads"]["getLeads"];
}) {
  return (
    <div className="space-y-8">
      {leads.map((lead) => {
        const contact = lead.contact;
        const budget = (lead.roomsBudget ?? 0) + (lead.banquetsBudget ?? 0);
        const eventCosts = lead.eventDetails.reduce(
          (sum: number, detail: any) => {
            if (lead.rateType?.name?.toLowerCase() === "per person") {
              return sum + (detail?.pax ?? 0) * (detail?.rate ?? 0);
            } else {
              return sum + (detail?.rate ?? 0);
            }
          },
          0
        );
        const total = budget + eventCosts;

        const Icon =
          eventIcons[lead.eventType?.activity as keyof typeof eventIcons] ??
          Calendar;

        return (
          <div key={lead.id} className="flex items-center">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-tr from-blue-300 to-pink-400">
              <span className="sr-only">
                {lead.eventType?.activity ?? "Other"}
              </span>
              <Icon className="text-white" size="20" />
            </div>
            <div className="ml-4 space-y-1">
              <div className="flex gap-2">
                <p className="text-sm font-medium leading-none">
                  {contact?.firstName ?? ""} {contact?.lastName ?? ""}
                </p>
                {getStatusIcon[lead.status]({
                  size: "14",
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {contact?.email ?? ""}
              </p>
            </div>
            <div className="ml-auto font-medium">
              <span className="text-slate-400">≈</span>{" "}
              {new Intl.NumberFormat("en", {
                currency: "PHP",
                style: "currency",
              }).format(total)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
