import { Frown, CalendarCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EventStatus } from "@prisma/client";
import type { LucideIcon } from "lucide-react";

export const statusColors: Record<EventStatus, string> = {
  tentative: "bg-yellow-400/20 text-yellow-500",
  lost: "bg-red-400/20 text-red-500",
  confirmed: "bg-green-400/20 text-green-500",
};

export const getStatusIcon: Record<
  EventStatus,
  (props: React.ComponentProps<LucideIcon>) => React.ReactNode
> = {
  tentative: ({ className, ...props }) => (
    <AlertTriangle {...props} className={cn("text-yellow-400", className)} />
  ),
  lost: ({ className, ...props }) => (
    <Frown {...props} className={cn("text-red-400", className)} />
  ),
  confirmed: ({ className, ...props }) => (
    <CalendarCheck {...props} className={cn("text-green-400", className)} />
  ),
};
