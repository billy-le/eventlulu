import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DateRangePicker } from "~/ui/DateRangePicker";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DollarSign, Users, CalendarDays, TrendingUp } from "lucide-react";
import { DefaultLayout } from "~/layouts/default";
import { CycleNumbers } from "~/ui/CycleNumbers";

import { startOfMonth, startOfDay } from "date-fns";
import { DateRange } from "react-day-picker";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Example dashboard app built using the components.",
};

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(startOfMonth(new Date())),
    to: new Date(),
  });
  const [greeting, setGreeting] = useState("");
  const { data: session } = useSession();

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours > 0 && hours < 12) {
      setGreeting(`Good morning, ${session?.user?.name}`);
    } else if (hours > 12 && hours < 18) {
      setGreeting(`Good afternoon, ${session?.user?.name}`);
    } else {
      setGreeting(`Good evening, ${session?.user?.name}`);
    }
  }, [session]);

  return (
    <DefaultLayout>
      <div className="flex-col md:flex">
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">{greeting}</h2>
            <DateRangePicker
              dateRange={dateRange}
              onDateChange={(dateRange) => {
                if (dateRange) {
                  setDateRange(dateRange);
                }
              }}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Confirmed Revenue
                </CardTitle>
                <DollarSign size="16" className="text-green-500" />
              </CardHeader>
              <CardContent>
                {/* <CycleNumbers displayNumbers="$45,231.89" /> */}
                <div className="text-2xl font-bold">$45,231.89</div>

                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Leads Generated
                </CardTitle>
                <Users size="16" className="text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+2350</div>
                <p className="text-xs text-muted-foreground">
                  +180.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Potential Sales
                </CardTitle>
                <TrendingUp size="16" className="text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+12,234</div>
                <p className="text-xs text-muted-foreground">
                  +19% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Events Happening Today
                </CardTitle>
                <CalendarDays size="16" className="text-pink-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  +201 since last hour
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">{/* <Overview /> */}</CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Leads</CardTitle>
                <CardDescription>
                  You made 265 sales this month.
                </CardDescription>
              </CardHeader>
              <CardContent>{/* <RecentSales /> */}</CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
