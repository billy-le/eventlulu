"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

type Item = { id: string; name: string };

export function MultiSelectCombobox({
  placeholder,
  items,
  selectedItems,
  onChange,
  emptyDisplay,
  triggerClassName,
  contentClassName,
  itemClassName,
}: {
  placeholder: string;
  items: Item[];
  selectedItems: Item[];
  onChange: (items: Item[]) => void;
  emptyDisplay?: string;
  triggerClassName?: string;
  contentClassName?: string;
  itemClassName?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            `flex h-full w-full justify-between ${triggerClassName}`
          )}
        >
          <div className="flex flex-wrap gap-2">
            {selectedItems.map((item) => (
              <Badge key={item.id}>{item.name}</Badge>
            ))}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn(`w-full p-0 ${contentClassName}`)}>
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandEmpty>{emptyDisplay}</CommandEmpty>
          <CommandGroup>
            <ScrollArea className="h-32">
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={(value) => {
                    const hasItem = selectedItems.find(
                      (s) => s.name.toLowerCase() === value
                    );
                    if (hasItem) {
                      onChange(
                        selectedItems.filter(
                          (s) => s.name.toLowerCase() !== value
                        )
                      );
                    } else {
                      onChange(
                        selectedItems.concat(
                          items.find((i) => i.name.toLowerCase() === value)
                        )
                      );
                    }
                  }}
                  className={itemClassName}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedItems.some((i) => i.id === item.id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {item.name}
                </CommandItem>
              ))}
            </ScrollArea>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

MultiSelectCombobox.defaultProps = {
  placeholder: "Select an item",
  emptyDisplay: "No items found",
};

MultiSelectCombobox.defaultProps = {
  triggerClassName: "",
  contentClassName: "",
  itemClassName: "",
};
