"use client";
import { z } from "zod";
import * as datefns from "date-fns";
import { api } from "~/utils/api";

import { useForm, useWatch, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { isCuid } from "@paralleldrive/cuid2";
import { inclusions } from "prisma/seed-data/data";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatePicker } from "src/ui/DatePicker";
import { DefaultLayout } from "~/layouts/default";
import { Combobox } from "~/ui/Combobox";
import { Plus, Trash, Edit } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
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
import { Label } from "@/components/ui/label";

const nameId = z.object({
  id: z.string(),
  name: z.string(),
});

const formSchema = z.object({
  id: z.string().optional(),
  isCorporate: z.boolean().default(false),
  isLiveIn: z.boolean().default(false),
  dateReceived: z.date(),
  lastDateSent: z.date().optional(),
  leadType: nameId,
  salesAccountManager: nameId,
  onSiteDate: z.date().optional(),
  startDate: z.date(),
  eventLengthInDays: z.number().int().positive(),
  endDate: z.date().optional(),
  contact: z.object({
    email: z.string().email(),
    title: z.string().optional(),
    firstName: z.string(),
    lastName: z.string().optional(),
    phoneNumber: z.string().optional(),
    mobileNumber: z.string().optional(),
  }),
  company: z
    .object({
      name: z.string(),
      address1: z.string().optional(),
      address2: z.string().optional(),
    })
    .optional(),
  eventType: nameId.optional(),
  eventTypeOther: z.string().optional(),
  eventDetails: z.array(
    z.object({
      id: z.string().optional(),
      date: z.date(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      pax: z.number().optional(),
      roomSetup: nameId.optional(),
      mealReqs: z.array(nameId.optional()).optional(),
      functionRoom: nameId.optional(),
      rate: z.number().optional(),
      remarks: z.string().optional(),
    })
  ),
  rateType: nameId.optional(),
  roomTotal: z.number().int().optional(),
  roomType: z.string().optional(),
  roomArrivalDate: z.date().optional(),
  roomDepartureDate: z.date().optional(),
  banquetsBudget: z.number().int().optional(),
  roomsBudget: z.number().int().optional(),
  otherHotelConsiderations: z.string().optional(),
  activities: z
    .array(
      z.object({
        id: z.string().optional(),
        date: z.date(),
        updatedBy: z.object({ id: z.string(), name: z.string() }),
        clientFeedback: z.string().optional(),
        nextTraceDate: z.date().optional(),
      })
    )
    .optional(),
  inclusions: z.array(nameId).default([]),
});

function normalize(
  values: z.infer<typeof formSchema>
): z.infer<typeof formSchema> {
  return {
    ...values,
    dateReceived: values.dateReceived,
    lastDateSent: values.lastDateSent ?? undefined,
    isCorporate: values.isCorporate,
    isLiveIn: values.isLiveIn,
    eventTypeOther: values.eventTypeOther ?? undefined,
    onSiteDate: values.onSiteDate ?? undefined,
    startDate: values.startDate,
    endDate: values.endDate!,
    eventLengthInDays: values.eventLengthInDays,
    contact: {
      ...values.contact,
      email: values.contact.email,
      title: values.contact.title ?? undefined,
      firstName: values.contact.firstName,
      lastName: values.contact?.lastName ?? undefined,
      mobileNumber: values.contact?.mobileNumber ?? undefined,
      phoneNumber: values.contact?.phoneNumber ?? undefined,
    },
    banquetsBudget: values.banquetsBudget ?? undefined,
    roomsBudget: values.roomsBudget ?? undefined,
    roomArrivalDate: values.roomArrivalDate ?? undefined,
    roomDepartureDate: values.roomDepartureDate ?? undefined,
    roomTotal: values.roomTotal ?? undefined,
    roomType: values.roomType ?? undefined,
    rateType: values.rateType ?? undefined,
    ...(values.company?.name
      ? {
          company: {
            ...values.company,
            name: values.company.name ?? undefined,
            address1: values.company.address1 ?? undefined,
            address2: values.company.address2 ?? undefined,
          },
        }
      : { company: undefined }),
    eventDetails: values.eventDetails?.map((event) => ({
      ...event,
      date: event.date,
      pax: event.pax ?? undefined,
      remarks: event.remarks ?? undefined,
      startTime: event.startTime ?? undefined,
      endTime: event.endTime ?? undefined,
      rate: event.rate ?? undefined,
      functionRoom: event.functionRoom ?? undefined,
      roomSetup: event.roomSetup ?? undefined,
      mealReqs: event.mealReqs,
    })),
    activities: values.activities?.map((activity) => ({
      ...activity,
      updatedBy: activity.updatedBy,
      clientFeedback: activity.clientFeedback ?? undefined,
      date: activity.date,
      nextTraceDate: activity.nextTraceDate ?? undefined,
    })),
    otherHotelConsiderations: values.otherHotelConsiderations ?? undefined,
    inclusions: values.inclusions ?? [],
  };
}

export default function LeadPage() {
  const router = useRouter();
  const leadId = router.query["leadId"];
  const isValidLeadId = !!leadId && isCuid(leadId as string);
  const { data: session } = useSession();
  const { data: leadData = [] } = api.leads.getLeads.useQuery(
    {
      leadId: leadId as string,
    },
    {
      refetchOnWindowFocus: false,
      enabled: isValidLeadId,
    }
  );
  const createEventDetails = api.eventDetails.createEventDetails.useMutation();
  const updateEventDetails = api.eventDetails.updateEventDetails.useMutation();
  const deleteEventDetails = api.eventDetails.deleteEventDetails.useMutation();
  const createActivities = api.activities.createActivities.useMutation();
  const updateActivities = api.activities.updateActivities.useMutation();
  const createInclusions = api.inclusions.createInclusions.useMutation();
  const updateInclusions = api.inclusions.updateInclusions.useMutation();
  const deleteInclusions = api.inclusions.deleteInclusions.useMutation();
  const [incPopoverOpen, setIncPopoverOpen] = useState(false);
  const [incUpdatePopoverOpen, setUpdateIncPopoverOpen] = useState<
    string | null
  >(null);
  const incRef = useRef<HTMLInputElement | null>(null);

  const { data: leadFormData, refetch: refetchLeadFormData } =
    api.leads.getLeadFormData.useQuery(undefined, {
      refetchOnWindowFocus: false,
    });
  const lead = leadData[0];
  const { toast } = useToast();

  const mutateLead = api.leads.mutateLead.useMutation({
    onSuccess: (e) => {
      toast({
        title: "Success",
        description:
          leadId === "create"
            ? "Lead form has been created"
            : "Lead form has been updated",
      });
      router.push("/");
    },
    onError: () => {
      toast({
        title: "Failed",
        description: "There was an error",
        variant: "destructive",
      });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: leadFormData?.inclusions
      ? {
          inclusions: leadFormData.inclusions.filter((x) =>
            inclusions.some((a) => a === x.name)
          ),
        }
      : undefined,
  });

  useEffect(() => {
    if (leadData.length) {
      const lead = leadData[0]!;
      form.reset(
        normalize({
          ...lead,
          eventType: lead.eventTypeOther
            ? {
                id: "other",
                name: "other",
              }
            : lead.eventType
            ? {
                id: lead.eventType.id,
                name: lead.eventType.name,
              }
            : undefined,
        })
      );
    }
  }, [leadData]);

  const formValues = useWatch<z.infer<typeof formSchema>>(form);

  const activities = useFieldArray({
    name: "activities",
    control: form.control,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const leadFormValues = normalize(formValues);
    if (leadFormValues.eventType?.id === "other") {
      leadFormValues.eventType = undefined;
    }
    if (lead?.id) {
      const eventDetailsToDelete = lead.eventDetails
        .filter((d) => !leadFormValues.eventDetails.find((a) => a.id === d.id))
        .filter((x) => x.id)
        .map((x) => x.id);
      const eventDetailsToCreate =
        leadFormValues.eventDetails.filter((x) => !x.id) ?? [];
      const eventDetailsToUpdate = leadFormValues.eventDetails.filter(
        (x) => x.id
      );
      await deleteEventDetails.mutateAsync(eventDetailsToDelete);
      await updateEventDetails.mutateAsync(eventDetailsToUpdate);
      await createEventDetails.mutateAsync({
        leadFormId: lead.id,
        eventDetails: eventDetailsToCreate,
      });
      const activitiesToUpdate = formValues.activities.filter((act) => act.id);
      const activitiesToCreate = formValues.activities.filter((act) => !act.id);
      await createActivities.mutateAsync({
        leadFormId: lead.id,
        activities: activitiesToCreate,
      });
      await updateActivities.mutateAsync(activitiesToUpdate);
    }
    await mutateLead.mutateAsync(leadFormValues);
  }

  return (
    <DefaultLayout>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (err) => {
            console.log(err);
            toast({
              title: "Invalid Form",
              description: (
                <div>
                  Please fill out the missing values on the form:
                  <ul>
                    {Object.keys(err).map((key, index) => {
                      const errorName = key
                        .replaceAll(/([A-Z])/g, (value) => ` ${value}`)
                        .toUpperCase();
                      return <li key={index}>{errorName}</li>;
                    })}
                  </ul>
                </div>
              ),
              variant: "destructive",
            });
          })}
          className="relative mx-auto max-w-4xl space-y-10"
        >
          <div className="grid grid-cols-2 gap-4 rounded border bg-slate-50 p-4">
            <FormField
              control={form.control}
              name="dateReceived"
              render={(field) => (
                <FormItem>
                  <FormLabel>Date Received:</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.field.value}
                      onChange={field.field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Date Proposal Was Sent:</FormLabel>
              <FormControl>
                <DatePicker
                  date={formValues.lastDateSent}
                  onChange={(date) => {
                    if (date) {
                      form.setValue("lastDateSent", date);
                    }
                  }}
                />
              </FormControl>
            </FormItem>
            <FormField
              control={form.control}
              name="leadType"
              render={({ field }) => (
                <FormItem className="col-span-2 space-y-3">
                  <FormLabel>Lead Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        const leadType = leadFormData!.leadTypes.find(
                          (type) => type.id === value
                        );
                        field.onChange(leadType);
                      }}
                      className="flex gap-8"
                      value={formValues.leadType?.id}
                    >
                      {leadFormData?.leadTypes?.map((type) => (
                        <FormItem
                          key={type.id}
                          className="flex items-center space-x-3 space-y-0"
                        >
                          <FormControl>
                            <RadioGroupItem value={type.id} />
                          </FormControl>
                          <FormLabel className="font-normal capitalize">
                            {type.name}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="col-span-2">
              <FormField
                control={form.control}
                name="salesAccountManager"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sales Manager</FormLabel>
                    <FormControl>
                      <Combobox
                        items={leadFormData?.salesManagers ?? []}
                        selectedItem={formValues.salesAccountManager}
                        onChange={(selectedItem) => {
                          form.setValue("salesAccountManager", selectedItem);
                        }}
                        placeholder="Select One"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormItem>
              <FormLabel>Site Inspection Date:</FormLabel>
              <FormControl>
                <DatePicker
                  date={formValues.onSiteDate}
                  onChange={(date) => {
                    if (date) {
                      form.setValue("onSiteDate", date);
                    }
                  }}
                />
              </FormControl>
            </FormItem>
          </div>
          <div className="grid grid-cols-2 gap-4 rounded border bg-slate-50 p-4">
            <div className="col-span-2 flex gap-8">
              <FormField
                control={form.control}
                name="isCorporate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Corporate Event</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isLiveIn"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 ">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Live-In</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {formValues.isLiveIn && (
              <div className="col-span-2 grid grid-cols-2 gap-4 rounded-md border bg-slate-200 p-4">
                <FormField
                  control={form.control}
                  name="roomTotal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Rooms</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          {...form.register("roomTotal", {
                            valueAsNumber: true,
                          })}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="roomType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Type</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="roomArrivalDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Arrival Date</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value}
                          onChange={(date) => {
                            if (date) {
                              field.onChange(date);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="roomDepartureDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departure Date</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value}
                          onChange={(date) => {
                            if (date) {
                              field.onChange(date);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="eventType"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Event Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        const eventType = leadFormData?.eventTypes.find(
                          ({ id }) => id === value
                        );

                        if (value !== "other") {
                          form.setValue("eventTypeOther", "");
                        }

                        field.onChange(
                          value === "other"
                            ? { id: "other", name: "other" }
                            : eventType
                        );
                      }}
                      value={field.value?.id}
                      className="flex flex-wrap gap-8"
                    >
                      {formValues.isCorporate
                        ? leadFormData?.eventTypes
                            ?.filter((type) => type.name === "corporate")
                            ?.map((eventType) => (
                              <FormItem
                                key={eventType.id}
                                className="flex items-center space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <RadioGroupItem value={eventType.id} />
                                </FormControl>
                                <FormLabel className="capitalize">
                                  {eventType.activity}
                                </FormLabel>
                              </FormItem>
                            ))
                        : leadFormData?.eventTypes
                            ?.filter((type) => type.name === "social function")
                            ?.map((eventType) => (
                              <FormItem
                                key={eventType.id}
                                className="flex items-center space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <RadioGroupItem value={eventType.id} />
                                </FormControl>
                                <FormLabel className="capitalize">
                                  {eventType.activity}
                                </FormLabel>
                              </FormItem>
                            ))}
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="other" />
                        </FormControl>
                        <FormLabel>Other</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {formValues.eventType?.name === "other" && (
              <FormField
                control={form.control}
                name="eventTypeOther"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Please Specify</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          <div className="space-y-4 rounded border bg-slate-50 p-4">
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="contact.title"
                render={({ field }) => (
                  <FormItem className="w-40">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact.firstName"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact.lastName"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact.email"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <FormField
                control={form.control}
                name="contact.phoneNumber"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact.mobileNumber"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {formValues?.isCorporate && (
              <>
                <FormField
                  control={form.control}
                  name="company.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company.address1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
          <div className="space-y-4 rounded border bg-slate-50 p-4">
            <div className="grid grid-cols-4 gap-4">
              <FormItem>
                <FormLabel>Event Start Date:</FormLabel>
                <FormControl>
                  <DatePicker
                    date={formValues.startDate}
                    onChange={(date) => {
                      if (date) {
                        form.setValue("startDate", datefns.startOfDay(date));
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
              <FormField
                control={form.control}
                name="eventLengthInDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Length in Days</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        {...form.register("eventLengthInDays", {
                          valueAsNumber: true,
                          onChange: (e) => {
                            const count = !!e.target.value
                              ? parseInt(e.target.value, 10)
                              : 0;
                            if (count) {
                              let events: z.infer<
                                typeof formSchema
                              >["eventDetails"] = [];
                              for (let i = 0; i < count; i++) {
                                const date = datefns.addDays(
                                  formValues.startDate!,
                                  i
                                );
                                const curr = formValues.eventDetails?.[i];
                                events.push({
                                  ...(curr?.id && {
                                    id: curr?.id ?? undefined,
                                  }),
                                  date,
                                  startTime: curr?.startTime ?? "",
                                  endTime: curr?.endTime ?? "",
                                  pax: curr?.pax ?? 0,
                                  roomSetup: curr?.roomSetup ?? undefined,
                                  mealReqs: curr?.mealReqs ?? [],
                                  functionRoom: curr?.functionRoom ?? undefined,
                                  remarks: curr?.remarks ?? "",
                                  rate: curr?.rate ?? 0,
                                });
                                form.setValue("eventDetails", events);
                              }
                              const endDate = datefns.endOfDay(
                                datefns.addDays(
                                  formValues.startDate!,
                                  count - 1
                                )
                              );
                              form.setValue("endDate", endDate);
                            } else {
                              form.setValue("eventDetails", []);
                              form.setValue("endDate", undefined);
                            }
                          },
                        })}
                        disabled={!formValues.startDate}
                        min="1"
                        step="1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {formValues.endDate && (
                <FormItem>
                  <FormLabel>End Date:</FormLabel>
                  <FormControl>
                    <p>{datefns.format(formValues.endDate, "MMMM d, yyyy")}</p>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              <FormItem>
                <FormLabel>Rate Type</FormLabel>
                <FormControl>
                  <Combobox
                    contentClassName="capitalize"
                    triggerClassName="capitalize"
                    items={leadFormData?.rateTypes ?? []}
                    selectedItem={formValues.rateType}
                    onChange={(selectedItem) => {
                      form.setValue(`rateType`, selectedItem);
                    }}
                    placeholder="Select Rate"
                  />
                </FormControl>
              </FormItem>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    Date{" "}
                    <span className="text-xs text-gray-400">
                      (include rehearsals, if any)
                    </span>
                  </TableHead>

                  <TableHead># of Pax</TableHead>
                  <TableHead>Function Room / Set-Up</TableHead>
                  <TableHead className="whitespace-pre">
                    Meal Req{" "}
                    <span className="text-xs text-gray-400">
                      (include dietary restrictions, if any)
                    </span>
                  </TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array(
                  Number.isInteger(formValues.eventLengthInDays)
                    ? formValues.eventLengthInDays
                    : 0
                )
                  .fill(null)
                  .map((_, index) => (
                    <TableRow
                      key={index}
                      className={index % 2 === 0 ? "bg-gray-100" : ""}
                    >
                      <TableCell className="space-y-2 align-top">
                        <DatePicker
                          className="w-[240px]"
                          date={formValues.eventDetails?.[index]?.date}
                          onChange={(date) => {
                            if (date) {
                              form.setValue(`eventDetails.${index}.date`, date);
                            }
                          }}
                        />
                        <div className="flex gap-4">
                          <div className="flex-grow space-y-1">
                            <FormLabel>Start Time</FormLabel>
                            <Input
                              type="time"
                              {...form.register(
                                `eventDetails.${index}.startTime`
                              )}
                            />
                          </div>
                          <div className="flex-grow space-y-1">
                            <FormLabel>End Time</FormLabel>
                            <Input
                              type="time"
                              {...form.register(
                                `eventDetails.${index}.endTime`
                              )}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <Input
                          type="number"
                          className="w-20"
                          {...form.register(`eventDetails.${index}.pax`, {
                            valueAsNumber: true,
                          })}
                        />
                      </TableCell>
                      <TableCell className="space-y-2 align-top">
                        <Combobox
                          contentClassName="capitalize"
                          triggerClassName="capitalize"
                          items={leadFormData?.functionRooms ?? []}
                          selectedItem={
                            formValues.eventDetails?.[index]?.functionRoom
                          }
                          onChange={(selectedItem) => {
                            form.setValue(
                              `eventDetails.${index}.functionRoom`,
                              selectedItem
                            );
                          }}
                          placeholder="Select Room"
                        />
                        <Combobox
                          contentClassName="capitalize"
                          triggerClassName="capitalize"
                          items={leadFormData?.roomSetups ?? []}
                          selectedItem={
                            formValues.eventDetails?.[index]?.roomSetup
                          }
                          onChange={(selectedItem) => {
                            form.setValue(
                              `eventDetails.${index}.roomSetup`,
                              selectedItem
                            );
                          }}
                          placeholder="Select Setup"
                        />
                      </TableCell>
                      <TableCell className="space-y-1 align-top">
                        {leadFormData?.mealReqs?.map((mealReq) => (
                          <FormItem
                            key={mealReq.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={formValues.eventDetails?.[
                                  index
                                ]?.mealReqs?.some(
                                  (req) => req?.id === mealReq.id
                                )}
                                onCheckedChange={(checked) => {
                                  const value = checked.valueOf();
                                  const mealReqs = form.getValues(
                                    `eventDetails.${index}.mealReqs`
                                  );
                                  if (value) {
                                    mealReqs?.push(mealReq);
                                    form.setValue(
                                      `eventDetails.${index}.mealReqs`,
                                      mealReqs
                                    );
                                  } else {
                                    const meals = mealReqs?.filter(
                                      (meal) => meal?.id !== mealReq.id
                                    );
                                    form.setValue(
                                      `eventDetails.${index}.mealReqs`,
                                      meals
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="capitalize">
                                {mealReq.name}
                              </FormLabel>
                            </div>
                          </FormItem>
                        ))}
                      </TableCell>
                      <TableCell className="space-y-2 align-top">
                        <Input
                          type="number"
                          {...form.register(`eventDetails.${index}.rate`, {
                            valueAsNumber: true,
                          })}
                          className="w-40"
                        />
                      </TableCell>
                      <TableCell className="align-top">
                        <Textarea
                          {...form.register(`eventDetails.${index}.remarks`)}
                          rows={2}
                          className="w-[200px]"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          <div className="rounded border bg-slate-50 p-4">
            Estimated Budget:
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="banquetsBudget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banquet</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        {...form.register("banquetsBudget", {
                          valueAsNumber: true,
                        })}
                        defaultValue={0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="roomsBudget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rooms</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        {...form.register("roomsBudget", {
                          valueAsNumber: true,
                        })}
                        defaultValue={0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="otherHotelConsiderations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Hotels Being Considered</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4 rounded border bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <FormLabel>Inclusions</FormLabel>
              <Popover
                open={incPopoverOpen}
                onOpenChange={(isOpen) => setIncPopoverOpen(isOpen)}
              >
                <PopoverTrigger asChild>
                  <Button type="button" size="icon">
                    <Plus />
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="flex items-center justify-center gap-4">
                    <Input ref={incRef} />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        const value = incRef.current?.value;
                        if (value) {
                          createInclusions.mutate([value], {
                            onSuccess: (inclusions) => {
                              refetchLeadFormData();
                              form.setValue("inclusions", [
                                ...(formValues.inclusions ?? []),
                                ...inclusions,
                              ]);
                              setIncPopoverOpen(false);
                            },
                          });
                        }
                      }}
                    >
                      Create
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1">
              {leadFormData?.inclusions?.map((inclusion) => (
                <FormItem
                  key={inclusion.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FormControl>
                      <Checkbox
                        checked={formValues.inclusions?.some(
                          (inc) => inc?.id === inclusion.id
                        )}
                        onCheckedChange={(checked) => {
                          const value = checked.valueOf();
                          if (value) {
                            form.setValue(
                              "inclusions",
                              formValues.inclusions?.concat(inclusion)
                            );
                          } else {
                            form.setValue(
                              "inclusions",
                              formValues.inclusions?.filter(
                                (inc) => inc.id !== inclusion.id
                              )
                            );
                          }
                        }}
                      />
                    </FormControl>
                    <div className="leading-none">
                      <FormLabel className="text-xs">
                        {inclusion.name}
                      </FormLabel>
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <Popover
                      open={incUpdatePopoverOpen === inclusion.id}
                      onOpenChange={(isOpen) => {
                        setUpdateIncPopoverOpen(isOpen ? inclusion.id : null);
                      }}
                    >
                      <PopoverTrigger asChild>
                        <Edit size="12" />
                      </PopoverTrigger>
                      <PopoverContent>
                        <div className="flex items-center gap-4">
                          <Input ref={incRef} defaultValue={inclusion.name} />
                          <Button
                            type="button"
                            onClick={() => {
                              const value = incRef.current?.value;
                              if (value) {
                                updateInclusions.mutate(
                                  [{ id: inclusion.id, name: value }],
                                  {
                                    onSuccess: () => {
                                      const incIndex =
                                        formValues?.inclusions?.findIndex(
                                          (inc) => inc.id === inclusion.id
                                        ) ?? -1;
                                      if (incIndex > -1) {
                                        const copy = [
                                          ...(formValues?.inclusions ?? []),
                                        ];
                                        copy[incIndex]!.name === value;
                                        form.setValue("inclusions", copy);
                                      }
                                      refetchLeadFormData();
                                      setUpdateIncPopoverOpen(null);
                                    },
                                  }
                                );
                              }
                            }}
                          >
                            Update
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <AlertDialog>
                      <AlertDialogTrigger>
                        <Trash size="12" className="text-destructive" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the inclusion, "{inclusion.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              deleteInclusions.mutate([inclusion.id], {
                                onSuccess: () => {
                                  form.setValue(
                                    "inclusions",
                                    formValues.inclusions?.filter(
                                      (inc) => inc.id !== inclusion.id
                                    )
                                  );
                                  refetchLeadFormData();
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
                </FormItem>
              ))}
            </div>
          </div>

          <div className="rounded border bg-slate-50 p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date of Activity</TableHead>
                  <TableHead>Updated By</TableHead>
                  <TableHead>Latest Feedback Given By Client</TableHead>
                  <TableHead>Next Trace Date</TableHead>
                  <TableHead>
                    <Button
                      type="button"
                      onClick={() => {
                        activities.append({
                          date: new Date(),
                          updatedBy: session!.user,
                          clientFeedback: "",
                          nextTraceDate: undefined,
                        });
                      }}
                      size="icon"
                    >
                      <Plus />
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.fields.map((_, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <DatePicker
                          date={formValues.activities?.[index]?.date}
                          onChange={(date) => {
                            if (date) {
                              form.setValue(`activities.${index}.date`, date);
                            }
                          }}
                          disabled={!!formValues.activities?.[index]?.id}
                        />
                      </TableCell>
                      <TableCell>
                        {formValues.activities?.[index]?.updatedBy?.name}
                      </TableCell>
                      <TableCell>
                        <Textarea
                          {...form.register(
                            `activities.${index}.clientFeedback`
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <DatePicker
                          date={formValues.activities?.[index]?.nextTraceDate}
                          onChange={(date) => {
                            if (date) {
                              form.setValue(
                                `activities.${index}.nextTraceDate`,
                                date
                              );
                            }
                          }}
                          disabled={!!formValues.activities?.[index]?.id}
                        />
                      </TableCell>
                      <TableCell>
                        {!formValues.activities?.[index]?.id && (
                          <Button
                            type="button"
                            onClick={() => {
                              activities.remove(index);
                            }}
                            size="icon"
                          >
                            <Trash />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="sticky bottom-0 bg-white py-4">
            <Button type="submit" className="ml-auto block">
              Save
            </Button>
          </div>
        </form>
      </Form>
    </DefaultLayout>
  );
}
