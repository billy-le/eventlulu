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
  MoreHorizontal,
  Plus,
  Delete,
  Edit,
  Send,
  Calendar,
  Phone,
  Mail,
  User2,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRef, useState } from "react";
import { LeadSummaryModal } from "~/ui/LeadSummaryModal";
import { eventIcons } from "~/utils/eventIcons";
import { statusColors } from "~/utils/statusColors";

export default function HomePage() {
  const { toast } = useToast();
  const { data: leads = [], refetch: refetchLeads } =
    api.leads.getLeads.useQuery();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [lead, setLead] = useState<(typeof leads)[number] | null>(null);

  const deleteLead = api.leads.deleteLead.useMutation();
  const markAsSent = api.leads.sentLead.useMutation();

  return (
    <DefaultLayout>
      <DataTable
        actionButtons={[
          <Link href="/leads/create">
            <Button type="button">
              <Plus size="18" className="mr-2" />
              New Lead
            </Button>
          </Link>,
        ]}
        onRowClick={(data) => {
          if (dialogRef.current) {
            setLead(data);
            dialogRef.current.showModal();
          }
        }}
        columns={[
          {
            accessorKey: "startDate",
            header: ({ column }) => {
              const isAscending = column.getIsSorted() === "asc";
              return (
                <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(isAscending)}
                  className="space-x-2"
                >
                  <span>Event Date</span>
                  {isAscending ? (
                    <ArrowDown size="20" />
                  ) : (
                    <ArrowUp size="20" />
                  )}
                </Button>
              );
            },
            cell: ({ row }) => {
              const lead = row.original;
              const isSameDay = datefns.isSameDay(lead.startDate, lead.endDate);
              return (
                <>
                  {datefns.format(lead.startDate, "MMM d, yyyy")}
                  {isSameDay
                    ? ""
                    : ` - ${datefns.format(lead.endDate, "MMM d, yyyy")}`}
                </>
              );
            },
          },
          {
            accessorKey: "eventType.activity",
            header: ({ column }) => {
              const isAscending = column.getIsSorted() === "asc";
              return (
                <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(isAscending)}
                  className="space-x-2"
                >
                  <span>Event Type</span>
                  {isAscending ? (
                    <ArrowDown size="20" />
                  ) : (
                    <ArrowUp size="20" />
                  )}
                </Button>
              );
            },
            cell: ({ row }) => {
              const lead = row.original;
              const Component =
                eventIcons[
                  lead?.eventType?.activity! as keyof typeof eventIcons
                ] || Calendar;

              return (
                <>
                  <div className="flex items-center gap-3">
                    <Component size="24" className="text-blue-400" />
                    <div>
                      <div className="capitalize">
                        {lead.eventType?.activity ?? lead.eventTypeOther}
                      </div>
                      <div className="text-xs capitalize text-gray-400">
                        {lead.eventType?.name === "corporate"
                          ? lead.company?.name ?? ""
                          : lead.eventType?.name === "social function"
                          ? ""
                          : "Other"}
                      </div>
                    </div>
                  </div>
                </>
              );
            },
          },
          {
            accessorKey: "contact.firstName",
            header: ({ column }) => {
              const isAscending = column.getIsSorted() === "asc";
              return (
                <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(isAscending)}
                  className="space-x-2"
                >
                  <span>Contact</span>
                  {isAscending ? (
                    <ArrowDown size="20" />
                  ) : (
                    <ArrowUp size="20" />
                  )}
                </Button>
              );
            },
            cell: ({ row }) => {
              const lead = row.original;
              return (
                <div className="space-y-1">
                  {lead.contact?.firstName && (
                    <div className="flex items-center gap-3">
                      <User2 size="14" className="text-blue-400" />
                      {lead.contact?.firstName} {lead.contact?.lastName}
                    </div>
                  )}
                  {lead.contact?.email && (
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <Mail size="14" className="text-purple-400" />{" "}
                      {lead.contact?.email}
                    </div>
                  )}
                  {lead.contact?.phoneNumber && (
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <Phone size="14" className="text-emerald-400" />{" "}
                      {lead.contact?.phoneNumber}
                    </div>
                  )}
                </div>
              );
            },
          },
          {
            accessorKey: "status",
            header: ({ column }) => {
              const isAscending = column.getIsSorted() === "asc";
              return (
                <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(isAscending)}
                  className="space-x-2"
                >
                  <span>Status</span>
                  {isAscending ? (
                    <ArrowDown size="20" />
                  ) : (
                    <ArrowUp size="20" />
                  )}
                </Button>
              );
            },
            cell: ({ row }) => {
              const lead = row.original;

              return (
                <>
                  <div
                    className={`rounded ${
                      statusColors[lead.status]
                    } w-fit px-2 py-1 text-center text-xs uppercase`}
                  >
                    {lead.status}
                  </div>
                </>
              );
            },
          },
          {
            accessorKey: "lastDateSent",
            header: ({ column }) => {
              const isAscending = column.getIsSorted() === "asc";
              return (
                <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(isAscending)}
                  className="space-x-2"
                >
                  <span>Last Proposal Sent Date</span>
                  {isAscending ? (
                    <ArrowDown size="20" />
                  ) : (
                    <ArrowUp size="20" />
                  )}
                </Button>
              );
            },
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
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Link
                        href={`/leads/${row.original.id}`}
                        className="flex w-full items-center justify-between"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
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
                              const t = toast({
                                title: "Success",
                                description: "Lead has been deleted",
                              });
                              refetchLeads();
                            },
                            onError: () => {
                              toast({
                                title: "Failed",
                                description: "There was an error",
                                variant: "destructive",
                              });
                            },
                          });
                        }}
                      >
                        Delete
                        <Delete size="16" />
                      </Button>
                    </DropdownMenuItem>
                    {!lead.lastDateSent && (
                      <DropdownMenuItem>
                        <Button
                          variant="ghost"
                          className="flex h-auto w-full items-center justify-between p-0 font-normal"
                          onClick={() => {
                            markAsSent.mutate(
                              { id: lead.id, date: new Date() },
                              {
                                onSuccess: (data) => {
                                  toast({
                                    title: "Success",
                                    description:
                                      "Lead has been marked with today's date",
                                  });
                                  refetchLeads();
                                },
                                onError: () => {
                                  toast({
                                    title: "Failed",
                                    description: "There was an error",
                                    variant: "destructive",
                                  });
                                },
                              }
                            );
                          }}
                        >
                          Mark as Sent
                          <Send size="16" />
                        </Button>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link href={`/proposals/${lead.id}`}>
                        Generate Proposal
                      </Link>
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem>Generate Lead Form PDF</DropdownMenuItem> */}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            },
          },
        ]}
        data={leads}
      />
      <LeadSummaryModal ref={dialogRef} lead={lead} />
    </DefaultLayout>
  );
}
