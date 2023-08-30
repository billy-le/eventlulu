"use client";
import { useForm, useWatch, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import * as z from "zod";
import { useSession } from "next-auth/react";
import { DefaultLayout } from "~/layouts/default";
import { api } from "~/utils/api";
import { Combobox } from "~/ui/Combobox";
import * as datefns from "date-fns";
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
  dateSent: z.date().optional(),
  leadType: nameId,
  salesManager: nameId,
  siteInspectionDate: z.date().optional(),
  siteInspectionDateOptional: z.date().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  startDate: z.date(),
  eventLengthInDays: z.number().int(),
  endDate: z.date().optional(),
  contact: z.object({
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string().optional(),
    phoneNumber: z.string().optional(),
    mobileNumber: z.string().optional(),
  }),
  eventType: nameId.optional(),
  eventTypeOther: z.string().optional(),
  eventDetails: z.array(
    z.object({
      date: z.date(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      pax: z.number().positive().optional(),
      setup: nameId.optional(),
      mealReq: nameId.optional(),
      functionRoom: nameId.optional(),
      remarks: z.string().optional(),
    })
  ),
  roomDetails: z
    .object({
      total: z.number().int().positive(),
      roomType: z.string(),
      arrivalDate: z.date(),
      departureDate: z.date(),
    })
    .optional(),
  budget: z
    .object({
      banquets: z.number().positive().optional(),
      rooms: z.number().positive().optional(),
      otherHotelsConsidered: z.string().optional(),
      rate: z.number().positive().optional(),
      rateType: nameId.optional(),
    })
    .optional(),
  activities: z
    .array(
      z.object({
        date: z.date(),
        updatedBy: z.string(),
        clientFeedback: z.string().optional(),
        nextTraceDate: z.date().optional(),
      })
    )
    .optional(),
});

