import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path, { relative } from "path";

const prisma = new PrismaClient();

function parseText(relativePath: string) {
  return fs
    .readFileSync(path.resolve(__dirname + relativePath))
    .toString()
    .split("\n")
    .filter((x) => x);
}

async function main() {
  const functionRooms = parseText("/seed-data/function_rooms.txt");
  const mealReqs = parseText("/seed-data/meal_req.txt");
  const roomSetups = parseText("/seed-data/room_setups.txt");
  const rateTypes = parseText("/seed-data/rate_types.txt");

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
