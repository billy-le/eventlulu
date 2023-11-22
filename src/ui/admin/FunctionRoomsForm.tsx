import { useState, useRef } from "react";

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
import { Input } from "@/components/ui/input";
import { FunctionRoom } from "@prisma/client";

export function FunctionRoomsForm() {
  const [editIds, setEditIds] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<FunctionRoom["id"] | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const createRef = useRef<HTMLInputElement | null>(null);
  const refIds = useRef<Record<string, HTMLInputElement>>({});
  const {
    data: functionRooms,
    isLoading,
    isError,
    refetch,
  } = api.functionRooms.getFunctionRooms.useQuery();
  const createFunctionRoom = api.functionRooms.createFunctionRoom.useMutation();
  const updateFunctionRoom = api.functionRooms.updateFunctionRoom.useMutation();
  const deleteFunctionRoom = api.functionRooms.deleteFunctionRoom.useMutation();
  const { data: affectedCount } = api.leads.getAffectedCount.useQuery(
    {
      functionRoomId: deleteId!,
    },
    { enabled: !!deleteId }
  );

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
    const name = createRef.current?.value ?? "";
    if (name) {
      createFunctionRoom.mutate(
        {
          name,
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

  function handleSave(functionRoom: FunctionRoom) {
    const name = refIds.current[functionRoom.id]?.value ?? "";
    updateFunctionRoom.mutate(
      {
        id: functionRoom.id,
        name,
      },
      {
        onSuccess: () => {
          setEditIds(editIds.filter((id) => id !== functionRoom.id));
          refetch();
        },
      }
    );
  }

  function handleEdit(functionRoom: FunctionRoom) {
    setEditIds((edits) => {
      if (edits.includes(functionRoom.id)) {
        return edits.filter((id) => id !== functionRoom.id);
      }
      return edits.concat(functionRoom.id);
    });
    setTimeout(() => {
      refIds.current[functionRoom.id]?.focus();
    }, 0);
  }

  function handleDelete(functionRoom: FunctionRoom) {
    deleteFunctionRoom.mutate(
      {
        id: functionRoom.id,
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
          {functionRooms
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((functionRoom) => {
              const isEditing = editIds.includes(functionRoom.id);
              return (
                <li
                  key={functionRoom.id}
                  className="flex items-center justify-between gap-4 py-2 first:pt-0"
                >
                  {isEditing ? (
                    <Input
                      ref={(el) => {
                        if (el) {
                          refIds.current[functionRoom.id] = el;
                        }
                      }}
                      defaultValue={functionRoom.name}
                      onKeyUp={(e) => {
                        if (e.code === "Enter") {
                          handleSave(functionRoom);
                        }
                        if (e.code === "Escape") {
                          setEditIds((ids) => {
                            return ids.filter((id) => id !== functionRoom.id);
                          });
                        }
                      }}
                      className="rounded-l-none border-l-0"
                    />
                  ) : (
                    <span className="capitalize">{functionRoom.name}</span>
                  )}
                  <span className="flex gap-2">
                    {isEditing ? (
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          handleSave(functionRoom);
                        }}
                      >
                        <Save size="16" className="text-blue-500" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          handleEdit(functionRoom);
                        }}
                      >
                        <Pencil size="16" />
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger
                        onClick={() => {
                          setDeleteId(functionRoom.id);
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
                              handleDelete(functionRoom);
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
                    createRef.current?.focus();
                  }, 0);
                }}
              >
                <Plus size="16" className="mr-2 text-blue-400" />
                Add
              </Button>
            ) : (
              <div className="flex gap-4">
                <Input
                  ref={createRef}
                  onKeyUp={(e) => {
                    if (e.code === "Enter") {
                      handleCreate();
                    }
                    if (e.code === "Escape") {
                      setIsCreating(false);
                    }
                  }}
                  className="rounded-l-none border-l-0"
                />

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