export default function CreateLeadPage() {
  const { data: session } = useSession();
  const { data: leadFormData } = api.leads.getLeadFormData.useQuery();

  const createLead = api.leads.createLead.useMutation({
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
    },
  });

  const formValues = useWatch<z.infer<typeof formSchema>>(form);

  const activities = useFieldArray({
    name: "activities",
    control: form.control,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createLead.mutate({
      dateReceived: values.dateReceived,
      userId: session!.user.id,
      leadTypeId: values.leadType.id,
      salesManagerId: values.salesManager.id,
      isCorporate: values.isCorporate,
      isLiveIn: values.isLiveIn,
      eventTypeId: values.eventType?.id,
      eventTypeOther: values.eventTypeOther,
      siteInspectionDate: values.siteInspectionDate,
      siteInspectionDateOptional: values.siteInspectionDateOptional,
      startDate: values.startDate,
      endDate: values.endDate!,
      eventLengthInDays: values.eventLengthInDays,
      contact: {
        email: values.contact.email,
        firstName: values.contact.firstName,
        lastName: values.contact?.lastName,
        mobileNumber: values.contact?.mobileNumber,
        phoneNumber: values.contact?.phoneNumber,
      },
      eventDetails: values.eventDetails?.map((event) => ({
        date: event.date,
        functionRoomId: event.functionRoom?.id,
        mealReqId: event.mealReq?.id,
        pax: event.pax,
        remarks: event.remarks,
        roomSetupId: event.setup?.id,
        startTime: event.startTime,
        endTime: event.endTime,
      })),
      ...(values.budget && {
        budget: {
          rateTypeId: values.budget?.rateType?.id,
          rate: values.budget?.rate ?? 0,
          banquet: values.budget?.banquets,
          rooms: values.budget?.rooms,
        },
      }),
      ...(values.company && {
        company: {
          name: values.company,
          address: values.address,
        },
      }),
      ...(values.activities && {
        activities: values.activities.map((activity) => ({
          updatedById: session!.user.id,
          clientFeedback: activity.clientFeedback,
          date: activity.date,
          nextTraceDate: activity.nextTraceDate,
        })),
      }),
    });
  }

  return (
    <DefaultLayout>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (e) => {
            console.log(e);
          })}
          className="space-y-8"
        >
          <Tabs defaultValue="lead">
            <TabsList>
              <TabsTrigger value="lead">Lead</TabsTrigger>
              <TabsTrigger value="event-details">Event Details</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="dates">Dates</TabsTrigger>
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
                      date={formValues.dateSent}
                      onChange={(date) => {
                        if (date) {
                          form.setValue("dateSent", date);
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
                    name="salesManager"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sales Manager</FormLabel>
                        <FormControl>
                          <Combobox
                            items={leadFormData?.salesManagers ?? []}
                            selectedItem={{
                              id: field.value?.id,
                              name: field.value?.name || "",
                            }}
                            onChange={(selectedItem) => {
                              form.setValue("salesManager", selectedItem);
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
                      date={formValues.siteInspectionDate}
                      onChange={(date) => {
                        if (date) {
                          form.setValue("siteInspectionDate", date);
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
                <FormItem>
                  <FormLabel>Optional Date:</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={formValues.siteInspectionDateOptional}
                      onChange={(date) => {
                        if (date) {
                          form.setValue("siteInspectionDateOptional", date);
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              </div>
            </TabsContent>
            <TabsContent value="event-details">
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
                      name="roomDetails.total"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Rooms</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              {...form.register("roomDetails.total", {
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
                      name="roomDetails.roomType"
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
                      name="roomDetails.arrivalDate"
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
                      name="roomDetails.departureDate"
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
                                ? { id: null, name: "other" }
                                : eventType
                            );
                          }}
                          defaultValue={field.value?.name}
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
                <FormField
                  control={form.control}
                  name="contact.firstName"
                  render={({ field }) => (
                    <FormItem>
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
                    <FormItem>
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
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                      name="company"
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
                      name="address"
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
            <TabsContent value="dates">
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
                                      setup: undefined,
                                      mealReq: undefined,
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
                      <TableHead>
                        Time
                        <br></br>
                        <div className="flex justify-between gap-4 text-xs text-gray-400">
                          <span className="w-full">Start</span>
                          <span className="w-full">End</span>
                        </div>
                      </TableHead>
                      <TableHead># of Pax</TableHead>
                      <TableHead>Set-Up</TableHead>
                      <TableHead>
                        Meal Req{" "}
                        <span className="text-xs text-gray-400">
                          (include dietary restrictions, if any)
                        </span>
                      </TableHead>
                      <TableHead>Function Room</TableHead>
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
                          <TableCell className="align-top">
                            <DatePicker
                              className="w-[200px]"
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
                          </TableCell>

                          <TableCell className="flex gap-4">
                            <Input
                              type="time"
                              autoFocus={false}
                              {...form.register(
                                `eventDetails.${index}.startTime`
                              )}
                            />
                            <Input
                              type="time"
                              autoFocus={false}
                              {...form.register(
                                `eventDetails.${index}.endTime`
                              )}
                            />
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
                          <TableCell className="align-top">
                            <Combobox
                              contentClassName="capitalize"
                              triggerClassName="capitalize"
                              items={leadFormData?.roomSetups ?? []}
                              selectedItem={
                                formValues.eventDetails?.[index]?.setup
                              }
                              onChange={(selectedItem) => {
                                form.setValue(
                                  `eventDetails.${index}.setup`,
                                  selectedItem
                                );
                              }}
                              placeholder="Select One"
                            />
                          </TableCell>
                          <TableCell className="align-top">
                            <Combobox
                              contentClassName="capitalize"
                              triggerClassName="capitalize"
                              items={leadFormData?.mealReqs ?? []}
                              selectedItem={
                                formValues.eventDetails?.[index]?.mealReq
                              }
                              onChange={(selectedItem) => {
                                form.setValue(
                                  `eventDetails.${index}.mealReq`,
                                  selectedItem
                                );
                              }}
                              placeholder="Select One"
                            />
                          </TableCell>
                          <TableCell className="align-top">
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
                              placeholder="Select One"
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
                    name="budget.banquets"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banquet</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            {...form.register("budget.banquets", {
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
                    name="budget.rooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rooms</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            {...form.register("budget.rooms", {
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
                    name="budget.otherHotelsConsidered"
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
                  <FormField
                    control={form.control}
                    name="budget.rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rate Given</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            {...form.register("budget.rate", {
                              valueAsNumber: true,
                            })}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormItem>
                    <FormLabel>Rate Type</FormLabel>
                    <Combobox
                      contentClassName="capitalize w-full"
                      triggerClassName="capitalize w-full"
                      items={leadFormData?.rateTypes ?? []}
                      selectedItem={formValues.budget?.rateType}
                      onChange={(selectedRateType) => {
                        form.setValue("budget.rateType", selectedRateType);
                      }}
                      placeholder="Select One"
                    />
                  </FormItem>
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
                          <TableCell>{session?.user?.name}</TableCell>
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
                      updatedBy: session!.user.name!,
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
                <div>
                  <ul>
                    <li>
                      <span className="underline"></span>
                      <div>
                        {formValues.leadType &&
                          `Lead Type: ${formValues.leadType}`}
                      </div>
                    </li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                  </ul>
                </div>
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
