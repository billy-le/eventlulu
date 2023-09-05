"use client";
import * as z from "zod";
import * as datefns from "date-fns";
import { api } from "~/utils/api";

import { useForm, useWatch, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "src/ui/DatePicker";
import { DefaultLayout } from "~/layouts/default";
import { Combobox } from "~/ui/Combobox";
import { Trash } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const nameId = z.object({
  id: z.string(),
  name: z.string(),
});

const formSchema = z.object({
  isCorporate: z.boolean().default(false),
  isLiveIn: z.boolean().default(false),
  dateReceived: z.date(),
  lastDateSent: z.date().nullish().optional(),
  leadType: nameId,
  salesAccountManager: nameId,
  onSiteDate: z.date().nullish().optional(),
  startDate: z.date(),
  eventLengthInDays: z.number().int(),
  endDate: z.date().nullish().optional(),
  contact: z.object({
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string().nullish().optional(),
    phoneNumber: z.string().nullish().optional(),
    mobileNumber: z.string().nullish().optional(),
  }),
  company: z.object({
    name: z.string(),
    address1: z.string().nullish().optional(),
    address2: z.string().nullish().optional(),
  }),
  eventType: nameId.nullish().optional(),
  eventTypeOther: z.string().nullish().optional(),
  eventDetails: z.array(
    z.object({
      date: z.date(),
      startTime: z.string().nullish().optional(),
      endTime: z.string().nullish().optional(),
      pax: z.number().positive().nullish().optional(),
      roomSetup: nameId.nullish().optional(),
      mealReqs: z.array(nameId.optional()).optional(),
      functionRoom: nameId.nullish().optional(),
      rate: z.number().positive().nullish().optional(),
      rateType: nameId.nullish().optional(),
      remarks: z.string().nullish().optional(),
    })
  ),
  roomTotal: z.number().int().positive().nullish().optional(),
  roomType: z.string().nullish().optional(),
  roomArrivalDate: z.date().nullish().optional(),
  roomDepartureDate: z.date().nullish().optional(),
  banquetsBudget: z.number().min(0).nullish().optional(),
  roomsBudget: z.number().min(0).nullish().optional(),
  otherHotelConsiderations: z.string().nullish().optional(),

  activities: z
    .array(
      z.object({
        date: z.date(),
        updatedBy: z.object({ id: z.string(), name: z.string() }),
        clientFeedback: z.string().nullish().optional(),
        nextTraceDate: z.date().nullish().optional(),
      })
    )
    .nullish()
    .optional(),
});

function normalize(values: z.infer<typeof formSchema>) {
  console.log({ values });
  return {
    dateReceived: values.dateReceived,
    lastDateSent: values.lastDateSent ?? undefined,
    leadTypeId: values.leadType.id,
    salesManagerId: values.salesAccountManager.id,
    isCorporate: values.isCorporate,
    isLiveIn: values.isLiveIn,
    eventTypeId:
      values.eventType?.id === "other" ? undefined : values.eventType?.id,
    eventTypeOther: values.eventTypeOther ?? undefined,
    onSiteDate: values.onSiteDate ?? undefined,
    startDate: values.startDate,
    endDate: values.endDate!,
    eventLengthInDays: values.eventLengthInDays,
    contact: {
      email: values.contact.email,
      firstName: values.contact.firstName,
      lastName: values.contact?.lastName ?? undefined,
      mobileNumber: values.contact?.mobileNumber ?? undefined,
      phoneNumber: values.contact?.phoneNumber ?? undefined,
    },
    banquetsBudget: values.banquetsBudget ?? undefined,
    roomsBudget: values.roomsBudget ?? undefined,
    ...(values.company.name && {
      company: {
        name: values.company.name ?? undefined,
        address1: values.company.address1 ?? undefined,
        address2: values.company.address2 ?? undefined,
      },
    }),
    eventDetails: values.eventDetails?.map((event) => ({
      date: event.date,
      functionRoomId: event.functionRoom?.id,
      pax: event.pax ?? undefined,
      remarks: event.remarks ?? undefined,
      roomSetupId: event.roomSetup?.id,
      startTime: event.startTime ?? undefined,
      endTime: event.endTime ?? undefined,
      rateTypeId: event.rateType?.id,
      rate: event.rate ?? undefined,
      mealReqs: event.mealReqs,
    })),
    activities: values.activities?.map((activity) => ({
      updatedBy: activity.updatedBy,
      clientFeedback: activity.clientFeedback ?? undefined,
      date: activity.date,
      nextTraceDate: activity.nextTraceDate ?? undefined,
    })),
  };
}

export default function LeadPage() {
  const router = useRouter();
  const leadId = router.query["leadId"];
  const { data: session } = useSession();
  const { data: leadData = [] } = api.leads.getLeads.useQuery(
    {
      leadId: leadId as string,
    },
    {
      refetchOnWindowFocus: false,
    }
  );
  const { data: leadFormData } = api.leads.getLeadFormData.useQuery();

  useEffect(() => {
    if (leadData.length) {
      const lead = leadData[0]!;
      form.reset({
        ...lead,
        eventType: lead?.eventTypeId
          ? leadFormData?.eventTypes.find((a) => a.id === lead.eventTypeId)
          : {
              id: "other",
              name: "other",
            },
      });
    }
  }, [leadData, leadFormData]);

  const mutateLead = api.leads.mutateLead.useMutation({
    onSuccess: (e) => {
      console.log(e);
    },
    onMutate: () => {},
    onSettled: () => {},
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventDetails: [],
      activities: [],
    },
  });

  const formValues = useWatch<z.infer<typeof formSchema>>(form);

  const activities = useFieldArray({
    name: "activities",
    control: form.control,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const leadData = normalize(values);
    mutateLead.mutate(leadData);
  }

  return (
    <DefaultLayout>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (e) => {
            console.log({ error: e, formValues });
          })}
          className="space-y-8"
        >
          <Tabs defaultValue="lead">
            <TabsList>
              <TabsTrigger value="lead">Lead</TabsTrigger>
              <TabsTrigger value="event-type">Event Type</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="event-details">Event Details</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
            </TabsList>
            <TabsContent value="lead">
              <div className="grid grid-cols-2 gap-4 rounded border p-4">
                <FormItem>
                  <FormLabel>Date Received:</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={formValues.dateReceived}
                      onChange={(date) => {
                        if (date) {
                          form.setValue("dateReceived", date);
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
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
                              form.setValue(
                                "salesAccountManager",
                                selectedItem
                              );
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
            </TabsContent>
            <TabsContent value="event-type">
              <div className="grid grid-cols-2 gap-4 rounded border p-4">
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
                                ?.filter(
                                  (type) => type.name === "social function"
                                )
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
            </TabsContent>
            <TabsContent value="contact">
              <div className="space-y-4 rounded border p-4">
                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="contact.firstName"
                    render={({ field }) => (
                      <FormItem className="w-full">
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
                      <FormItem className="w-full">
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
                      <FormItem className="w-full">
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
            </TabsContent>
            <TabsContent value="event-details">
              <div className="space-y-4 rounded border p-4">
                <div className="grid grid-cols-4 gap-4">
                  <FormItem>
                    <FormLabel>Event Start Date:</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={formValues.startDate}
                        onChange={(date) => {
                          if (date) {
                            form.setValue(
                              "startDate",
                              datefns.startOfDay(date)
                            );
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
                        <FormLabel>Event Length in Days?</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            disabled={!formValues.startDate}
                            min="1"
                            step="1"
                            {...field}
                            {...form.register("eventLengthInDays", {
                              valueAsNumber: true,
                              onChange: (e) => {
                                const count = !!e.target.value
                                  ? parseInt(e.target.value, 10)
                                  : 0;
                                if (count) {
                                  let events = [];
                                  for (let i = 0; i < count; i++) {
                                    const date = datefns.addDays(
                                      formValues.startDate!,
                                      i
                                    );
                                    events.push({
                                      date,
                                      startTime: "",
                                      endTime: "",
                                      pax: 0,
                                      roomSetup: undefined,
                                      mealReqs: [],
                                      functionRoom: undefined,
                                      remarks: "",
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
                        <p>
                          {datefns.format(formValues.endDate, "MMMM d, yyyy")}
                        </p>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
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
                      <TableHead>
                        Meal Req{" "}
                        <span className="text-xs text-gray-400">
                          (include dietary restrictions, if any)
                        </span>
                      </TableHead>
                      <TableHead>Rate / Rate Type</TableHead>
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
                                  form.setValue(
                                    `eventDetails.${index}.date`,
                                    date
                                  );
                                }
                              }}
                            />
                            <div className="flex gap-4">
                              <div className="flex-grow space-y-1">
                                <FormLabel>Start Time</FormLabel>
                                <Input
                                  type="time"
                                  autoFocus={false}
                                  {...form.register(
                                    `eventDetails.${index}.startTime`
                                  )}
                                />
                              </div>
                              <div className="flex-grow space-y-1">
                                <FormLabel>End Time</FormLabel>
                                <Input
                                  type="time"
                                  autoFocus={false}
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
                              placeholder="Select Venue"
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
                                        const bas = mealReqs?.filter(
                                          (z) => z?.id !== mealReq.id
                                        );
                                        form.setValue(
                                          `eventDetails.${index}.mealReqs`,
                                          bas
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
                            />
                            <Combobox
                              contentClassName="capitalize"
                              triggerClassName="capitalize"
                              items={leadFormData?.rateTypes ?? []}
                              selectedItem={
                                formValues.eventDetails?.[index]?.rateType
                              }
                              onChange={(selectedItem) => {
                                form.setValue(
                                  `eventDetails.${index}.rateType`,
                                  selectedItem
                                );
                              }}
                              placeholder="Select Rate"
                            />
                          </TableCell>
                          <TableCell className="align-top">
                            <Textarea
                              {...form.register(
                                `eventDetails.${index}.remarks`
                              )}
                              rows={2}
                              className="w-[200px]"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="budget">
              <div className="rounded border p-4">
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
            </TabsContent>
            <TabsContent value="activity">
              <div className="rounded border p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date of Activity</TableHead>
                      <TableHead>Updated By</TableHead>
                      <TableHead>Latest Feedback Given By Client</TableHead>
                      <TableHead>Next Trace Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activities.fields.map((_, index) => {
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            <DatePicker
                              date={formValues.activities?.[index]?.date}
                              onChange={(date) => {
                                if (date) {
                                  form.setValue(
                                    `activities.${index}.date`,
                                    date
                                  );
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {formValues.activities?.[index]?.updatedBy?.name}
                          </TableCell>
                          <TableCell>
                            <Input
                              {...form.register(
                                `activities.${index}.clientFeedback`
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <DatePicker
                              date={
                                formValues.activities?.[index]?.nextTraceDate
                              }
                              onChange={(date) => {
                                if (date) {
                                  form.setValue(
                                    `activities.${index}.nextTraceDate`,
                                    date
                                  );
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              onClick={() => {
                                activities.remove(index);
                              }}
                            >
                              <Trash />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
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
                >
                  Add
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="review">
              <div className="rounded border p-4">
                <FormItem>
                  <FormControl>
                    <Button type="submit">Save</Button>
                  </FormControl>
                </FormItem>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </DefaultLayout>
  );
}
