import type {
  LeadForm,
  Contact,
  Organization,
  EventDetails,
  Inclusion,
  LeadFormActivity,
  EventType,
} from "@prisma/client";
import { forwardRef, useRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { CalendarDate } from "./CalendarDate";
import { Calendar, LucideIcon, X } from "lucide-react";
import { statusColors } from "~/utils/statusColors";
import { eventIcons } from "~/utils/eventIcons";
import * as datefns from "date-fns";

const MAX_CALENDAR_DAYS = 7;

type Lead = LeadForm & {
  contact: Contact | null;
  company: Organization | null;
  eventDetails: EventDetails[];
  inclusions: Inclusion[];
  activities: LeadFormActivity[];
  eventType: EventType | null;
};

export const LeadSummaryModal = forwardRef<
  { showModal: () => void; close: () => void },
  { lead: Lead | null }
>(({ lead }, forwardRef) => {
  const ref = useRef<HTMLDialogElement | null>(null);

  useImperativeHandle(
    forwardRef,
    () => {
      return {
        showModal() {
          return ref.current?.showModal();
        },
        close() {
          return ref.current?.close();
        },
      };
    },
    []
  );
  if (!lead) {
    return null;
  }

  const Icon =
    eventIcons[lead.eventType?.activity as keyof typeof eventIcons] ?? Calendar;

  return (
    <dialog
      ref={ref}
      className="relative h-full max-h-[80vh] w-full max-w-5xl rounded-lg shadow-lg"
    >
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="absolute right-0 top-0"
        onClick={() => {
          if (ref.current) {
            ref.current.close();
          }
        }}
      >
        <X />
      </Button>
      <div className="space-y-4 p-4">
        <h1 className="text-2xl">{lead.contact?.firstName}'s Event</h1>
        <div className="flex">
          {Array(MAX_CALENDAR_DAYS)
            .fill(null)
            .map((_, index) => {
              let newDate = datefns.setWeek(
                datefns.setDay(datefns.startOfDay(new Date()), index),
                datefns.getWeek(lead.startDate)
              );

              const isSameWeek = datefns.isSameWeek(
                lead.startDate,
                lead.endDate
              );
              if (!isSameWeek) {
                // shift days over so dates are visible
                newDate = datefns.addDays(
                  newDate,
                  datefns.differenceInDays(lead.endDate, lead.startDate)
                );
              }

              let isDayOf = false;

              try {
                isDayOf = datefns.isWithinInterval(newDate, {
                  start: datefns.startOfDay(lead.startDate),
                  end: datefns.endOfDay(lead.endDate),
                });
              } catch (err) {}

              return (
                <CalendarDate
                  key={index}
                  date={newDate}
                  size="md"
                  className={isDayOf ? " bg-slate-200 font-bold" : ""}
                />
              );
            })}
        </div>
        <div>
          <p>
            {lead.contact?.firstName}
            {lead.contact?.lastName ? ` ${lead.contact.lastName}` : ""}
          </p>
          <p>{lead.contact?.email}</p>
          <p>Mobile: {lead.contact?.mobileNumber}</p>
          <p>Tel: {lead.contact?.phoneNumber}</p>
        </div>
        <div className="flex gap-2">
          <Icon size={24} className="text-blue-400" />
          <div className="capitalize">
            {lead.eventType?.activity ?? "Other"}
          </div>
        </div>
        {lead.eventTypeOther && <div>{lead.eventTypeOther}</div>}
      </div>
    </dialog>
  );
});

LeadSummaryModal.displayName = "LeadSummaryModal";
