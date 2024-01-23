"use client";

import { useState } from "react";
import { api } from "~/utils/api";

// components
import { Calendar } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

// helpers
import { eventIcons } from "~/utils/eventIcons";
import { getStatusIcon } from "~/utils/statusColors";

// types
import type { RouterOutputs } from "~/utils/api";
import type { EventStatus } from "@prisma/client";

export function RecentLeads({
  leads,
}: {
  leads: RouterOutputs["leads"]["getLeads"];
}) {
  const [openId, setIsOpenId] = useState<string | null>(null);
  const utils = api.useContext();

  const { mutate: updateStatus } = api.leads.updateStatus.useMutation({
    onSettled: () => {
      utils.leads.invalidate();
    },
  });

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
                <Popover open={openId === lead.id}>
                  <PopoverTrigger
                    onClick={() => {
                      setIsOpenId(lead.id);
                    }}
                  >
                    {getStatusIcon[lead.status]({
                      size: "14",
                    })}
                  </PopoverTrigger>
                  <PopoverContent
                    side="right"
                    className="w-fit rounded-full p-0"
                    onInteractOutside={() => {
                      setIsOpenId(null);
                    }}
                  >
                    <div className="flex gap-1">
                      {Object.entries(getStatusIcon)
                        .filter(([key]) => key != lead.status)
                        .map(([key, Icon]) => (
                          <Button
                            key={key}
                            onClick={() => {
                              updateStatus({
                                id: lead.id,
                                status: key as EventStatus,
                              });
                              setIsOpenId(null);
                            }}
                            size="icon"
                            variant="ghost"
                            className="rounded-full"
                          >
                            <span className="sr-only">
                              change status to {key}
                            </span>
                            <Icon size={16} />
                          </Button>
                        ))}
                    </div>
                  </PopoverContent>
                </Popover>
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
