"use client";

import { useState } from "react";
import {
  format as dateFormat,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  subQuarters,
  subYears,
  addDays,
  addWeeks,
  addMonths,
  addQuarters,
  addYears,
} from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

import { CalendarIcon, ArrowLeft, ArrowRight, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const MODES = ["daily", "weekly", "monthly", "quarterly", "yearly"] as const;
type Mode = (typeof MODES)[number];

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateChange: (date: DateRange) => void;
  className?: string;
  disabled?: boolean;
  disableFuture?: boolean;
  disablePast?: boolean;
}

export function DateRangeMode({
  dateRange,
  onDateChange,
  className,
}: DateRangePickerProps) {
  const [mode, setMode] = useState<Mode>("daily");

  function onModeChange(mode: Mode) {
    setMode(mode);
    switch (mode) {
      case "daily": {
        const from = startOfDay(dateRange.from ?? new Date());
        const to = endOfDay(from);
        onDateChange({
          from,
          to,
        });
        break;
      }
      case "weekly": {
        const from = startOfWeek(dateRange.from ?? new Date());
        const to = endOfWeek(from);
        onDateChange({
          from,
          to,
        });
        break;
      }
      case "monthly": {
        const from = startOfMonth(dateRange.from ?? new Date());
        const to = endOfMonth(from);
        onDateChange({
          from,
          to,
        });
        break;
      }
      case "quarterly": {
        const from = startOfQuarter(dateRange.from ?? new Date());
        const to = endOfQuarter(from);
        onDateChange({
          from,
          to,
        });
        break;
      }
      case "yearly": {
        const from = startOfYear(dateRange.from ?? new Date());
        const to = endOfYear(from);
        onDateChange({
          from,
          to,
        });
        break;
      }
    }
  }

  function onPrevClick() {
    switch (mode) {
      case "daily": {
        const from = startOfDay(subDays(dateRange.from ?? new Date(), 1));
        const to = endOfDay(from);
        onDateChange({
          from,
          to,
        });
        break;
      }
      case "weekly": {
        const from = startOfWeek(subWeeks(dateRange.from ?? new Date(), 1));
        const to = endOfWeek(from);
        onDateChange({
          from,
          to,
        });
        break;
      }
      case "monthly": {
        const from = startOfMonth(subMonths(dateRange.from ?? new Date(), 1));
        const to = endOfMonth(from);
        onDateChange({
          from,
          to,
        });
        break;
      }
      case "quarterly": {
        const from = startOfQuarter(
          subQuarters(dateRange.from ?? new Date(), 1)
        );
        const to = endOfQuarter(from);
        onDateChange({
          from,
          to,
        });
        break;
      }
      case "yearly": {
        const from = startOfYear(subYears(dateRange.from ?? new Date(), 1));
        const to = endOfYear(from);
        onDateChange({
          from,
          to,
        });
        break;
      }
    }
  }

  function onNextClick() {
    switch (mode) {
      case "daily": {
        const from = startOfDay(addDays(dateRange.from ?? new Date(), 1));
        const to = endOfDay(from);
        onDateChange({
          from,
          to,
        });
        break;
      }
      case "weekly": {
        const from = startOfWeek(addWeeks(dateRange.from ?? new Date(), 1));
        const to = endOfWeek(from);
        onDateChange({
          from,
          to,
        });
        break;
      }
      case "monthly": {
        const from = startOfMonth(addMonths(dateRange.from ?? new Date(), 1));
        const to = endOfMonth(from);
        onDateChange({
          from,
          to,
        });
        break;
      }
      case "quarterly": {
        const from = startOfQuarter(
          addQuarters(dateRange.from ?? new Date(), 1)
        );
        const to = endOfQuarter(from);
        onDateChange({
          from,
          to,
        });
        break;
      }
      case "yearly": {
        const from = startOfYear(addYears(dateRange.from ?? new Date(), 1));
        const to = endOfYear(from);
        onDateChange({
          from,
          to,
        });
        break;
      }
    }
  }

  function getDisplayDate() {
    switch (mode) {
      case "daily": {
        const date = startOfDay(dateRange.from ?? new Date());

        return (
          <div className="grid">
            <span className="text-[10px] text-slate-400">Daily</span>
            <span className="text-sm">{dateFormat(date, "MMM do yyyy")}</span>
          </div>
        );
      }
      case "weekly": {
        const date = startOfWeek(dateRange.from ?? new Date());

        return (
          <div className="grid">
            <span className="text-[10px] text-slate-400">Weekly</span>
            <span className="text-sm">
              {`${dateFormat(date, "MMM do")} - ${dateFormat(
                endOfWeek(date),
                "MMM do, yyyy"
              )}`}
            </span>
          </div>
        );
      }
      case "monthly": {
        const date = startOfMonth(dateRange.from ?? new Date());

        return (
          <div className="grid">
            <span className="text-[10px] text-slate-400">Monthly</span>
            <span className="text-sm">{dateFormat(date, "MMMM yyyy")}</span>
          </div>
        );
      }
      case "quarterly": {
        const date = startOfQuarter(dateRange.from ?? new Date());

        return (
          <div className="grid">
            <span className="text-[10px] text-slate-400">Quarterly</span>
            <span className="text-sm">{dateFormat(date, "QQQ yyyy")}</span>
          </div>
        );
      }
      case "yearly": {
        const date = startOfYear(dateRange.from ?? new Date());

        return (
          <div className="grid">
            <span className="text-[10px] text-slate-400">Yearly</span>
            <span className="text-sm">{dateFormat(date, "yyyy")}</span>
          </div>
        );
      }
      default:
        return null;
    }
  }

  return (
    <div
      className={cn(
        `flex justify-between gap-2 rounded-md ring-1 ring-slate-200 ${
          mode === "weekly" ? "w-72" : "w-60"
        }`,
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="rounded-none"
        onClick={onPrevClick}
      >
        <ArrowLeft />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger className="capitalize">
          {getDisplayDate()}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]">
          {MODES.map((m) => {
            return (
              <DropdownMenuItem
                key={m}
                onClick={() => {
                  onModeChange(m);
                }}
                className="capitalize"
              >
                <DropdownMenuLabel>{m}</DropdownMenuLabel>
                {mode === m && <Check size="20" className="text-purple-400" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-none"
        onClick={onNextClick}
      >
        <ArrowRight />
      </Button>
    </div>
  );
}
