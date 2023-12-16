"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { formatDate } from "cleave-zen";

export function DatePicker({
  date,
  onChange,
  className,
  disabled,
}: {
  date: Date | undefined;
  onChange: (date: Date | undefined) => void;
  className?: string;
  disabled?: boolean;
}) {
  const [internalDate, setInternalDate] = useState<string>(
    date ? format(date, "MM/dd/yyyy") : ""
  );

  useEffect(() => {
    setInternalDate(date ? format(date, "MM/dd/yyyy") : "");
  }, [date]);
  return (
    <div
      className={cn(
        "flex w-full items-center text-left font-normal",
        !date && "text-muted-foreground",
        className
      )}
    >
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex">
            <div
              className="grid place-items-center rounded-bl rounded-tl bg-slate-800 p-2 text-slate-50"
              role="presentation"
              aria-label="Calendar Icon"
            >
              <CalendarIcon size="20" />
            </div>
            <Input
              className="rounded-l-none"
              placeholder="MM/DD/YYYY"
              onChange={(e) => {
                const value = formatDate(e.target.value, {
                  delimiter: "/",
                  datePattern: ["m", "d", "Y"],
                  delimiterLazyShow: false,
                });
                if (value.length === 10) {
                  const date = new Date(value);
                  onChange(date);
                }

                setInternalDate(e.target.value);
              }}
              value={internalDate}
              disabled={disabled}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={onChange}
            disabled={disabled}
            month={date}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

DatePicker.defaultProps = {
  className: "",
};
