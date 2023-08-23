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

export function Combobox({
  placeholder,
  items,
  selectedItem,
  onChange,
  emptyDisplay,
}: {
  placeholder: string;
  items: { id: string; name: string }[];
  selectedItem?: { id: string; name: string };
  onChange: (item: { id: string; name: string }) => void;
  emptyDisplay?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="flex w-[200px] justify-between"
        >
          {selectedItem?.name || placeholder}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandEmpty>{emptyDisplay}</CommandEmpty>
          <CommandGroup>
            {items.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={(value) => {
                  const selectedItem = items.find(
                    (item) => item.name === value
                  )!;
                  onChange(selectedItem);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedItem?.id === item.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {item.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

Combobox.defaultProps = {
  placeholder: "Select an item",
  emptyDisplay: "No items found",
};
