"use client";

import { api } from "~/utils/api";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

// components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  CalendarDays,
  TrendingUp,
  Plus,
  ChevronDown,
} from "lucide-react";
import { DefaultLayout } from "~/layouts/default";
import { CycleNumbers } from "~/ui/CycleNumbers";
import { RecentLeads } from "~/ui/RecentLeads";
import { DateRangeMode, modeWordMap } from "~/ui/DateRangeMode";
import { Overview } from "~/ui/Overview";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";

// helpers
import { startOfMonth, endOfMonth } from "date-fns";
import { millify } from "millify";

// types
import type { DateRange } from "react-day-picker";
import type { Metadata } from "next";
import type { Mode } from "~/ui/DateRangeMode";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Example dashboard app built using the components.",
};

const overviewItems = ["calendar", "trends", "stats"] as const;

function getGrowthDisplay(growth: number | null) {
  if (growth === null) {
    return {
      isPositive: null,
      growth: "no change",
    };
  }
  const isPositive = growth > 0;
  return {
    isPositive,
    growth: growth === 0 ? "0%" : isPositive ? `+${growth}%` : `${growth}%`,
  };
}

export default function DashboardPage() {
  const date = startOfMonth(new Date());
  const [dateRange, setDateRange] = useState<{
    from: DateRange["from"];
    to: DateRange["to"];
    mode: Mode;
  }>({
    from: date,
    to: endOfMonth(date),
    mode: "monthly",
  });
  const [greeting, setGreeting] = useState("");
  const [overview, setOverview] =
    useState<(typeof overviewItems)[number]>("calendar");
  const { data: session } = useSession();

  const {
    data: dashboardStats = {
      confirmedRevenue: 0,
      eventsHappening: 0,
      leadGenerationGrowth: 0,
      leadsGenerated: 0,
      potentialGrowth: 0,
      potentialRevenue: 0,
      revenueGrowth: 0,
      eventsGrowth: 0,
    },
    isLoading,
    isError,
  } = api.dashboard.getDashboardStats.useQuery({
    from: dateRange.from!,
    to: dateRange.to!,
    mode: dateRange.mode,
  });
  const { data: leads } = api.leads.getLeads.useQuery({
    take: 8,
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

  const confirmedRevenueGrowth = getGrowthDisplay(dashboardStats.revenueGrowth);
  const leadGenerationGrowth = getGrowthDisplay(
    dashboardStats.leadGenerationGrowth
  );
  const potentialRevenueGrowth = getGrowthDisplay(
    dashboardStats.potentialGrowth
  );
  const eventsGrowth = getGrowthDisplay(dashboardStats.eventsGrowth);

  return (
    <DefaultLayout>
      <div className="flex-col md:flex">
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">{greeting}</h2>
            <DateRangeMode
              mode={dateRange.mode}
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
                <span className="text-green-500">₱</span>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold">
                  {millify(dashboardStats?.confirmedRevenue ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {!isLoading ? (
                    <>
                      {confirmedRevenueGrowth.isPositive == null
                        ? ""
                        : confirmedRevenueGrowth.isPositive
                        ? "up"
                        : "down"}{" "}
                      <span
                        className={
                          confirmedRevenueGrowth.isPositive == null
                            ? ""
                            : confirmedRevenueGrowth.isPositive
                            ? "text-green-500"
                            : "text-red-400"
                        }
                      >
                        {confirmedRevenueGrowth.growth}
                      </span>{" "}
                      since last {modeWordMap[dateRange.mode]}
                    </>
                  ) : (
                    "-"
                  )}
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
                  {!isLoading ? (
                    <>
                      {" "}
                      {leadGenerationGrowth.isPositive === null
                        ? ""
                        : leadGenerationGrowth.isPositive
                        ? "up"
                        : "down"}{" "}
                      <span
                        className={
                          leadGenerationGrowth.isPositive === null
                            ? ""
                            : leadGenerationGrowth.isPositive
                            ? "text-green-500"
                            : "text-red-400"
                        }
                      >
                        {leadGenerationGrowth.growth}
                      </span>{" "}
                      since last {modeWordMap[dateRange.mode]}
                    </>
                  ) : (
                    "-"
                  )}
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
                  {millify(dashboardStats?.potentialRevenue ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {!isLoading ? (
                    <>
                      {potentialRevenueGrowth.isPositive === null
                        ? ""
                        : potentialRevenueGrowth.isPositive
                        ? "up"
                        : "down"}{" "}
                      <span
                        className={
                          potentialRevenueGrowth.isPositive === null
                            ? ""
                            : potentialRevenueGrowth.isPositive
                            ? "text-green-500"
                            : "text-red-400"
                        }
                      >
                        {potentialRevenueGrowth.growth}
                      </span>{" "}
                      since last {modeWordMap[dateRange.mode]}
                    </>
                  ) : (
                    "-"
                  )}
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
                  {!isLoading ? (
                    <>
                      {eventsGrowth.isPositive === null
                        ? ""
                        : eventsGrowth.isPositive
                        ? "up"
                        : "down"}{" "}
                      <span
                        className={
                          eventsGrowth.isPositive === null
                            ? ""
                            : eventsGrowth.isPositive
                            ? "text-green-500"
                            : "text-red-400"
                        }
                      >
                        {eventsGrowth.growth}
                      </span>{" "}
                      since last {modeWordMap[dateRange.mode]}
                    </>
                  ) : (
                    "-"
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Overview</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1 capitalize ring-1 ring-slate-200">
                      {overview}
                      <ChevronDown size="20" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {overviewItems.map((item) => (
                        <DropdownMenuItem
                          className="capitalize"
                          onClick={() => {
                            if (item !== overview) {
                              setOverview(item);
                            }
                          }}
                        >
                          {item}
                          {item === overview && (
                            <Check className="ml-2 text-purple-400" size="20" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {overview === "calendar" && <Overview />}
              </CardContent>
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
