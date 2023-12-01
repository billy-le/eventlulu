"use client";

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
import {
  DollarSign,
  Users,
  CalendarDays,
  TrendingUp,
  Plus,
} from "lucide-react";
import { DefaultLayout } from "~/layouts/default";
import { CycleNumbers } from "~/ui/CycleNumbers";
import { RecentLeads } from "~/ui/RecentLeads";

import { startOfMonth, startOfDay } from "date-fns";
import { DateRange } from "react-day-picker";
import { api } from "~/utils/api";
import Link from "next/link";

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
  const [currency, setCurrency] = useState(new Intl.NumberFormat());
  const { data: session } = useSession();

  const {
    data: dashboardStats,
    isLoading,
    isError,
  } = api.dashboard.getDashboardStats.useQuery({
    from: dateRange.from!,
    to: dateRange.to!,
  });
  const { data: leads } = api.leads.getLeads.useQuery({
    take: 5,
    orderBy: [{ createDate: "desc" }],
  });

  useEffect(() => {
    const hours = new Date().getHours();
    let userName = session?.user?.name ?? "";
    if (hours > 0 && hours < 12) {
      setGreeting(`Good morning${userName ? `, ${userName}` : ""}`);
    } else if (hours > 12 && hours < 18) {
      setGreeting(`Good afternoon${userName ? `, ${userName}` : ""}`);
    } else {
      setGreeting(`Good evening${userName ? `, ${userName}` : ""}`);
    }
  }, [session]);

  useEffect(() => {
    setCurrency(
      new Intl.NumberFormat(navigator.language, {
        style: "currency",
        currency: "PHP",
      })
    );
  }, []);

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
                <p className="text-xl font-bold">
                  {currency.format(dashboardStats?.confirmedRevenue ?? 0)}
                </p>
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
                <p className="text-xl font-bold">
                  +{dashboardStats?.leadsGenerated ?? 0}
                </p>
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
                <p className="text-xl font-bold">
                  {currency.format(dashboardStats?.potentialRevenue ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  +19% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Events Happening
                </CardTitle>
                <CalendarDays size="16" className="text-pink-400" />
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold">
                  {dashboardStats?.eventsHappening ?? 0}
                </p>
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
                <div className="flex items-start justify-between">
                  <CardTitle>Recent Leads</CardTitle>
                  <Link
                    href="/leads/create"
                    className="flex items-center justify-between rounded-md bg-slate-900 px-2 py-1 text-sm text-slate-50"
                  >
                    <Plus size="12" className="mr-2" />
                    New Lead
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <RecentLeads leads={leads ?? []} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
