"use client";

import { cn } from "@/lib/utils";
import * as datefns from "date-fns";

const sizeMap = {
  sm: "",
  md: "h-16 w-16",
  lg: "",
};

export function CalendarDate({
  date,
  size,
  className,
}: {
  date: Date;
  size: keyof typeof sizeMap;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col border", sizeMap[size], className)}>
      <div className="bg-black text-center text-white">
        {datefns.format(date, "E")}
      </div>
      <div className="flex flex-grow items-center justify-center ">
        {datefns.format(date, "d")}
      </div>
    </div>
  );
}

CalendarDate.defaultProps = {
  className: "",
};
