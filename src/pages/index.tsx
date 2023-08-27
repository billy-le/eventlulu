"use client";

import { api } from "~/utils/api";

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
import { MoreHorizontal } from "lucide-react";

export default function Home() {
  const { data: leads } = api.leads.getLeads.useQuery();

  return (
    <DefaultLayout>
      <DataTable
        columns={[
          {
            accessorKey: "createDate",
            header: "Event Date",
            cell: ({ row }) => {
              const lead = row.original;
              return <></>;
            },
          },
          {
            accessorKey: "contact",
            header: "Contact",
            cell: ({ row }) => {
              const lead = row.original;

              return <></>;
            },
          },
          {
            accessorKey: "amount",
            header: "Amount",
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
