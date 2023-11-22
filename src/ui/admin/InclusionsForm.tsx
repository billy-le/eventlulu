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
import { Inclusion } from "@prisma/client";

export function InclusionsForm() {
  const [editIds, setEditIds] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<Inclusion["id"] | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const createRef = useRef<HTMLInputElement | null>(null);
  const refIds = useRef<Record<string, HTMLInputElement>>({});
  const {
    data: inclusions,
    isLoading,
    isError,
    refetch,
  } = api.inclusions.getInclusions.useQuery();
  const createInclusions = api.inclusions.createInclusions.useMutation();
  const updateInclusions = api.inclusions.updateInclusions.useMutation();
  const deleteInclusions = api.inclusions.deleteInclusions.useMutation();
  const { data: affectedCount } = api.leads.getAffectedCount.useQuery(
    {
      inclusionId: deleteId!,
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
      createInclusions.mutate([name], {
        onSuccess: () => {
          setIsCreating(false);
          refetch();
        },
      });
    }
  }

  function handleSave(inclusion: Inclusion) {
    const name = refIds.current[inclusion.id]?.value ?? "";
    updateInclusions.mutate([{ id: inclusion.id, name }], {
      onSuccess: () => {
        setEditIds(editIds.filter((id) => id !== inclusion.id));
        refetch();
      },
    });
  }

  function handleEdit(inclusion: Inclusion) {
    setEditIds((edits) => {
      if (edits.includes(inclusion.id)) {
        return edits.filter((id) => id !== inclusion.id);
      }
      return edits.concat(inclusion.id);
    });
    setTimeout(() => {
      refIds.current[inclusion.id]?.focus();
    }, 0);
  }

  function handleDelete(inclusion: Inclusion) {
    deleteInclusions.mutate([inclusion.id], {
      onSuccess: () => {
        refetch();
      },
    });
  }

  return (
    <div>
      <div className="max-w-xl rounded-md border border-gray-300 p-4">
        <ul className="divide-y divide-solid divide-gray-300">
          {inclusions
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((inclusion) => {
              const isEditing = editIds.includes(inclusion.id);
              return (
                <li
                  key={inclusion.id}
                  className="flex items-center justify-between gap-4 py-2 first:pt-0"
                >
                  {isEditing ? (
                    <Input
                      ref={(el) => {
                        if (el) {
                          refIds.current[inclusion.id] = el;
                        }
                      }}
                      defaultValue={inclusion.name}
                      onKeyUp={(e) => {
                        if (e.code === "Enter") {
                          handleSave(inclusion);
                        }
                        if (e.code === "Escape") {
                          setEditIds((ids) => {
                            return ids.filter((id) => id !== inclusion.id);
                          });
                        }
                      }}
                      className="rounded-l-none border-l-0"
                    />
                  ) : (
                    <span className="capitalize">{inclusion.name}</span>
                  )}
                  <span className="flex gap-2">
                    {isEditing ? (
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          handleSave(inclusion);
                        }}
                      >
                        <Save size="16" className="text-blue-500" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          handleEdit(inclusion);
                        }}
                      >
                        <Pencil size="16" />
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger
                        onClick={() => {
                          setDeleteId(inclusion.id);
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
                              handleDelete(inclusion);
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
