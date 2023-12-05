import { renderToString } from "react-dom/server";
import { titleCase } from "./stringHelpers";
import { format as dateFormat } from "date-fns";
import type { Contact, EventType } from "@prisma/client";

export function generateMailto(contact: Contact) {
  return `"${[contact.title, contact.firstName, contact.lastName]
    .filter((x) => x)
    .join(" ")}" <${contact.email}>`;
}

export function generateSubject(
  eventType: EventType | null,
  dateRange: {
    eventLengthInDays: number;
    from: Date;
    to: Date;
  }
) {
  return `ERH Proposal - ${
    eventType ? titleCase(eventType.activity) : "Other"
  }${eventType ? ` ${titleCase(eventType.name)}` : ""} (${
    dateRange.eventLengthInDays === 1
      ? dateFormat(dateRange.from, "MMMM d, yyyy")
      : `${dateFormat(dateRange.from, "MMM d, yyyy")} - ${dateFormat(
          dateRange.to,
          "MMM d, yyyy"
        )}`
  })`;
}

export function generateBody({ contact }: { contact: Contact }) {
  return renderToString(
    <>
      <p>
        Dear {[contact.title, contact.lastName].filter((x) => x).join(" ")},
      </p>
      <p>
        <strong>Greetings from Eastwood Richmonde Hotel!</strong>
      </p>
      <p>
        We are pleased to submit our proposed banquet package for your event.
        Indeed, we are grateful for the opportunity to be the venue for your
        upcoming function.
      </p>
      <p>
        Kindly review the attachments and should you like to confirm your
        booking with us, <strong>please reply to this email</strong>. Do let me
        know if you have any questions or concerns.
      </p>
      <br />
      <br />
      <br />
    </>
  );
}
