"use client";

import { useSession } from "next-auth/react";
import { DefaultLayout } from "~/layouts/default";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadTypesForm } from "~/ui/admin/LeadTypesForm";
import { EventTypesForm } from "~/ui/admin/EventTypesForm";
import { FunctionRoomsForm } from "~/ui/admin/FunctionRoomsForm";
import { RoomSetupsForm } from "~/ui/admin/RoomSetupsForm";
import { MealReqsForm } from "~/ui/admin/MealReqsForm";
import { RateTypesForm } from "~/ui/admin/RateTypesForm";
import { InclusionsForm } from "~/ui/admin/InclusionsForm";

export default function ProfilePage() {
  const { data: session } = useSession();

  if (!session?.user) return <div />;

  return (
    <DefaultLayout>
      <Tabs defaultValue="lead-types">
        <TabsList>
          <TabsTrigger value="lead-types">Lead Types</TabsTrigger>
          <TabsTrigger value="event-types">Event Types</TabsTrigger>
          <TabsTrigger value="function-rooms">Function Rooms</TabsTrigger>
          <TabsTrigger value="room-setups">Room Setups</TabsTrigger>
          <TabsTrigger value="meal-requirements">Meal Requirements</TabsTrigger>
          <TabsTrigger value="rate-types">Rate Types</TabsTrigger>
          <TabsTrigger value="inclusions">Inclusions</TabsTrigger>
        </TabsList>

        <TabsContent value="lead-types">
          <LeadTypesForm />
        </TabsContent>

        <TabsContent value="event-types">
          <EventTypesForm />
        </TabsContent>

        <TabsContent value="function-rooms">
          <FunctionRoomsForm />
        </TabsContent>

        <TabsContent value="room-setups">
          <RoomSetupsForm />
        </TabsContent>

        <TabsContent value="meal-requirements">
          <MealReqsForm />
        </TabsContent>

        <TabsContent value="rate-types">
          <RateTypesForm />
        </TabsContent>

        <TabsContent value="inclusions">
          <InclusionsForm />
        </TabsContent>
      </Tabs>
    </DefaultLayout>
  );
}
