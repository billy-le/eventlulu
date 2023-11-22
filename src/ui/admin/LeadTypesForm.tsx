import { useState, useRef, Ref, MutableRefObject, useEffect } from "react";

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
import { LeadType } from "@prisma/client";

export function LeadTypesForm() {
  const [editIds, setEditIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteLeadTypeId, setDeleteLeadTypeId] = useState<
    LeadType["id"] | null
  >(null);
  const createRef = useRef<HTMLInputElement | null>(null);
  const refIds = useRef<Record<string, HTMLInputElement>>({});
  const {
    data: leadTypes,
    isLoading,
    isError,
    refetch,
  } = api.leadTypes.getLeadTypes.useQuery();
  const createLeadType = api.leadTypes.createLeadType.useMutation();
  const updateLeadType = api.leadTypes.updateLeadType.useMutation();
  const deleteLeadType = api.leadTypes.deleteLeadType.useMutation();
  const { data: affectedCount } = api.leads.getAffectedCount.useQuery(
    {
      leadTypeId: deleteLeadTypeId!,
    },
    { enabled: !!deleteLeadTypeId }
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
    const value = createRef.current?.value ?? "";
    if (value) {
      createLeadType.mutate(
        {
          name: value,
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

  function handleSave(leadType: LeadType) {
    const value = refIds.current[leadType.id]?.value;
    updateLeadType.mutate(
      {
        id: leadType.id,
        name: value ?? leadType.name,
      },
      {
        onSuccess: () => {
          setEditIds(editIds.filter((id) => id !== leadType.id));
          refetch();
        },
      }
    );
  }

  function handleEdit(leadType: LeadType) {
    setEditIds((edits) => {
      if (edits.includes(leadType.id)) {
        return edits.filter((id) => id !== leadType.id);
      }
      return edits.concat(leadType.id);
    });
    setTimeout(() => {
      refIds.current[leadType.id]?.focus();
    }, 0);
  }

  function handleDelete(leadType: LeadType) {
    deleteLeadType.mutate(
      {
        id: leadType.id,
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
          {leadTypes.map((leadType) => {
            const isEditing = editIds.includes(leadType.id);
            return (
              <li
                key={leadType.id}
                className="flex items-center justify-between gap-4 py-2 first:pt-0"
              >
                {isEditing ? (
                  <Input
                    ref={(el) => {
                      if (el) {
                        refIds.current[leadType.id] = el;
                      }
                    }}
                    defaultValue={leadType.name}
                    onKeyUp={(e) => {
                      if (e.code === "Enter") {
                        handleSave(leadType);
                      }
                      if (e.code === "Escape") {
                        setEditIds((ids) => {
                          return ids.filter((id) => id !== leadType.id);
                        });
                      }
                    }}
                  />
                ) : (
                  <span className="capitalize">{leadType.name}</span>
                )}
                <span className="flex gap-2">
                  {isEditing ? (
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        handleSave(leadType);
                      }}
                    >
                      <Save size="16" className="text-blue-500" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        handleEdit(leadType);
                      }}
                    >
                      <Pencil size="16" />
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger
                      onClick={() => {
                        setDeleteLeadTypeId(leadType.id);
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
                            handleDelete(leadType);
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
