"use client";
import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";
import { useForm, useWatch, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DatePicker } from "src/ui/DatePicker";
import * as z from "zod";

const generationOptions = [
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
  leadGeneration: z.string(),
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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dateReceived: new Date(),
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

  return (
    <>
      <Head>
        <title>Eventlulu</title>
        <meta name="description" content="Me" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-gray-100 py-10">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto max-w-6xl space-y-8"
          >
            <FormField
              control={form.control}
              name="isCorporate"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
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
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
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

            {formValues.isLiveIn && (
              <div className="grid grid-cols-2 gap-4 rounded-md border p-4">
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
                <FormItem className="space-y-3">
                  <FormLabel>Event Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
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

            {dates.fields.length > 0 && (
              <Table>
                <TableCaption>A list of events.</TableCaption>
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
                        <Input {...form.register(`dates.${index}.mealReq`)} />
                      </TableCell>
                      <TableCell>
                        <Input
                          {...form.register(`dates.${index}.functionRoom`)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input {...form.register(`dates.${index}.remarks`)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <div className="rounded-md border p-4">
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

            {activity.fields.length > 0 && (
              <Table>
                <TableCaption>A list of events.</TableCaption>
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
                      <TableCell>Arna Monica</TableCell>
                      <TableCell>
                        <Input
                          {...form.register(`activity.${index}.clientFeedback`)}
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

            <FormItem>
              <FormControl>
                <Button type="submit">Save</Button>
              </FormControl>
            </FormItem>
          </form>
        </Form>
      </main>
    </>
  );
}
