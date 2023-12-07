import { Calendar } from "@/components/ui/calendar";

export function Overview() {
  return (
    <>
      <Calendar
        defaultMonth={new Date()}
        classNames={{
          head_row:
            "border-b border-slate-300 divide-x divide-x-slate-300 w-full flex",
          head_cell: "w-full",
          caption_start: "w-full",
          cell: "w-full",
          day: "relative w-full text-left h-20",
          tbody: "divide-y divide-y-slate-300",
          table: "ring-1 ring-slate-300 w-full",
          row: "w-full flex divide-x divide-x-slate-300",
        }}
        className="p-0"
      />
    </>
  );
}
