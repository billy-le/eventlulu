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

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Combobox } from "~/ui/Combobox";

const leadTypeOptions = [
  "phone-in",
  "walk-in",
  "email",
  "referral",
  "sales call",
  "telemarketing",
];
const corporateEventOptions = [
  "convention",
  "conference/seminar",
  "training: planning session",
  "fellowship/team building",
  "business meeting",
  "luncheon/dinner",
  "other",
];
const socialFunctionOptions = [
  "wedding",
  "debut",
  "baptismal",
  "kids party",
  "birthday party",
  "other",
];

const formSchema = z.object({
  isCorporate: z.boolean(),
  isLiveIn: z.boolean(),
  dateReceived: z.date(),
  dateSent: z.date(),
  leadType: z.string(),
  salesManager: z.string(),
  siteInspectionDate: z.date(),
  siteInspectionDateOptional: z.date(),
  contact: z.object({
    firstName: z.string(),
    lastName: z.string(),
    company: z.string(),
    address: z.string(),
    email: z.string().email(),
    phoneNumber: z.string(),
    mobileNumber: z.string(),
  }),
  eventType: z.string(),
  eventTypeOther: z.string().optional(),
  dates: z.array(
    z.object({
      date: z.date(),
      optionalDate: z.date().optional(),
      time: z.string().datetime(),
      pax: z.number().positive(),
      setup: z.string(),
      mealReq: z.string(),
      functionRoom: z.string(),
      remarks: z.string(),
    })
  ),
  roomDetails: z.object({
    numberOfRooms: z.number().positive(),
    roomType: z.string(),
    arrivalDate: z.date(),
    departureDate: z.date(),
  }),
  otherDetails: z.object({
    estimatedBudget: z.object({
      banquets: z.number().positive(),
      rooms: z.number().positive(),
    }),
    otherHotelsConsidered: z.string(),
    rateGiven: z.number().positive(),
  }),
  activity: z.array(
    z.object({
      date: z.date(),
      updatedBy: z.string(),
      clientFeedback: z.string(),
      nextTraceDate: z.date().optional(),
    })
  ),
});

export default function Home() {
  const { data: session, status } = useSession();
  const { data: leads, status: leadsStatus } = api.leads.getLeads.useQuery();
  const { data: salesManagers } = api.salesManagers.getSalesManagers.useQuery();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dateReceived: new Date(),
      dateSent: undefined,
      salesManager: "Arna Monica Le",
      dates: [
        {
          date: new Date(),
          functionRoom: "",
          mealReq: "",
          optionalDate: undefined,
          pax: 0,
          remarks: "",
          setup: "",
          time: new Date().toISOString(),
        },
      ],
    },
  });

  const formValues = useWatch<z.infer<typeof formSchema>>(form);

  const dates = useFieldArray({ name: "dates", control: form.control });
  const activity = useFieldArray({ name: "activity", control: form.control });
  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  if (status === "unauthenticated") {
    window.location.replace("/login");
    return;
  }

  if (!session) {
    return null;
  }

  // return (
  //   <DefaultLayout>
  //     <DataTable
  //       columns={[
  //         {
  //           accessorKey: "createDate",
  //           header: "Event Date",
  //           cell: ({ row }) => {
  //             const lead = row.original;
  //             console.log({ lead });
  //             return <></>;
  //           },
  //         },
  //         {
  //           accessorKey: "contact",
  //           header: "Contact",
  //           cell: ({ row }) => {
  //             const lead = row.original;

  //             return <></>;
  //           },
  //         },
  //         {
  //           accessorKey: "amount",
  //           header: "Amount",
  //         },
  //         {
  //           id: "actions",
  //           cell: ({ row }) => {
  //             return (
  //               <DropdownMenu>
  //                 <DropdownMenuTrigger asChild>
  //                   <Button variant="ghost" className="h-8 w-8 p-0">
  //                     <span className="sr-only">Open menu</span>
  //                     <MoreHorizontal className="h-4 w-4" />
  //                   </Button>
  //                 </DropdownMenuTrigger>
  //                 <DropdownMenuContent align="end">
  //                   <DropdownMenuLabel>Actions</DropdownMenuLabel>
  //                   <DropdownMenuItem>Mark as Sent</DropdownMenuItem>
  //                   <DropdownMenuSeparator />
  //                   <DropdownMenuItem>Generate Proposal PDF</DropdownMenuItem>
  //                   <DropdownMenuItem>Generate Lead Form PDF</DropdownMenuItem>
  //                 </DropdownMenuContent>
  //               </DropdownMenu>
  //             );
  //           },
  //         },
  //       ]}
  //       data={leads || []}
  //     />
  //   </DefaultLayout>
  // );

  return (
    <DefaultLayout>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-8"
                        >
                          {leadTypeOptions.map((type) => (
                            <FormItem
                              key={type}
                              className="flex items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <RadioGroupItem value={type} />
                              </FormControl>
                              <FormLabel className="font-normal capitalize">
                                {type}
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
                            items={salesManagers || []}
                            selectedItem={salesManagers?.find(
                              (manager) =>
                                manager.name === formValues.salesManager
                            )}
                            onChange={(selectedItem) => {
                              form.setValue("salesManager", selectedItem.name);
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
                            <Input {...field} />
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
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-8"
                        >
                          {formValues.isCorporate
                            ? corporateEventOptions.map((eventType) => (
                                <FormItem
                                  key={eventType}
                                  className="flex items-center space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <RadioGroupItem value={eventType} />
                                  </FormControl>
                                  <FormLabel className="font-normal capitalize">
                                    {eventType}
                                  </FormLabel>
                                </FormItem>
                              ))
                            : socialFunctionOptions.map((eventType) => (
                                <FormItem
                                  key={eventType}
                                  className="flex items-center space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <RadioGroupItem value={eventType} />
                                  </FormControl>
                                  <FormLabel className="font-normal capitalize">
                                    {eventType}
                                  </FormLabel>
                                </FormItem>
                              ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {formValues.eventType === "other" && (
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
                      name="contact.company"
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
                      name="contact.address"
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
                {dates.fields.length > 0 && (
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
                      {dates.fields.map((date, index) => (
                        <TableRow key={date.id}>
                          <TableCell className="font-medium">
                            <DatePicker
                              date={date.date}
                              onChange={(date) => {
                                if (date) {
                                  form.setValue(`dates.${index}.date`, date);
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <DatePicker
                              date={date.optionalDate}
                              onChange={(date) => {
                                if (date) {
                                  form.setValue(
                                    `dates.${index}.optionalDate`,
                                    date
                                  );
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="time"
                              {...form.register(`dates.${index}.time`)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              {...form.register(`dates.${index}.pax`)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input {...form.register(`dates.${index}.setup`)} />
                          </TableCell>
                          <TableCell>
                            <Input
                              {...form.register(`dates.${index}.mealReq`)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              {...form.register(`dates.${index}.functionRoom`)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              {...form.register(`dates.${index}.remarks`)}
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
                      dates.append({
                        date: new Date(),
                        functionRoom: "",
                        mealReq: "",
                        optionalDate: undefined,
                        pax: 0,
                        remarks: "",
                        setup: "",
                        time: new Date().toISOString(),
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
                    name="otherDetails.estimatedBudget.banquets"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banquet</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="otherDetails.estimatedBudget.rooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rooms</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="otherDetails.otherHotelsConsidered"
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
                    name="otherDetails.rateGiven"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rate Given</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
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
