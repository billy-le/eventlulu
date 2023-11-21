import { api } from "~/utils/api";

import { Loader } from "../Loader";
import { Pencil, Trash } from "lucide-react";

export function EventTypesForm() {
  const {
    data: eventTypes,
    isLoading,
    isError,
  } = api.eventTypes.getEventTypes.useQuery();

  if (isError) {
    return <div>Something went wrong</div>;
  }

  if (isLoading) {
    return (
      <div className="py-10">
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-md rounded-md border border-gray-300 p-4">
        <ul className="space-y-2 divide-y divide-solid divide-gray-300">
          {eventTypes.map((eventType) => (
            <li
              key={eventType.id}
              className="flex items-center justify-between"
            >
              <span className="capitalize">
                {eventType.name}, {eventType.activity}
              </span>
              {/* <span className="flex gap-2">
                <Pencil size="16" />
                <Trash size="16" />
              </span> */}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
