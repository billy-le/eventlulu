"use client";

import { api } from "~/utils/api";
import * as datefns from "date-fns";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DefaultLayout } from "~/layouts/default";
import { DataTable } from "~/ui/DataTable";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import {
  LucideIcon,
  MoreHorizontal,
  Plus,
  Delete,
  Edit,
  Send,
  Cake,
  Church,
  PartyPopper,
  Crown,
  Gem,
  Briefcase,
  Presentation,
  Projector,
  Users,
  HeartHandshake,
  Utensils,
  Calendar,
} from "lucide-react";
import { eventTypes } from "prisma/seed-data/data";

const eventIcons: Record<
  | (typeof eventTypes.corporate)[number]
  | (typeof eventTypes)["social function"][number],
  LucideIcon
> = {
  "business meeting": Briefcase,
  "conference/seminar": Presentation,
  convention: Users,
  "fellowship/team building": HeartHandshake,
  "luncheon/dinner": Utensils,
  "training: planning session": Projector,
  "birthday party": Cake,
  baptismal: Church,
  debut: Crown,
  "kids party": PartyPopper,
  wedding: Gem,
};

export default function HomePage() {
  const { data: leads } = api.leads.getLeads.useQuery();
  const deleteLead = api.leads.delete.useMutation({ networkMode: "always" });

  return (
    <DefaultLayout>
      <Link href="/leads/create">
        <Button className="mb-4" type="button">
          <Plus size="18" className="mr-2" />
          New Lead
        </Button>
      </Link>
      <DataTable
        columns={[
          {
            header: "Event Start Date",
            cell: ({ row }) => {
              const lead = row.original;

              return (
                <>
                  <div>{datefns.format(lead.startDate, "MMM d, yyyy")}</div>
                  <div className="text-xs text-gray-400">
                    For {lead.eventLengthInDays} Days
                  </div>
                  <div className="text-xs text-gray-400">
                    Ending {datefns.format(lead.endDate, "MMM d, yyyy")}
                  </div>
                </>
              );
            },
          },
          {
            header: "Event Type",
            cell: ({ row }) => {
              const lead = row.original;
              const Component =
                eventIcons[
                  lead?.eventType?.activity! as
                    | (typeof eventTypes.corporate)[number]
                    | (typeof eventTypes)["social function"][number]
                ] || Calendar;

              return (
                <>
                  <div className="flex items-center gap-3">
                    <Component size="24" className="text-blue-400" />
                    <div>
                      <div className="capitalize">
                        {lead.eventType?.name ?? "Other"}
                      </div>
                      <div className="text-xs capitalize text-gray-400">
                        {lead.eventType?.activity ?? lead.eventTypeOther}
                      </div>
                    </div>
                  </div>
                </>
              );
            },
          },
          {
            header: "Contact",
            cell: ({ row }) => {
              const lead = row.original;
              return (
                <>
                  <div className="text-lg">{lead.contact?.firstName}</div>
                  <div className="text-xs text-gray-400">
                    {lead.contact?.email}
                  </div>
                  <div className="text-xs text-gray-400">
                    {lead.contact?.phoneNumber}
                  </div>
                </>
              );
            },
          },
          {
            header: "Is Confirmed?",
            cell: ({ row }) => {
              const lead = row.original;

              return (
                <>
                  <div>{lead.isEventConfirmed ? "Yes" : "No"}</div>
                </>
              );
            },
          },
          {
            header: "Last Proposal Sent Date",
            cell: ({ row }) => {
              const lead = row.original;
              return (
                <>
                  <div>
                    {lead.lastDateSent
                      ? datefns.format(lead.lastDateSent, "MMM d, yyyy")
                      : ""}
                  </div>
                </>
              );
            },
          },
          {
            id: "actions",
            cell: ({ row }) => {
              const lead = row.original;
              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Link
                        href={`/leads/${row.original.id}`}
                        className="flex w-full items-center justify-between"
                      >
                        Edit
                        <Edit size="16" />
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Button
                        variant="ghost"
                        className="flex h-auto w-full items-center justify-between p-0 font-normal"
                        onClick={() => {
                          deleteLead.mutate(lead.id, {
                            onSuccess: (data) => {
                              console.log(data);
                            },
                          });
                        }}
                      >
                        Delete
                        <Delete size="16" />
                      </Button>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div className="flex w-full items-center justify-between">
                        Mark as Sent
                        <Send size="16" />
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Generate Proposal PDF</DropdownMenuItem>
                    <DropdownMenuItem>Generate Lead Form PDF</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            },
          },
        ]}
        data={leads || []}
      />
    </DefaultLayout>
  );
}
