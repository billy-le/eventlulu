import { Calendar } from "lucide-react";
import { eventIcons } from "~/utils/eventIcons";

export function RecentLeads({ leads }: { leads: any[] }) {
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
          eventIcons[lead.eventType.activity as keyof typeof eventIcons] ??
          Calendar;

        return (
          <div key={lead.id} className="flex items-center">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-tr from-blue-300 to-pink-400">
              <span className="sr-only">{lead.eventType.activity}</span>
              <Icon className="text-white" size="20" />
            </div>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {contact?.firstName ?? ""} {contact?.lastName ?? ""}
              </p>
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
