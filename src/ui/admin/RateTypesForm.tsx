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
import { RateType } from "@prisma/client";

export function RateTypesForm() {
  const [editIds, setEditIds] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<RateType["id"] | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const createRef = useRef<HTMLInputElement | null>(null);
  const refIds = useRef<Record<string, HTMLInputElement>>({});
  const {
    data: rateTypes,
    isLoading,
    isError,
    refetch,
  } = api.rateTypes.getRateTypes.useQuery();
  const createRateType = api.rateTypes.createRateType.useMutation();
  const updateRateType = api.rateTypes.updateRateType.useMutation();
  const deleteRateType = api.rateTypes.deleteRateType.useMutation();
  const { data: affectedCount } = api.leads.getAffectedCount.useQuery(
    {
      rateTypeId: deleteId!,
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
      createRateType.mutate(
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

  function handleSave(rateType: RateType) {
    const name = refIds.current[rateType.id]?.value ?? "";
    updateRateType.mutate(
      {
        id: rateType.id,
        name,
      },
      {
        onSuccess: () => {
          setEditIds(editIds.filter((id) => id !== rateType.id));
          refetch();
        },
      }
    );
  }

  function handleEdit(rateType: RateType) {
    setEditIds((edits) => {
      if (edits.includes(rateType.id)) {
        return edits.filter((id) => id !== rateType.id);
      }
      return edits.concat(rateType.id);
    });
    setTimeout(() => {
      refIds.current[rateType.id]?.focus();
    }, 0);
  }

  function handleDelete(rateType: RateType) {
    deleteRateType.mutate(
      {
        id: rateType.id,
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
          {rateTypes
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((rateType) => {
              const isEditing = editIds.includes(rateType.id);
              return (
                <li
                  key={rateType.id}
                  className="flex items-center justify-between gap-4 py-2 first:pt-0"
                >
                  {isEditing ? (
                    <Input
                      ref={(el) => {
                        if (el) {
                          refIds.current[rateType.id] = el;
                        }
                      }}
                      defaultValue={rateType.name}
                      onKeyUp={(e) => {
                        if (e.code === "Enter") {
                          handleSave(rateType);
                        }
                        if (e.code === "Escape") {
                          setEditIds((ids) => {
                            return ids.filter((id) => id !== rateType.id);
                          });
                        }
                      }}
                    />
                  ) : (
                    <span className="capitalize">{rateType.name}</span>
                  )}
                  <span className="flex gap-2">
                    {isEditing ? (
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          handleSave(rateType);
                        }}
                      >
                        <Save size="16" className="text-blue-500" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          handleEdit(rateType);
                        }}
                      >
                        <Pencil size="16" />
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger
                        onClick={() => {
                          setDeleteId(rateType.id);
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
                              handleDelete(rateType);
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
