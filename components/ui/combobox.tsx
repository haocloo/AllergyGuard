import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";

export interface ComboboxOption {
  label: string;
  value: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string | string[]; // Modified to support array for multiple selections
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  multiple?: boolean; // New prop to support multiple selections
  onSelect?: (value: string) => void;
  isError?: boolean;
  "data-error-field"?: string;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  disabled = false,
  className,
  multiple = false,
  onSelect,
  isError = false,
  "data-error-field": dataErrorField,
}: ComboboxProps) {
  // Add state to control the popover
  const [open, setOpen] = React.useState(false);

  // Enhanced display value logic
  const displayValue = React.useMemo(() => {
    if (!value) return placeholder;

    if (Array.isArray(value)) {
      if (value.length === 0) return placeholder;

      // If multiple items are selected, show count
      if (value.length > 1) {
        return `${value.length} selected`;
      }

      // If only one item is selected, show truncated text
      const selectedLabel = options.find((opt) => opt.value === value[0])?.label;
      return selectedLabel || placeholder;
    }

    // Single selection mode - show truncated text
    return options.find((opt) => opt.value === value)?.label || placeholder;
  }, [value, options, placeholder]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className={isError ? "border-red-500" : ""}>
        <Button
          variant="outline"
          role="combobox"
          data-error-field={dataErrorField}
          className={cn("w-full justify-between", className)}
          disabled={disabled}>
          <span className="truncate flex-1 text-left">{displayValue}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 flex-none" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(selectedValue) => {
                    onValueChange(selectedValue);
                    onSelect?.(selectedValue);
                    if (!multiple) {
                      setOpen(false);
                    }
                  }}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      Array.isArray(value)
                        ? value.includes(option.value)
                          ? "opacity-100"
                          : "opacity-0"
                        : value === option.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {/* Truncate long text in dropdown items too */}
                  <span className="truncate flex-1">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
