import fs from "node:fs";
import { PDFDocumentWithTables } from "~/utils/pdfDocumentWithTables";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { format as dateFormat } from "date-fns";
import { pipeline } from "node:stream/promises";
import { titleCase } from "~/utils/stringHelpers";

export const generatePdfRouter = createTRPCRouter({
  generateProposalForm: protectedProcedure
    .input(z.object({ leadId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const lead = await ctx.prisma.leadForm.findUnique({
        where: {
          id: input.leadId,
        },
        include: {
          contact: true,
          eventDetails: {
            include: {
              functionRoom: true,
              mealReqs: true,
              roomSetup: true,
            },
          },
          activities: {
            include: {
              updatedBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              date: "asc",
            },
          },
          company: true,
          eventType: true,
          leadType: true,
          rateType: true,
          salesAccountManager: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          inclusions: true,
        },
      });

      const MARGIN_X = 80;
      const MARGIN_TOP = 96;
      const MARGIN_BOT = 40;
      const fontReg = "public/fonts/WorkSans-Light.ttf";
      const fontBold = "public/fonts/WorkSans-Medium.ttf";
      const fontBoldItalic = "public/fonts/WorkSans-MediumItalic.ttf";

      const doc = new PDFDocumentWithTables({
        size: "A4",
        margins: {
          left: MARGIN_X,
          right: MARGIN_X,
          top: MARGIN_TOP,
          bottom: MARGIN_BOT,
        },
        bufferPages: true,
      })
        .fontSize(8)
        .font(fontReg);

      const doesProposalDirExists = fs.existsSync("public/proposals");
      if (!doesProposalDirExists) {
        await fs.promises.mkdir("public/proposals");
      }

      const pathToPdf = `proposals/${input.leadId}.pdf`;

      doc.lineGap(1.15);

      const today = new Date();
      let titleFullName = "";

      doc.font(fontBold).text(dateFormat(today, "MMMM d, yyyy"));
      doc.moveDown();

      if (lead?.company) {
        doc.text(lead.company.name);
        if (lead.company.address1) doc.text(lead.company.address1);
        if (lead.company.address2) doc.text(lead.company.address2);
        if (lead.company.city) {
          const cityProvincePostal = [
            lead.company.city,
            lead.company.province,
            lead.company.postalCode,
          ].filter((x) => x);
          doc.text(cityProvincePostal.join(", "));
        }
        doc.moveDown();
      }

      if (lead?.contact) {
        titleFullName = [
          lead.contact.title,
          lead.contact.firstName,
          lead.contact.lastName,
        ]
          .filter((x) => x)
          .join(" ");
        doc.text(titleFullName);
        if (lead.contact.phoneNumber) {
          doc.text(lead.contact.phoneNumber);
        } else if (lead.contact.mobileNumber) {
          doc.text(lead.contact.mobileNumber);
        }
        doc.text(lead.contact.email).moveDown();
      }

      doc.text("RE: Event Requirement", { align: "center" });

      doc.moveDown();

      doc
        .font(fontReg)
        .text("Dear", { continued: true })
        .font(fontBold)
        .text(` ${titleFullName},`)
        .font(fontReg)
        .moveDown()
        .text("Greetings from Eastwood Richmonde Hotel!")
        .font(fontReg)
        .moveDown()
        .text(
          "We are pleased to submit to you our proposed banquet package for your event. Indeed, we are grateful for the opportunity to be the venue for your upcoming function."
        )
        .moveDown()
        .text(
          "Here at Richmonde, we have designed our facilities and services to ensure that we provide more than just the essentials for a successful gathering. As a valued client, we would like to offer you with these special rates and arrangements for your banquet requirements."
        );

      doc.moveDown();

      doc
        .font(fontBold)
        .text("EVENT SPACE")
        .font(fontReg)
        .text(
          "The following details are based on the requisites of your event and the venue availability as of this writing:"
        )
        .moveDown();

      const rows =
        lead?.eventDetails?.map((detail, index) => {
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

          return [
            detail.date ? dateFormat(detail.date, "MMMM d, yyyy") : "-",
            `${startTime} - ${endTime}`,
            detail.pax?.toLocaleString() ?? "0",
            titleCase(detail.functionRoom?.name ?? ""),
            titleCase(detail.roomSetup?.name ?? ""),
            `${
              detail.rate
                ? `Php ${detail.rate?.toLocaleString() + ".00" ?? "-"}`
                : "-"
            }${lead.rateType ? " nett" : ""}`,
          ];
        }) ?? [];

      doc.table({
        headers: [
          "Date",
          "Time",
          "No. of Attendees",
          "Venue",
          "Set Up",
          lead?.rateType?.name === "per person"
            ? "Rate Per Person"
            : titleCase(lead?.rateType?.name ?? ""),
        ],
        rows,
      });

      const highlightText =
        "Please note that the hotel reserves the right to assign and re-assign venues based on availability and your set-up requirements. Venue is on tentative status; first to confirm.";

      doc
        .highlight(
          MARGIN_X,
          doc.y,
          doc.page.width - MARGIN_X * 2,
          doc.heightOfString(highlightText)
        )
        .text(highlightText)
        .moveDown();

      doc.font(fontBold).text("INCLUSION").font(fontReg);

      if (lead?.inclusions.length) {
        const rateConsumable = lead.inclusions.find(
          (inclusion) =>
            inclusion.name === "Rate is consumable of Food & Beverage"
        );

        if (rateConsumable) {
          doc.text(rateConsumable.name);
        }

        lead.inclusions
          .filter(
            (inclusion) =>
              inclusion.name !== "Rate is consumable of Food & Beverage"
          )
          .forEach((inclusion) => {
            doc.text(inclusion.name);
          });

        doc.moveDown();
      }

      doc
        .font(fontBold)
        .text("STATUS & CONFIRMATION", { align: "center" })
        .moveDown()
        .font(fontBoldItalic)
        .text(
          "Kindly be advised that the above-mentioned “Tentative” status means that, as of this writing, there is another client who has already signified their interest to book the venue applicable to your event but has not yet given their confirmation."
        )
        .moveDown()

        .text(
          "Should we be able to accommodate your event in one of our functions rooms, you may confirm your booking with us by sending an email to the undersigned. We will then email you back the Event Reservation Contract (ERC) which details the settlement of the ",
          {
            continued: true,
          }
        )
        .text("non-refundable down payment", {
          continued: true,
          underline: true,
        })
        .text(
          " equivalent to 50% of your total consumable rate to secure your booking on the above date. Payment due dates and other terms and conditions of your booking shall also be indicated in the ERC. Failure to settle this deposit on or before the date indicated in ERC will result in the release of your booking.",
          {
            underline: false,
          }
        )
        .moveDown();

      doc
        .font(fontBold)
        .text("VENUE RENTAL CHARGES & MINIMUM CONSUMABLE AMOUNT")
        .font(fontReg)
        .text(
          "Rental charge for the venue will be waived if the estimated total charges for food, beverage and amenities are equal to or greater than the minimum consumable amount for the venue."
        )
        .moveDown()
        .text(
          "Additional non-consumable rental rate per hour shall apply should the function extend beyond the number of hours specified in the contract. The hotel reserves the right to impose meeting room rental fees should you require additional function space or break-out rooms."
        )
        .moveDown();

      doc
        .font(fontBold)
        .text("BANQUET CONCESSIONS")
        .font(fontReg)
        .text("The following amenities may be provided to you free of charge:")
        .list(["Use of the following equipment:"], {
          bulletRadius: 1,
        })
        .list(
          ["(1) LCD Projector & screen", "Basic sound system"],
          MARGIN_X * 2,
          undefined,
          {
            bulletRadius: 1,
          }
        )
        .list(
          [
            "Function Room Set-Up",
            "Complimentary Parking passes for 10% of total attendees",
            "Complimentary Wi-Fi access for all participants",
          ],
          MARGIN_X,
          undefined,
          {
            bulletRadius: 1,
          }
        )
        .moveDown();

      doc
        .font(fontBold)
        .text("FINAL EVENT DETAILS & BILLING")
        .font(fontReg)
        .text(
          "After settlement of the non-refundable payment, we will discuss with you the particulars of your function in detail which will be specified in a Banquet Event Order (BEO). Details such as menu choice, set-up service time, etc., including the Hotel's banquet terms and conditions, will be indicated in the BEO which must be finalized and signed off at least 7 days prior to your event. Failure to sign the BEO before the deadline authorizes the Hotel to exercise its discretion in delivering the services during your event."
        )
        .moveDown()
        .text(
          "The contract balance after the initial deposit must be settled according to the schedule indicated in the ERC. Any additional charges, including incidentals, must be paid in full immediately after the event either in cash or credit card, unless you or your company has a credit line with the hotel, in which case a duly signed Letter of Authorization (LOA) must be submitted to the undersigned together with the signed ERC."
        )
        .moveDown();

      doc
        .font(fontBold)
        .text("CANCELLATION & POSTPONEMENT POLICY")
        .font(fontReg)
        .text(
          "The non-refundable deposit shall be forfeited in case of cancellation or rescheduling of the event. A new proposal will be drawn in case of a change in schedule."
        )
        .moveDown()
        .text(
          "We trust you find the above arrangements in order. Should you have further queries, please do not hesitate to contact the undersigned at telephone number ",
          {
            continued: true,
          }
        )
        .text("+63 2 570 7777", {
          continued: true,
          link: "tel:+6325707777",
        })
        .text(" loc. 8503 or email address ", {
          link: null,
          continued: true,
        })
        .fill("blue")
        .text("user@example.com", {
          continued: true,
          link: "mailto:user@example.com",
        })
        .fill("black")
        .text(".", {
          link: null,
        })
        .moveDown()
        .text(
          "If you would like to personally see our banquet facilities, it will be our pleasure to arrange for an ocular inspection at your convenience. You may also find out more about Eastwood Richmonde Hotels by logging on to our website at ",
          {
            continued: true,
          }
        )
        .text("www.richmondehotels.com.ph", {
          continued: true,
          underline: true,
          link: "www.richmondehotels.com.ph",
        })
        .text(
          " which showcases the hotel's key features, amenities and services.",
          {
            underline: false,
            link: null,
          }
        )
        .moveDown()
        .text(
          "Once again, thank you for considering us and we look forward to serving you and welcoming you and your guests to Eastwood Richmonde Hotel, where service is distinctly personal!"
        )
        .moveDown();

      doc
        .text("Sincerely,")
        .image("public/signature.png", undefined, doc.y + 8, {
          height: 60,
        })
        .moveDown(6)
        .text(lead?.salesAccountManager.name ?? "")
        .text("Sales Account Manager")
        .text("Eastwood Richmonde Hotel");

      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);

        //Header: Add page number
        let oldTopMargin = doc.page.margins.top;
        doc.page.margins.top = 0; //Dumb: Have to remove top margin in order to write into it

        doc.image(
          "public/eastwood_richmonde_hotel_logo.png",
          doc.page.width / 2 - 60,
          16,
          { width: 120, height: 60, align: "center" }
        );

        doc.page.margins.top = oldTopMargin; // ReProtect top margin

        //Footer: Add page number
        let oldBottomMargin = doc.page.margins.bottom;
        doc.page.margins.bottom = 0; //Dumb: Have to remove bottom margin in order to write into it

        doc
          .lineTo(MARGIN_X, doc.page.height - MARGIN_BOT + 2)
          .lineTo(doc.page.width - MARGIN_X, doc.page.height - MARGIN_BOT + 2)
          .lineWidth(1)
          .stroke();

        doc
          .fontSize(6)
          .text(
            "17 Orchard Road, Eastwood City, Bagumbayan, Quezon City 1100, Metro Manila, Philippines",
            0,
            doc.page.height - 32, // Centered vertically in bottom margin
            { align: "center" }
          )
          .text(
            "Tel: 632.570.7777",
            doc.x - doc.widthOfString(" • E-mail: erh@richmondehotel.com.ph"),
            undefined,
            {
              link: "tel:+6325707777",
              continued: true,
              align: "center",
            }
          )
          .text(" • ", doc.x + doc.widthOfString("•"), undefined, {
            continued: true,
            link: null,
            align: "center",
          })
          .text(
            "E-mail: erh@richmondehotel.com.ph",
            doc.x + doc.widthOfString("Tel: 632.570.7777 • "),
            undefined,
            {
              link: "mailto:erh@richmondehotel.com.ph",
              align: "center",
              continued: false,
            }
          )
          .text("Website: www.richmondehotels.com.ph", 0, undefined, {
            link: "www.richmondehotels.com.ph",
            align: "center",
          });

        doc.page.margins.bottom = oldBottomMargin; // ReProtect bottom margin
      }

      doc.end();

      await pipeline(doc, fs.createWriteStream(`public/${pathToPdf}`));

      return pathToPdf;
    }),
  cleanFile: protectedProcedure
    .input(z.object({ path: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await fs.promises.rm(`public/${input.path}`);
        return "";
      } catch (err) {
        return "";
      }
    }),
});
