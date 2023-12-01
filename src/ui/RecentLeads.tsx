import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

export function RecentLeads({ leads }: { leads: any[] }) {
  return (
    <div className="space-y-8">
      {leads.map((lead) => {
        const contact = lead.contact;
        return (
          <div key={lead.id} className="flex items-center">
            <Avatar className="grid h-9 w-9 place-items-center bg-gradient-to-tr from-blue-400 to-pink-400">
              <User className="text-slate-50" />
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {contact?.firstName ?? ""} {contact?.lastName ?? ""}
              </p>
              <p className="text-sm text-muted-foreground">
                {contact?.email ?? ""}
              </p>
            </div>
            <div className="ml-auto font-medium">ad</div>
          </div>
        );
      })}
    </div>
  );
}
