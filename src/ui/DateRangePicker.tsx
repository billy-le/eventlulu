"use client";

import * as React from "react";
import { format as dateFormat, isSameDay } from "date-fns";
import { DateRange, SelectRangeEventHandler } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateChange: SelectRangeEventHandler;
  className?: string;
}

export function DateRangePicker({
  dateRange,
  onDateChange,
  className,
}: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.to && dateRange?.from ? (
              isSameDay(dateRange.to, dateRange.from) ? (
                dateFormat(dateRange.from, "LLL dd, y")
              ) : (
                <>
                  {dateFormat(dateRange.from, "LLL dd, y")} -{" "}
                  {dateFormat(dateRange.to, "LLL dd, y")}
                </>
              )
            ) : dateRange?.from ? (
              dateFormat(dateRange.from, "LLL dd, y")
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
