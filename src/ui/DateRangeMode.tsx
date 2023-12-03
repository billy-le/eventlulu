"use client";

import { useState } from "react";

// components
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

// helpers
import { cn } from "@/lib/utils";
import {
  format as dateFormat,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subWeeks,
  subMonths,
  subQuarters,
  subYears,
  addWeeks,
  addMonths,
  addQuarters,
  addYears,
} from "date-fns";

// types
import type { DateRange } from "react-day-picker";
interface DateRangePickerProps {
  dateRange: DateRange;
  onDateChange: (data: {
    from: DateRange["from"];
    to: DateRange["to"];
    mode: Mode;
  }) => void;
  mode?: Mode;
  className?: string;
  disabled?: boolean;
  disableFuture?: boolean;
  disablePast?: boolean;
}

const MODES = ["weekly", "monthly", "quarterly", "yearly"] as const;
export type Mode = (typeof MODES)[number];
export const modeWordMap: Record<Mode, string> = {
  weekly: "week",
  monthly: "month",
  quarterly: "quarter",
  yearly: "year",
};

export function DateRangeMode({
  mode: modeProp,
  dateRange,
  onDateChange,
  className,
}: DateRangePickerProps) {
  const [mode, setMode] = useState<Mode>(modeProp || "weekly");

  function onModeChange(mode: Mode) {
    setMode(mode);
    switch (mode) {
      case "weekly": {
        const from = startOfWeek(dateRange.from ?? new Date());
        const to = endOfWeek(from);
        onDateChange({
          from,
          to,
          mode,
        });
        break;
      }
      case "monthly": {
        const from = startOfMonth(dateRange.from ?? new Date());
        const to = endOfMonth(from);
        onDateChange({
          from,
          to,
          mode,
        });
        break;
      }
      case "quarterly": {
        const from = startOfQuarter(dateRange.from ?? new Date());
        const to = endOfQuarter(from);
        onDateChange({
          from,
          to,
          mode,
        });
        break;
      }
      case "yearly": {
        const from = startOfYear(dateRange.from ?? new Date());
        const to = endOfYear(from);
        onDateChange({
          from,
          to,
          mode,
        });
        break;
      }
    }
  }

  function onPrevClick() {
    switch (mode) {
      case "weekly": {
        const from = startOfWeek(subWeeks(dateRange.from ?? new Date(), 1));
        const to = endOfWeek(from);
        onDateChange({
          from,
          to,
          mode,
        });
        break;
      }
      case "monthly": {
        const from = startOfMonth(subMonths(dateRange.from ?? new Date(), 1));
        const to = endOfMonth(from);
        onDateChange({
          from,
          to,
          mode,
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
          mode,
        });
        break;
      }
      case "yearly": {
        const from = startOfYear(subYears(dateRange.from ?? new Date(), 1));
        const to = endOfYear(from);
        onDateChange({
          from,
          to,
          mode,
        });
        break;
      }
    }
  }

  function onNextClick() {
    switch (mode) {
      case "weekly": {
        const from = startOfWeek(addWeeks(dateRange.from ?? new Date(), 1));
        const to = endOfWeek(from);
        onDateChange({
          from,
          to,
          mode,
        });
        break;
      }
      case "monthly": {
        const from = startOfMonth(addMonths(dateRange.from ?? new Date(), 1));
        const to = endOfMonth(from);
        onDateChange({
          from,
          to,
          mode,
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
          mode,
        });
        break;
      }
      case "yearly": {
        const from = startOfYear(addYears(dateRange.from ?? new Date(), 1));
        const to = endOfYear(from);
        onDateChange({
          from,
          to,
          mode,
        });
        break;
      }
    }
  }

  function renderDisplayDate(dateString: string) {
    return (
      <div className="grid">
        <span className="text-[10px] capitalize text-slate-400">
          {mode} <ChevronDown className="inline" size="12" />
        </span>
        <span className="text-sm">{dateString}</span>
      </div>
    );
  }

  function getDisplayDate() {
    switch (mode) {
      case "weekly": {
        const date = startOfWeek(dateRange.from ?? new Date());
        return renderDisplayDate(
          `${dateFormat(date, "MMM do")} - ${dateFormat(
            endOfWeek(date),
            "MMM do, yyyy"
          )}`
        );
      }
      case "monthly": {
        const date = startOfMonth(dateRange.from ?? new Date());

        return renderDisplayDate(dateFormat(date, "MMMM yyyy"));
      }
      case "quarterly": {
        const date = startOfQuarter(dateRange.from ?? new Date());

        return renderDisplayDate(dateFormat(date, "QQQ yyyy"));
      }
      case "yearly": {
        const date = startOfYear(dateRange.from ?? new Date());

        return renderDisplayDate(dateFormat(date, "yyyy"));
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
        <DropdownMenuTrigger className="px-1 capitalize">
          {getDisplayDate()}
        </DropdownMenuTrigger>
        <DropdownMenuContent className={mode === "weekly" ? "w-72" : "w-60"}>
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
