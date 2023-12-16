"use client";

// core
import { api } from "~/utils/api";
import {
  isSameDay,
  format as dateFormat,
  isValid as isValidDate,
  startOfDay,
  endOfDay,
} from "date-fns";
import { useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useRouter } from "next/router";

// components
import { Button } from "@/components/ui/button";
import { DataTable } from "~/ui/DataTable";
import { DefaultLayout } from "~/layouts/default";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSub,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
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
  Smartphone,
  Eye,
  ArrowRight,
  HardDriveDownload,
} from "lucide-react";
import { LeadSummaryModal } from "~/ui/LeadSummaryModal";
import { LeadFilterButton } from "~/ui/LeadFilterButton";
import { LeadFilterPills } from "~/ui/LeadFilterPills";

// helpers
import { eventIcons } from "~/utils/eventIcons";
import { getStatusIcon, statusColors } from "~/utils/statusColors";
import { EventStatus } from "@prisma/client";
import { generateBody, generateMailto, generateSubject } from "~/utils/mailto";
import type { DateRange } from "react-day-picker";

export type LeadsPageFilters = {
  eventTypes: string[];
  activities: string[];
  statuses: EventStatus[];
  dateRange: DateRange[];
};

export default function LeadsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [filters, setFilters] = useState<LeadsPageFilters>(() => {
    const eventStatuses = Object.keys(EventStatus) as EventStatus[];
    let validStatuses: EventStatus[] = [];
    let validDate: Date | undefined = undefined;
    const { query } = router;
    if (query.status) {
      validStatuses = (
        Array.isArray(query.status) ? query.status : query.status.split(",")
      ).filter((status) =>
        eventStatuses.includes(status as EventStatus)
      ) as EventStatus[];
    }
    if (query.date && typeof query.date === "string") {
      const date = new Date(query.date);
      if (isValidDate(date)) {
        validDate = date;
      }
    }

    return {
      eventTypes: [],
      activities: [],
      statuses: validStatuses,
      dateRange: [
        {
          from: validDate ? startOfDay(validDate) : undefined,
          to: validDate ? endOfDay(validDate) : undefined,
        },
      ],
    };
  });

  const {
    data: leads = [],
    refetch: refetchLeads,
    isLoading,
  } = api.leads.getLeads.useQuery({
    activities: filters.activities,
    eventTypes: filters.eventTypes,
    statuses: filters.statuses,
    from: filters.dateRange[0]?.from,
    to: filters.dateRange[0]?.to,
  });
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [lead, setLead] = useState<(typeof leads)[number] | null>(null);
  const [search, setSearch] = useState("");
  const deleteLead = api.leads.deleteLead.useMutation();
  const markAsSent = api.leads.sentLead.useMutation();
  const changeStatus = api.leads.updateStatus.useMutation();
  const { data: eventTypes = [] } = api.eventTypes.getEventTypes.useQuery();

  return (
    <DefaultLayout>
      <DataTable
        isLoading={isLoading}
        actionsRow={() => (
          <>
            <div className="mb-4 flex justify-between">
              <div className="flex gap-4">
                <Input
                  placeholder="Find by contact..."
                  value={search}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    const value = event.target.value;
                    setSearch(value);
                  }}
                  className="max-w-sm"
                  type="search"
                />
                <LeadFilterButton
                  filters={filters}
                  setFilters={setFilters}
                  eventTypes={eventTypes}
                />
              </div>
              <Link
                href="/leads/create"
                className="flex items-center rounded-md bg-black px-3 py-1 text-white"
              >
                <Plus size="18" className="mr-2" />
                New Lead
              </Link>
            </div>
            <LeadFilterPills
              filters={filters}
              setFilters={setFilters}
              eventTypes={eventTypes}
            />
          </>
        )}
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
              return (
                <div className="flex items-center gap-1">
                  <div className="grid h-20 w-20 place-items-center rounded-md border border-slate-400 text-center">
                    <div className="text-xs text-slate-700">
                      {dateFormat(lead.startDate, "MMMM")}
                    </div>
                    <div className="text-xl font-bold text-slate-800">
                      {dateFormat(lead.startDate, "d")}
                    </div>
                    <div className="text-xs text-slate-700">
                      {dateFormat(lead.startDate, "yyyy")}
                    </div>
                  </div>
                  {isSameDay(lead.startDate, lead.endDate) ? null : (
                    <>
                      <div>
                        <ArrowRight role="presentation" />
                      </div>
                      <div className="grid h-20 w-20 place-items-center rounded-md border border-slate-400 text-center">
                        <div className="text-xs text-slate-700">
                          {dateFormat(lead.endDate, "MMMM")}
                        </div>
                        <div className="text-xl font-bold text-slate-800">
                          {dateFormat(lead.endDate, "d")}
                        </div>
                        <div className="text-xs text-slate-700">
                          {dateFormat(lead.endDate, "yyyy")}
                        </div>
                      </div>
                    </>
                  )}
                </div>
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
              const contactNumber =
                lead.contact?.mobileNumber ?? lead.contact?.phoneNumber;
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
                  {contactNumber && (
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {lead.contact?.mobileNumber ? (
                        <Smartphone size="14" className="text-emerald-400" />
                      ) : (
                        <Phone size="14" className="text-emerald-400" />
                      )}
                      {contactNumber}
                    </div>
                  )}
                </div>
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
                <div className="flex items-center gap-3">
                  <Component size="24" className="text-blue-400" />
                  <div>
                    <div className="capitalize">
                      {lead.eventType?.name === "corporate"
                        ? lead.company?.name ?? ""
                        : lead.eventType?.name === "social function"
                        ? ""
                        : lead.eventTypeOther ?? ""}
                    </div>
                    <div className="text-xs capitalize text-gray-400">
                      {lead.eventType?.activity ?? "Other"}
                    </div>
                  </div>
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
                <div
                  className={`rounded ${
                    statusColors[lead.status]
                  } w-fit px-2 py-1 text-center text-xs font-bold uppercase`}
                >
                  {lead.status}
                </div>
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
                  <span>Proposal Sent Date</span>
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
              return lead.lastDateSent ? (
                <span>{dateFormat(lead.lastDateSent, "MMM d, yyyy")}</span>
              ) : null;
            },
          },
          {
            id: "actions",
            cell: ({ row }) => {
              const lead = row.original;
              return (
                <div className="flex gap-2">
                  <Link
                    href={`/proposals/${lead.id}`}
                    className="grid h-8 w-8 items-center rounded p-0 hover:bg-slate-100"
                    title="Generate PDF"
                    target="_blank"
                  >
                    <span className="sr-only">Generate Proposal</span>
                    <HardDriveDownload size="16" className="mx-auto" />
                  </Link>
                  <Button
                    variant="ghost"
                    type="button"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      if (dialogRef.current) {
                        setLead(lead);
                        dialogRef.current.showModal();
                      }
                    }}
                    title="View Summary"
                  >
                    <span className="sr-only">View Lead Summary</span>
                    <Eye size="16" />
                  </Button>
                  <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
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
                          <AlertDialogTrigger className="flex w-full items-center justify-between">
                            <div>Delete</div>
                            <Delete size="16" className="text-red-400" />
                          </AlertDialogTrigger>
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <span>Change Status</span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              {Object.values(EventStatus)
                                .filter((status) => status !== lead.status)
                                .map((status) => {
                                  return (
                                    <DropdownMenuItem key={status}>
                                      <Button
                                        variant="ghost"
                                        className="h-auto p-0 font-normal"
                                        onClick={() => {
                                          changeStatus.mutate(
                                            {
                                              id: lead.id,
                                              status: status,
                                            },
                                            {
                                              onSuccess: () => {
                                                toast({
                                                  title: "Success",
                                                  description:
                                                    "Lead has been updated",
                                                });
                                                refetchLeads();
                                              },
                                              onError: () => {
                                                toast({
                                                  title: "Failed",
                                                  description:
                                                    "There was an error",
                                                  variant: "destructive",
                                                });
                                              },
                                            }
                                          );
                                        }}
                                      >
                                        {getStatusIcon[status]({
                                          className: "mr-2 h-4 w-4",
                                        })}
                                        <span className="capitalize">
                                          {status}
                                        </span>
                                      </Button>
                                    </DropdownMenuItem>
                                  );
                                })}
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                        {!lead.lastDateSent && (
                          <DropdownMenuItem>
                            <Button
                              variant="ghost"
                              className="flex h-auto w-full items-center justify-between p-0 font-normal"
                              onClick={() => {
                                markAsSent.mutate(
                                  { id: lead.id, date: new Date() },
                                  {
                                    onSuccess: () => {
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
                          <Link
                            href={`mailto:${generateMailto(
                              lead.contact
                            )}?subject=${generateSubject(lead.eventType!, {
                              eventLengthInDays: lead.eventLengthInDays,
                              from: lead.startDate,
                              to: lead.endDate,
                            })}&body=${generateBody({
                              contact: lead.contact,
                            })}`}
                            target="__blank"
                            rel="noopener noreferrer"
                          >
                            Send Email
                          </Link>
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem>Generate Lead Form PDF</DropdownMenuItem> */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete this lead.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-500"
                          onClick={() => {
                            deleteLead.mutate(lead.id, {
                              onSuccess: () => {
                                toast({
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
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              );
            },
          },
        ]}
        data={leads.filter((lead) => {
          if (search) {
            const containsEmail = lead.contact?.email
              ?.toLowerCase()
              ?.includes(search.toLowerCase());
            const containsFirstName = lead.contact?.firstName
              ?.toLowerCase()
              ?.includes(search.toLowerCase());
            const containsLastName = lead.contact?.lastName
              ?.toLowerCase()
              ?.includes(search.toLowerCase());
            return containsEmail || containsFirstName || containsLastName;
          }
          return true;
        })}
      />
      <LeadSummaryModal ref={dialogRef} lead={lead} />
    </DefaultLayout>
  );
}
