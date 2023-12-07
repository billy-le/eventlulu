import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  getDaysInMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  format as dateFormat,
} from "date-fns";

const CALENDAR_DAYS = 42;

export function Overview() {
  const today = new Date();
  const daysOfWeek = new Array(7)
    .fill(null)
    .map((_, d) =>
      new Date(2001, 0, d).toLocaleString("en", { weekday: "short" })
    );

  const calStart = startOfMonth(today);
  const calEnd = endOfMonth(today);

  return null;

  return (
    <>
      <div className="divide grid grid-cols-7 divide-slate-300">
        {daysOfWeek.map((day) => (
          <div key={day} className="grid w-20 place-items-center ">
            {day}
          </div>
        ))}
      </div>
      <div className="divide grid grid-cols-7 divide-slate-300"></div>
    </>
  );
}
