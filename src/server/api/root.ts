import { createTRPCRouter } from "~/server/api/trpc";

import { salesManagersRouter } from "~/server/api/routers/salesManager";
import { functionRoomsRouter } from "~/server/api/routers/functionRooms";
import { mealReqsRouter } from "~/server/api/routers/mealReqs";
import { roomSetupsRouter } from "~/server/api/routers/roomSetups";
import { leadsRouter } from "~/server/api/routers/leads";
import { usersRouter } from "~/server/api/routers/users";
import { activitiesRouter } from "~/server/api/routers/activities";
import { eventDetailsRouter } from "~/server/api/routers/eventDetails";
import { inclusionsRouter } from "~/server/api/routers/inclusions";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  leads: leadsRouter,
  salesManagers: salesManagersRouter,
  functionRooms: functionRoomsRouter,
  mealReqs: mealReqsRouter,
  roomSetups: roomSetupsRouter,
  users: usersRouter,
  activities: activitiesRouter,
  eventDetails: eventDetailsRouter,
  inclusions: inclusionsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
