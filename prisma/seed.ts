import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import {
  functionRooms,
  mealReqs,
  rateTypes,
  roomSetups,
  eventTypes,
  leadTypes,
} from "./seed-data/data";

const prisma = new PrismaClient();

async function main() {
  const _eventTypes = Object.entries(eventTypes);

  for (const [eventType, types] of _eventTypes) {
    for (const type of types) {
      await prisma.eventType.upsert({
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
    }
  }

  for (const type of leadTypes) {
    await prisma.leadType.upsert({
      where: { name: type },
      update: {},
      create: {
        name: type,
      },
    });
  }

  for (const room of functionRooms) {
    await prisma.functionRoom.upsert({
      where: { name: room },
      update: {},
      create: {
        name: room,
      },
    });
  }

  for (const mealReq of mealReqs) {
    await prisma.mealReq.upsert({
      where: { name: mealReq },
      update: {},
      create: {
        name: mealReq,
      },
    });
  }

  for (const roomSetup of roomSetups) {
    await prisma.roomSetup.upsert({
      where: { name: roomSetup },
      update: {},
      create: {
        name: roomSetup,
      },
    });
  }

  for (const rateType of rateTypes) {
    await prisma.rateType.upsert({
      where: { name: rateType },
      update: {},
      create: {
        name: rateType,
      },
    });
  }

  await prisma.user.upsert({
    where: {
      email: "user@example.com",
    },
    update: {},
    create: {
      email: "user@example.com",
      name: "user",
      password: "123",
      role: "salesManager",
      phoneNumber: "123-123-1234",
    },
  });
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
