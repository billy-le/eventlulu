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
import { MoreHorizontal, Plus } from "lucide-react";

export default function HomePage() {
  const { data: leads } = api.leads.getLeads.useQuery();

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
            header: "Event Date",
            cell: ({ row }) => {
              const lead = row.original;

              return (
                <>
                  <div>{datefns.format(lead.startDate, "MMM d, yyyy")}</div>
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
                  <div>{lead.contact?.firstName}</div>
                  <div>{lead.contact?.email}</div>
                  <div>{lead.contact?.phoneNumber}</div>
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
                      : "Not yet sent"}
                  </div>
                </>
              );
            },
          },
          {
            id: "actions",
            cell: ({ row }) => {
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
                    <DropdownMenuItem>Mark as Sent</DropdownMenuItem>
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
