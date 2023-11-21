import { useState, useRef, useEffect } from "react";

import { api } from "~/utils/api";
import { Loader } from "../Loader";
import { Pencil, Trash, Save, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Combobox } from "../Combobox";
import { Input } from "@/components/ui/input";
import { EventType } from "@prisma/client";

const parentEventTypes = [
  { id: "corporate", name: "Corporate" },
  { id: "social function", name: "Social Function" },
];

export function EventTypesForm() {
  const [editIds, setEditIds] = useState<string[]>([]);
  const [deleteEventTypeId, setDeleteEventTypeId] = useState<
    EventType["id"] | null
  >(null);
  const [selectedEventTypes, setSelectedEventTypes] = useState<
    Record<string, { id: string; name: string }>
  >({});
  const [isCreating, setIsCreating] = useState(false);
  const [addEventType, setAddEventType] = useState<
    { id: string; name: string } | undefined
  >(undefined);
  const createActivityRef = useRef<HTMLInputElement | null>(null);
  const refIds = useRef<Record<string, HTMLInputElement>>({});
  const {
    data: eventTypes,
    isLoading,
    isError,
    refetch,
  } = api.eventTypes.getEventTypes.useQuery();
  const createEventType = api.eventTypes.createEventType.useMutation();
  const updateEventType = api.eventTypes.updateEventType.useMutation();
  const deleteEventType = api.eventTypes.deleteEventType.useMutation();
  const { data: affectedCount } = api.leads.getAffectedCount.useQuery(
    {
      eventTypeId: deleteEventTypeId!,
    },
    { enabled: !!deleteEventTypeId }
  );

  useEffect(() => {
    if (eventTypes?.length) {
      const events = eventTypes.reduce((obj, eventType) => {
        obj[eventType.id] = {
          id: eventType.name === "corporate" ? "corporate" : "social function",
          name: eventType.name,
        };
        return obj;
      }, {} as typeof selectedEventTypes);
      setSelectedEventTypes(events);
    }
  }, [eventTypes]);

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

  function handleCreate() {
    const activity = createActivityRef.current?.value ?? "";
    if (activity && addEventType) {
      createEventType.mutate(
        {
          name: addEventType.id,
          activity,
        },
        {
          onSuccess: () => {
            setIsCreating(false);
            refetch();
          },
        }
      );
    }
  }

  function handleSave(eventType: EventType) {
    const activity = refIds.current[eventType.id]?.value;
    updateEventType.mutate(
      {
        id: eventType.id,
        name: selectedEventTypes[eventType.id]?.name,
        activity: activity ?? eventType.activity,
      },
      {
        onSuccess: () => {
          setEditIds(editIds.filter((id) => id !== eventType.id));
          refetch();
        },
      }
    );
  }

  function handleEdit(eventType: EventType) {
    setEditIds((edits) => {
      if (edits.includes(eventType.id)) {
        return edits.filter((id) => id !== eventType.id);
      }
      return edits.concat(eventType.id);
    });
    setTimeout(() => {
      refIds.current[eventType.id]?.focus();
    }, 0);
  }

  function handleDelete(eventType: EventType) {
    deleteEventType.mutate(
      {
        id: eventType.id,
      },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  }

  return (
    <div>
      <div className="max-w-xl rounded-md border border-gray-300 p-4">
        <ul className="divide-y divide-solid divide-gray-300">
          {eventTypes
            .sort((a, b) => a.activity.localeCompare(b.activity))
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((eventType) => {
              const isEditing = editIds.includes(eventType.id);
              return (
                <li
                  key={eventType.id}
                  className="flex items-center justify-between gap-4 py-2 first:pt-0"
                >
                  {isEditing ? (
                    <div className="flex w-full">
                      <Combobox
                        items={parentEventTypes}
                        selectedItem={selectedEventTypes[eventType.id]}
                        onChange={(item) => {
                          setSelectedEventTypes((obj) => {
                            const newObj = {
                              ...obj,
                              [eventType.id]: item,
                            };
                            return newObj;
                          });
                        }}
                        triggerClassName="w-full rounded-r-none"
                      />
                      <Input
                        ref={(el) => {
                          if (el) {
                            refIds.current[eventType.id] = el;
                          }
                        }}
                        defaultValue={eventType.activity}
                        onKeyUp={(e) => {
                          if (e.code === "Enter") {
                            handleSave(eventType);
                          }
                        }}
                        className="rounded-l-none border-l-0"
                      />
                    </div>
                  ) : (
                    <span className="capitalize">
                      <span className="text-gray-500">{eventType.name}</span>{" "}
                      <span className="text-blue-400">•</span>{" "}
                      {eventType.activity}
                    </span>
                  )}
                  <span className="flex gap-2">
                    {isEditing ? (
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          handleSave(eventType);
                        }}
                      >
                        <Save size="16" className="text-blue-500" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          handleEdit(eventType);
                        }}
                      >
                        <Pencil size="16" />
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger
                        onClick={() => {
                          setDeleteEventTypeId(eventType.id);
                        }}
                      >
                        <Trash size="16" className="text-red-400" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action will affect{" "}
                            <span className="text-xl text-red-500">
                              {affectedCount ?? 0}
                            </span>{" "}
                            leads. This action cannot be undone and may have
                            undesired effects.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500"
                            onClick={() => {
                              handleDelete(eventType);
                            }}
                          >
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </span>
                </li>
              );
            })}
          <li className="pt-2">
            {!isCreating ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsCreating(true);
                  setTimeout(() => {
                    createActivityRef.current?.focus();
                  }, 0);
                }}
              >
                <Plus size="16" className="mr-2 text-blue-400" />
                Add
              </Button>
            ) : (
              <div className="flex gap-4">
                <div className="flex w-full">
                  <Combobox
                    items={parentEventTypes}
                    selectedItem={addEventType}
                    onChange={(item) => {
                      setAddEventType(item);
                    }}
                    triggerClassName="w-full rounded-r-none"
                  />
                  <Input
                    ref={createActivityRef}
                    onKeyUp={(e) => {
                      if (e.code === "Enter") {
                        handleCreate();
                      }
                    }}
                    className="rounded-l-none border-l-0"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-blue-400"
                    onClick={handleCreate}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    className="bg-red-400"
                    onClick={() => {
                      setIsCreating(false);
                      setAddEventType(undefined);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
}
