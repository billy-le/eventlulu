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
import { DataTable } from "~/ui/DataTable";
import { useRouter } from "next/router";
import { Combobox } from "~/ui/Combobox";

const nameId = z.object({
  id: z.string(),
  name: z.string().optional(),
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
  contact: z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().email().optional(),
      phoneNumber: z.string().optional(),
      mobileNumber: z.string().optional(),
    })
    .optional(),
  eventType: nameId.optional(),
  eventTypeOther: z.string().optional(),
  eventDetails: z
    .array(
      z.object({
        date: z.date().optional(),
        optionalDate: z.date().optional(),
        time: z.date().optional(),
        pax: z.number().positive().optional(),
        setup: nameId.optional(),
        mealReq: nameId.optional(),
        functionRoom: nameId.optional(),
        remarks: z.string().optional(),
      })
    )
    .optional(),
  roomDetails: z
    .object({
      numberOfRooms: z.number().int().positive(),
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
  activity: z
    .array(
      z.object({
        date: z.date(),
        updatedBy: z.string().optional(),
        clientFeedback: z.string().optional(),
        nextTraceDate: z.date().optional(),
      })
    )
    .optional(),
});

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
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
      dateReceived: new Date(),
      salesManager: undefined,
    },
  });

  const formValues = useWatch<z.infer<typeof formSchema>>(form);

  const eventDetails = useFieldArray({
    name: "eventDetails",
    control: form.control,
  });
  const activity = useFieldArray({ name: "activity", control: form.control });
  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log({ formValues: values });
    createLead.mutate({
      userId: session!.user.id,
      leadTypeId: values.leadType.id,
      salesManagerId: values.salesManager.id,
      isCorporate: values.isCorporate,
      isLiveIn: values.isLiveIn,
      eventTypeId: values.eventType?.id,
      eventTypeOther: values.eventTypeOther,
      siteInspectionDate: values.siteInspectionDate,
      siteInspectionDateOptional: values.siteInspectionDateOptional,
      ...(values.contact && {
        contact: {
          email: values.contact?.email,
          firstName: values.contact?.firstName,
          lastName: values.contact?.lastName,
          mobileNumber: values.contact?.mobileNumber,
          phoneNumber: values.contact?.phoneNumber,
        },
      }),
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
          address: values.address,
          name: values.company,
        },
      }),
      ...(values.eventDetails && {
        eventDetails: values.eventDetails.map((date) => ({
          date: date.date,
          functionRoomId: date.functionRoom?.id,
          mealReqId: date.mealReq?.id,
          optionalDate: date.optionalDate,
          pax: date.pax,
          remarks: date.remarks,
          roomSetupId: date.setup?.id,
          time: date.time,
        })),
      }),
      ...(values.activity && {
        activities: values.activity.map((activity) => ({
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
                <div>
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
                </div>
                <div>
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
                </div>
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
                <div>
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
                </div>
                <div>
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
                </div>
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
                      name="roomDetails.numberOfRooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Rooms</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              {...form.register("roomDetails.numberOfRooms", {
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
                            field.onChange(eventType);
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
                                    <FormLabel className="font-normal capitalize">
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
                                    <FormLabel className="font-normal capitalize">
                                      {eventType.activity}
                                    </FormLabel>
                                  </FormItem>
                                ))}
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Other" />
                            </FormControl>
                            <FormLabel className="font-normal capitalize">
                              Other
                            </FormLabel>
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
              <div className="rounded border p-4">
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
                        <Input {...field} />
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
              <div className="rounded border p-4">
                {eventDetails.fields.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          Date{" "}
                          <span className="text-xs text-gray-500">
                            (include rehearsals, if any)
                          </span>
                        </TableHead>
                        <TableHead>Optional Date/s</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead># of Pax</TableHead>
                        <TableHead>Set-Up</TableHead>
                        <TableHead>
                          Meal Req{" "}
                          <span className="text-xs text-gray-500">
                            (include dietary restrictions, if any)
                          </span>
                        </TableHead>
                        <TableHead>Function Room</TableHead>
                        <TableHead>Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {eventDetails.fields.map((event, index) => (
                        <TableRow key={event.id}>
                          <TableCell className="font-medium">
                            <DatePicker
                              date={event.date}
                              onChange={(date) => {
                                if (date) {
                                  eventDetails.update(index, {
                                    ...event,
                                    date,
                                  });
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <DatePicker
                              date={event.optionalDate}
                              onChange={(date) => {
                                if (date) {
                                  eventDetails.update(index, {
                                    ...event,
                                    optionalDate: date,
                                  });
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="time"
                              {...form.register(`eventDetails.${index}.time`)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              className="w-[200px]"
                              {...form.register(`eventDetails.${index}.pax`, {
                                valueAsNumber: true,
                              })}
                            />
                          </TableCell>
                          <TableCell>
                            <Combobox
                              items={leadFormData?.roomSetups ?? []}
                              selectedItem={leadFormData?.roomSetups?.find(
                                (setup) =>
                                  setup.name ===
                                  eventDetails.fields[index]?.setup?.name
                              )}
                              onChange={(selectedItem) => {
                                eventDetails.update(index, {
                                  ...event,
                                  setup: selectedItem,
                                });
                              }}
                              placeholder="Select One"
                            />
                          </TableCell>
                          <TableCell>
                            <Combobox
                              items={leadFormData?.mealReqs ?? []}
                              selectedItem={leadFormData?.mealReqs?.find(
                                (mealReq) =>
                                  mealReq.name ===
                                  eventDetails.fields[index]?.mealReq?.name
                              )}
                              onChange={(selectedItem) => {
                                eventDetails.update(index, {
                                  ...event,
                                  mealReq: selectedItem,
                                });
                              }}
                              placeholder="Select One"
                            />
                          </TableCell>
                          <TableCell>
                            <Combobox
                              items={leadFormData?.functionRooms ?? []}
                              selectedItem={leadFormData?.functionRooms?.find(
                                (functionRoom) =>
                                  functionRoom.name ===
                                  eventDetails.fields[index]?.functionRoom?.name
                              )}
                              onChange={(selectedItem) => {
                                eventDetails.update(index, {
                                  ...event,
                                  functionRoom: selectedItem,
                                });
                              }}
                              placeholder="Select One"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              {...form.register(
                                `eventDetails.${index}.remarks`
                              )}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                <FormControl>
                  <Button
                    type="button"
                    onClick={() => {
                      eventDetails.append({
                        date: new Date(),
                        functionRoom: undefined,
                        mealReq: undefined,
                        optionalDate: undefined,
                        pax: 0,
                        remarks: "",
                        setup: undefined,
                        time: new Date(),
                      });
                    }}
                  >
                    Add Date
                  </Button>
                </FormControl>
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
                </div>
              </div>
            </TabsContent>
            <TabsContent value="activity">
              <div className="rounded border p-4">
                {activity.fields.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date of Activity</TableHead>
                        <TableHead>Updated By</TableHead>
                        <TableHead>Latest Feedback Given By Client</TableHead>
                        <TableHead>Next Trace Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activity.fields.map((activity, index) => (
                        <TableRow key={activity.id}>
                          <TableCell className="font-medium">
                            <DatePicker
                              date={activity.date}
                              onChange={(date) => {
                                if (date) {
                                  form.setValue(`activity.${index}.date`, date);
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>Arna Monica Le</TableCell>
                          <TableCell>
                            <Input
                              {...form.register(
                                `activity.${index}.clientFeedback`
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <DatePicker
                              date={activity.nextTraceDate}
                              onChange={(date) => {
                                if (date) {
                                  form.setValue(
                                    `activity.${index}.nextTraceDate`,
                                    date
                                  );
                                }
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                <FormControl>
                  <Button
                    type="button"
                    onClick={() => {
                      activity.append({
                        date: new Date(),
                        clientFeedback: "",
                        nextTraceDate: undefined,
                        updatedBy: "",
                      });
                    }}
                  >
                    Add Activity
                  </Button>
                </FormControl>
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
