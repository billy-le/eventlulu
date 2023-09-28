import type {
  LeadForm,
  Contact,
  Organization,
  EventDetails,
  Inclusion,
  LeadFormActivity,
} from "@prisma/client";
import { forwardRef, useRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import * as datefns from "date-fns";

type Lead = LeadForm & {
  contact: Contact | null;
  company: Organization | null;
  eventDetails: EventDetails[];
  inclusions: Inclusion[];
  activities: LeadFormActivity[];
};

export const LeadSummaryModal = forwardRef<
  { showModal: () => void; close: () => void },
  { lead: Lead | null }
>(function ({ lead }, forwardRef) {
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
      <div className="flex h-full justify-between">
        <div className="w-2/3 p-4">
          <h1 className="text-2xl">{lead.contact?.firstName}'s Event</h1>
          <p className="text-xs">{lead.contact?.email}</p>
          <div className="text-right"></div>
        </div>
        <div className="w-1/3 bg-slate-100 p-4">
          <p>Start Date: {datefns.format(lead.startDate, "MM/dd/yyyy")}</p>
          <p>End Date: {datefns.format(lead.endDate, "MM/dd/yyyy")}</p>
        </div>
      </div>
    </dialog>
  );
});

LeadSummaryModal.displayName = "LeadSummaryModal";
