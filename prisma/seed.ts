import * as datefns from "date-fns";
import { PrismaClient, EventStatus } from "@prisma/client";
import {
  functionRooms,
  mealReqs,
  rateTypes,
  roomSetups,
  eventTypes,
  leadTypes,
} from "./seed-data/data";
import { faker } from "@faker-js/faker";
const {
  person,
  phone,
  company: fakerCompany,
  date,
  internet,
  number,
  datatype,
  helpers,
  word,
  location,
  lorem,
} = faker;
const prisma = new PrismaClient();

if (!process.env.DEFAULT_PASSWORD) {
  console.log("DEFAULT_PASSWORD env variable must be set in .env file");
  process.exit();
}

async function main() {
  const corporateEvents: Array<{
    id: string;
    name: string;
    activity: string;
  } | null> = [null];
  const socialFunctionEvents: Array<{
    id: string;
    name: string;
    activity: string;
  } | null> = [null];

  const _eventTypes = Object.entries(eventTypes);

  for (const [eventType, types] of _eventTypes) {
    for (const type of types) {
      const event = await prisma.eventType.upsert({
        where: {
          name: eventType,
          activity: type,
        },
        update: {},
        create: {
          name: eventType,
          activity: type,
        },
      });
      if (eventType === "corporate") {
        corporateEvents.push(event);
      } else {
        socialFunctionEvents.push(event);
      }
    }
  }

  type Item = { id: string; name: string };

  const leadTypesArray: Item[] = [];
  const functionRoomsArray: Item[] = [];
  const mealReqsArray: Item[] = [];
  const roomSetupsArray: Item[] = [];
  const rateTypesArray: Item[] = [];

  for (const type of leadTypes) {
    const leadType = await prisma.leadType.upsert({
      where: { name: type },
      update: {},
      create: {
        name: type,
      },
    });
    leadTypesArray.push(leadType);
  }

  for (const room of functionRooms) {
    const roomType = await prisma.functionRoom.upsert({
      where: { name: room },
      update: {},
      create: {
        name: room,
      },
    });
    functionRoomsArray.push(roomType);
  }

  for (const mealReq of mealReqs) {
    const mealReqType = await prisma.mealReq.upsert({
      where: { name: mealReq },
      update: {},
      create: {
        name: mealReq,
      },
    });
    mealReqsArray.push(mealReqType);
  }

  for (const roomSetup of roomSetups) {
    const roomSetupType = await prisma.roomSetup.upsert({
      where: { name: roomSetup },
      update: {},
      create: {
        name: roomSetup,
      },
    });
    roomSetupsArray.push(roomSetupType);
  }

  for (const rateType of rateTypes) {
    const type = await prisma.rateType.upsert({
      where: { name: rateType },
      update: {},
      create: {
        name: rateType,
      },
    });
    rateTypesArray.push(type);
  }

  if (process.env.NODE_ENV === "development") {
    let seedCount = 0;

    if (process.argv[2]) {
      const count = parseInt(process.argv[2], 10);
      if (Number.isInteger(count) && Math.sign(count) === 1) {
        seedCount = count;
      }
    }

    const user = await prisma.user.upsert({
      where: {
        email: "user@example.com",
      },
      update: {},
      create: {
        email: "user@example.com",
        name: "user",
        password: process.env.DEFAULT_PASSWORD!,
        role: "salesManager",
        phoneNumber: "123-123-1234",
      },
    });

    const now = new Date();

    for (let i = 0; i < seedCount; i++) {
      const isCorporate = datatype.boolean();
      const isLiveIn = datatype.boolean();
      const eventLengthInDays = number.int({ min: 1, max: 5 });
      const startDate = date.soon();
      const endDate = datefns.addDays(startDate, eventLengthInDays - 1);
      const contactFirstName = person.firstName();
      const contactLastName = person.lastName();

      const contact = await prisma.contact.create({
        data: {
          email: internet.email({
            firstName: contactFirstName,
            lastName: contactLastName,
            provider: "example.com",
          }),
          firstName: contactFirstName,
          lastName: contactLastName,
          phoneNumber: phone.number(),
          title: person.prefix(person.sexType()),
        },
      });

      let company;
      if (isCorporate) {
        company = await prisma.organization.create({
          data: {
            name: fakerCompany.name(),
            phoneNumber: phone.number(),
            address1: location.streetAddress(),
            address2: location.secondaryAddress(),
          },
        });
      }

      const eventType = isCorporate
        ? helpers.arrayElement(corporateEvents)
        : helpers.arrayElement(socialFunctionEvents);

      try {
        let eventDetails = [];
        let i = 0;
        for (const _ of Array(eventLengthInDays)) {
          const randomDate = date.anytime();
          const startTime = datefns.format(randomDate, "HH:MM");
          const randomEndDate = datefns.addHours(
            randomDate,
            number.int({ min: 1, max: 8 })
          );
          const endTime = datefns.format(randomEndDate, "HH:MM");

          const detail = await prisma.eventDetails.create({
            data: {
              date: datefns.addDays(startDate, i),
              pax: number.int({ max: 200 }),
              roomSetupId: helpers.arrayElement(roomSetupsArray).id,
              functionRoomId: helpers.arrayElement(functionRoomsArray).id,
              remarks: lorem.sentence(),
              rate: number.int({ max: 500_000 }),
              rateTypeId: helpers.arrayElement(rateTypesArray).id,
              mealReqs: {
                connect: helpers.arrayElements(mealReqsArray, {
                  min: 1,
                  max: 3,
                }),
              },
              startTime,
              endTime,
            },
          });

          eventDetails.push(detail);
          i++;
        }

        await prisma.leadForm.create({
          data: {
            dateReceived: date.past({ refDate: now, years: 0.2 }),
            isCorporate,
            isLiveIn,
            eventLengthInDays,
            startDate,
            endDate,
            status: helpers.arrayElement(Object.values(EventStatus)),
            roomsBudget: isLiveIn ? number.int({ max: 50_000 }) : 0,
            banquetsBudget: number.int({ max: 50_000 }),
            contactId: contact.id,
            companyId: company?.id ?? null,
            salesAccountManagerId: user.id,
            leadTypeId: helpers.arrayElement(leadTypesArray).id,
            eventTypeId: eventType?.id,
            eventTypeOther: !eventType ? word.verb() : null,
            lastDateSent: helpers.maybe(() => date.recent({ refDate: now }), {
              probability: 0.5,
            }),
            onSiteDate: helpers.maybe(
              () =>
                date.soon({
                  refDate: now,
                  days: number.int({ min: 1, max: 15 }),
                }),
              { probability: 0.7 }
            ),
            roomType: isLiveIn ? word.adjective() : null,
            roomTotal: isLiveIn ? number.int({ max: 200 }) : null,
            roomArrivalDate: isLiveIn ? startDate : null,
            roomDepartureDate: isLiveIn ? endDate : null,
            otherHotelConsiderations: helpers.maybe(
              () => {
                return Array(number.int({ min: 1, max: 4 }))
                  .fill(null)
                  .map((_) => `${word.noun()} hotel`)
                  .join(", ");
              },
              { probability: 0.3 }
            ),
            activities: {
              createMany: {
                data: Array(number.int({ max: 4 }))
                  .fill(null)
                  .map((_, index) => ({
                    date: datefns.addDays(startDate, index),
                    updatedById: user.id,
                    clientFeedback: lorem.sentences(),
                    nextTraceDate: helpers.maybe(
                      () =>
                        date.soon({
                          refDate: now,
                          days: number.int({ min: 1, max: 15 }),
                        }),
                      {
                        probability: 0.2,
                      }
                    ),
                  })),
              },
            },
            eventDetails: {
              connect: eventDetails,
            },
          },
        });
      } catch (err) {
        console.log(err);
      }
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
