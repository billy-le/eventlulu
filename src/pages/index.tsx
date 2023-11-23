"use client";

// core
import { api } from "~/utils/api";
import { isSameDay, format as dateFormat } from "date-fns";
import { useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

// components
import { Badge } from "@/components/ui/badge";
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
  AlertTriangle,
  Check,
  Frown,
  Smartphone,
  Filter,
  FilterX,
  Eye,
  X,
} from "lucide-react";
import { LeadSummaryModal } from "~/ui/LeadSummaryModal";

// helpers
import { eventIcons } from "~/utils/eventIcons";
import { statusColors } from "~/utils/statusColors";
import { EventStatus } from "@prisma/client";

const parentEventTypes = ["corporate", "social function"];

export default function HomePage() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<{
    eventTypes: string[];
    activities: string[];
    statuses: EventStatus[];
  }>({
    eventTypes: [],
    activities: [],
    statuses: [],
  });
  const {
    data: leads = [],
    refetch: refetchLeads,
    isLoading,
  } = api.leads.getLeads.useQuery({
    activities: filters.activities,
    eventTypes: filters.eventTypes,
    statuses: filters.statuses,
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="h-10">
                    <Button className="h-10 w-12 p-0">
                      <span className="sr-only">Open Filter Menu</span>
                      <Filter size="16" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <span>Event Type</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          {parentEventTypes.map((eventType) => (
                            <DropdownMenuItem
                              key={eventType}
                              onSelect={(e) => {
                                e.preventDefault();
                                setFilters((filters) => {
                                  return {
                                    ...filters,
                                    eventTypes: filters.eventTypes.includes(
                                      eventType
                                    )
                                      ? filters.eventTypes.filter(
                                          (f) => f !== eventType
                                        )
                                      : filters.eventTypes.concat(eventType),
                                  };
                                });
                              }}
                              className="capitalize"
                            >
                              <div className="flex items-center gap-2">
                                <span>
                                  {filters.eventTypes.includes(eventType) && (
                                    <Check
                                      size="16"
                                      className="text-pink-400"
                                    />
                                  )}
                                </span>
                                {eventType}
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                    {eventTypes.length > 0 && (
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <span>Event Activity</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            {eventTypes
                              .sort((a, b) =>
                                a.activity.localeCompare(b.activity)
                              )
                              .map(({ name, activity }) => {
                                let isDisabled = false;
                                const pEventTypes = filters.eventTypes.filter(
                                  (f) => f !== name
                                );
                                if (pEventTypes.length) {
                                  isDisabled = true;
                                }
                                if (
                                  filters.eventTypes.length ===
                                  parentEventTypes.length
                                ) {
                                  isDisabled = false;
                                }

                                return (
                                  <DropdownMenuItem
                                    key={activity}
                                    className="capitalize"
                                    disabled={isDisabled}
                                    onSelect={(e) => {
                                      e.preventDefault();
                                      setFilters((filters) => ({
                                        ...filters,
                                        activities: filters.activities.includes(
                                          activity
                                        )
                                          ? filters.activities.filter(
                                              (f) => f !== activity
                                            )
                                          : filters.activities.concat(activity),
                                      }));
                                    }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span>
                                        {filters.activities.includes(
                                          activity
                                        ) && (
                                          <Check
                                            size="16"
                                            className="text-pink-400"
                                          />
                                        )}
                                      </span>
                                      {activity}
                                    </div>
                                  </DropdownMenuItem>
                                );
                              })}
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                    )}
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <span>Status</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          {Object.values(EventStatus).map((status) => (
                            <DropdownMenuItem
                              key={status}
                              className="capitalize"
                              onSelect={(e) => {
                                e.preventDefault();
                                setFilters((filters) => ({
                                  ...filters,
                                  statuses: filters.statuses.includes(status)
                                    ? filters.statuses.filter(
                                        (f) => f !== status
                                      )
                                    : filters.statuses.concat(status),
                                }));
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <span>
                                  {filters.statuses.includes(status) && (
                                    <Check
                                      size="16"
                                      className="text-pink-400"
                                    />
                                  )}
                                </span>
                                {status}
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Link href="/leads/create">
                <Button type="button">
                  <Plus size="18" className="mr-2" />
                  New Lead
                </Button>
              </Link>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, values]) => {
                if (!values.length) return null;
                return values.map((value) => (
                  <Badge key={value} className="capitalize" variant="secondary">
                    <span>{value}</span>
                    <Button
                      variant="ghost"
                      type="button"
                      className="h-6 w-6 p-0 text-pink-500"
                      onClick={() => {
                        if (
                          key === "eventTypes" &&
                          filters.eventTypes.length > 1
                        ) {
                          const removeActivities = eventTypes.filter(
                            (eventType) => eventType.name === value
                          );
                          const activities = filters.activities.filter(
                            (activity) =>
                              !removeActivities.find(
                                (a) => a.activity === activity
                              )
                          );
                          setFilters((filters) => ({
                            ...filters,
                            [key]: filters[key as keyof typeof filters].filter(
                              (f) => f !== value
                            ),
                            activities,
                          }));
                        } else {
                          setFilters((filters) => ({
                            ...filters,
                            [key]: filters[key as keyof typeof filters].filter(
                              (f) => f !== value
                            ),
                          }));
                        }
                      }}
                    >
                      <X size="12" />
                    </Button>
                  </Badge>
                ));
              })}
            </div>
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
                <div>
                  {dateFormat(lead.startDate, "MMM d, yyyy")}
                  {isSameDay(lead.startDate, lead.endDate)
                    ? ""
                    : ` - ${dateFormat(lead.endDate, "MMM d, yyyy")}`}
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
                  } w-fit px-2 py-1 text-center text-xs uppercase`}
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
                <div>
                  {lead.lastDateSent
                    ? dateFormat(lead.lastDateSent, "MMM d, yyyy")
                    : ""}
                </div>
              );
            },
          },
          {
            id: "actions",
            cell: ({ row }) => {
              const lead = row.original;
              return (
                <div className="flex gap-2">
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
                                        {status === "confirmed" ? (
                                          <Check className="mr-2 h-4 w-4 text-green-400" />
                                        ) : status === "lost" ? (
                                          <Frown className="mr-2 h-4 w-4 text-red-400" />
                                        ) : (
                                          <AlertTriangle className="mr-2 h-4 w-4 text-yellow-400" />
                                        )}
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
                          <Link href={`/proposals/${lead.id}`}>
                            Generate Proposal
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
      <AlertDialog></AlertDialog>
    </DefaultLayout>
  );
}
