import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { format as dateFormat } from "date-fns";
import Image from "next/image";

export default function ProposalPage() {
  const router = useRouter();
  const leadId = router.query["leadId"];
  const { data: leadData = [] } = api.leads.getLeads.useQuery({
    leadId: leadId as string,
  });

  const today = new Date();

  const lead = leadData[0];
  if (!lead) return null;
  return (
    <main id="proposal" className="font-garamond text-sm">
      <table>
        <thead>
          <tr>
            <th>
              <Image
                src="/eastwood_richmonde_hotel_logo.png"
                alt="Eastwood Richmonde Hotel Logo"
                height={96}
                width={177.6}
                className="mx-auto"
              />
              <br />
              <br />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="space-y-4">
              <div className="font-bold">
                {dateFormat(today, "MMMM d, yyyy")}
              </div>
              {lead.company && (
                <div className="font-bold">
                  <div>{lead.company.name}</div>
                  <div>{lead.company.address1}</div>
                  <div>{lead.company.address2}</div>
                </div>
              )}
              {lead.contact && (
                <div className="font-bold">
                  <div>
                    {lead.contact.title} {lead.contact.firstName}{" "}
                    {lead.contact.lastName}
                  </div>
                  <div>{lead.contact.phoneNumber}</div>
                  <div>{lead.contact.email}</div>
                </div>
              )}
              <h3 className="text-center font-bold">RE: Event Requirement</h3>
              <div>
                Dear{" "}
                <span className="font-bold">
                  {lead.contact.title} {lead.contact?.lastName}
                </span>
                ,
              </div>
              <p>Greetings from Eastwood Richmonde Hotel!</p>
              <p>
                We are pleased to submit to you our proposed banquet package for
                your event. Indeed, we are grateful for the opportunity to be
                the venue for your upcoming function.
              </p>
              <p>
                Here at Richmonde, we have designed our facilities and services
                to ensure that we provide more than just the essentials for a
                successful gathering. As a valued client, we would like to offer
                you with these special rates and arrangements for your banquet
                requirements.
              </p>
              <div>
                <h2 className="font-bold">EVENT SPACE</h2>
                <p>
                  The following details are based on the requisites of your
                  event and the venue availability as of this writing:
                </p>
                <table className="w-full text-center capitalize">
                  <thead>
                    <tr>
                      <th className="border border-black">Date</th>
                      <th className="border border-black">Time</th>
                      <th className="border border-black">No. of Attendees</th>
                      <th className="border border-black">Venue</th>
                      <th className="border border-black">Set Up</th>
                      <th className="border border-black">Status</th>
                      <th className="border border-black">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lead.eventDetails.map((detail, index) => {
                      const a = detail.startTime?.split(":");
                      const b = detail.endTime?.split(":");
                      const startTime = detail.startTime
                        ? dateFormat(
                            new Date(
                              0,
                              0,
                              0,
                              parseInt(a?.[0] ?? "0", 10),
                              parseInt(a?.[1] ?? "0", 10)
                            ),
                            "h:mm a"
                          )
                        : "0";
                      const endTime = detail.endTime
                        ? dateFormat(
                            new Date(
                              0,
                              0,
                              0,
                              parseInt(b?.[0] ?? "0", 10),
                              parseInt(b?.[1] ?? "0", 10)
                            ),
                            "h:mm a"
                          )
                        : "0";

                      return (
                        <tr key={detail.id}>
                          <td className="border border-black text-left">
                            {detail.date
                              ? dateFormat(detail.date, "MMMM d, yyyy")
                              : "-"}
                          </td>
                          <td className="border border-black">
                            {startTime} - {endTime}
                          </td>
                          <td className="border border-black">
                            {detail.pax?.toLocaleString()}
                          </td>
                          <td className="border border-black">
                            <div>{detail.functionRoom?.name}</div>
                          </td>
                          <td className="border border-black">
                            {detail.roomSetup?.name}
                          </td>
                          {index === 0 ? (
                            <td
                              rowSpan={lead.eventDetails.length}
                              className="border border-black"
                            >
                              Tenative (first to confirm)
                            </td>
                          ) : null}
                          <td className="border border-black">
                            {detail.rate?.toLocaleString()}
                            {detail.rateType?.name
                              ? ` / ${detail.rateType.name}`
                              : ""}
                          </td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td colSpan={7} className="text-left">
                        <mark className="italic">
                          Please note that the hotel reserves the right to
                          assign and re-assign venues based on availability and
                          your set-up requirements.
                        </mark>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="font-bold">INCLUSION</h2>
              <em>Rate is consumable of Food & Beverage</em>

              <h2 className="text-center font-bold">STATUS & CONFIRMATION</h2>
              <p className="font-bold italic">
                Kindly be advised that the above-mentioned “Tentative” status
                means that, as of this writing, there is another client who has
                already signified their interest to book the venue applicable to
                your event but has not yet given their confirmation.
              </p>
              <p className="font-bold italic">
                Should we be able to accommodate your event in one of our
                functions rooms, you may confirm your booking with us by sending
                an email to the undersigned. We will then email you back the
                Event Reservation Contract (ERC) which details the settlement of
                the{" "}
                <span className="underline">non-refundable down payment</span>{" "}
                equivalent to 50% of your total consumable rate to secure your
                booking on the above date. Payment due dates and other terms and
                conditions of your booking shall also be indicated in the ERC.
                Failure to settle this deposit on or before the date indicated
                in ERC will result in the release of your booking.
              </p>

              <div>
                <h2 className="font-bold">
                  VENUE RENTAL CHARGES & MINIMUM CONSUMABLE AMOUNT
                </h2>
                <p>
                  Rental charge for the venue will be waived if the estimated
                  total charges for food, beverage and amenities are equal to or
                  greater than the minimum consumable amount for the venue.
                </p>
                <br />
                <p>
                  Additional non-consumable rental rate per hour shall apply
                  should the function extend beyond the number of hours
                  specified in the contract. The hotel reserves the right to
                  impose meeting room rental fees should you require additional
                  function space or break-out rooms.
                </p>
              </div>

              <div>
                <h2 className="font-bold">BANQUET CONCESSIONS</h2>
                <p>
                  The following amenities may be provided to you free of charge:
                </p>
                <ul className="list-inside list-disc pl-4">
                  <li>
                    Use of the following equipment:
                    <ul className="list-inside list-disc pl-4">
                      <li>(1) LCD Projector & screen</li>
                      <li>Basic sound system</li>
                    </ul>
                  </li>
                  <li>Function Room Set-Up</li>
                  <li>
                    Complimentary Parking passes for 10% of total attendees
                  </li>
                  <li>Complimentary Wi-Fi access for all participants</li>
                </ul>
              </div>

              <div>
                <h2 className="font-bold">FINAL EVENT DETAILS & BILLING</h2>
                <p>
                  fter settlement of the non-refundable payment, we will discuss
                  with you the particulars of your function in detail which will
                  be specified in a Banquet Event Order (BEO). Details such as
                  menu choice, set-up service time, etc., including the Hotel's
                  banquet terms and conditions, will be indicated in the BEO
                  which must be finalized and signed off at least 7 days prior
                  to your event. Failure to sign the BEO before the deadline
                  authorizes the Hotel to exercise its discretion in delivering
                  the services during your event.
                </p>
                <p>
                  The contract balance after the initial deposit must be settled
                  according to the schedule indicated in the ERC. Any additional
                  charges, including incidentals, must be paid in full
                  immediately after the event either in cash or credit card,
                  unless you or your company has a credit line with the hotel,
                  in which case a duly signed Letter of Authorization (LOA) must
                  be submitted to the undersigned together with the signed ERC.
                </p>
              </div>

              <div>
                <h2 className="font-bold">
                  CANCELLATION & POSTPONEMENT POLICY
                </h2>
                <p>
                  The non-refundable deposit shall be forfeited in case of
                  cancellation or rescheduling of the event. A new proposal will
                  be drawn in case of a change in schedule.
                </p>
              </div>

              <p>
                We trust you find the above arrangements in order. Should you
                have further queries, please do not hesitate to contact the
                undersigned at telephone number +63 2 570 7777 loc. 8503 or
                email address{" "}
                <a
                  href={`mailto:${lead.salesAccountManager.email}`}
                  className="text-blue-500"
                >
                  {lead.salesAccountManager.email}
                </a>
                .
              </p>
              <p>
                If you would like to personally see our banquet facilities, it
                will be our pleasure to arrange for an ocular inspection at your
                convenience. You may also find out more about Eastwood Richmonde
                Hotels by logging on to our website at{" "}
                <a
                  href="https://www.richmondehotels.com.ph"
                  className="text-blue-500"
                  target="__blank"
                  rel="noreferrer"
                >
                  www.richmondehotels.com.ph
                </a>{" "}
                which showcases the hotel's key features, amenities and
                services.
              </p>
              <p>
                Once again, thank you for considering us and we look forward to
                serving you and welcoming you and your guests to Eastwood
                Richmonde Hotel, where service is distinctly personal!
              </p>
              <div>Sincerely,</div>

              <div>
                <div className="capitalize">
                  {lead.salesAccountManager.name}
                </div>
                <div>Sales Account Manager</div>
                <div>Eastwood Richmonde Hotel</div>
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th className="border-t-2 border-black pt-2 text-center text-[10px] font-normal leading-tight">
              <div>
                17 Orchard Road, Eastwood City, Bagumbayan, Quezon City 1100,
                Metro Manila, Philippines
              </div>
              <div>
                Tel: 632.570.7777 • Fax: 632.352.7281 • E-mail:{" "}
                <a
                  href="mailto:erh@richmondehotel.com.ph"
                  className="text-blue-500"
                >
                  erh@richmondehotel.com.ph
                </a>
              </div>
              <div>
                Website:{" "}
                <a
                  href="https://www.richmondehotels.com.ph"
                  className="text-blue-500"
                >
                  www.richmondehotels.com.ph
                </a>
              </div>
            </th>
          </tr>
        </tfoot>
      </table>
    </main>
  );
}
