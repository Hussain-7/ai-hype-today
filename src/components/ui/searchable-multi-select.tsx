import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";

interface SearchableMultiSelectProps<T extends string> {
  label: string;
  options: Array<{ value: T; label: string }>;
  selectedValues: T[];
  onValueChange: (value: T) => void;
  searchPlaceholder?: string;
}

export function SearchableMultiSelect<T extends string>({
  label,
  options,
  selectedValues,
  onValueChange,
  searchPlaceholder = "Search...",
}: SearchableMultiSelectProps<T>) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10"
        >
          <span>{label}</span>
          {selectedValues.length > 0 && (
            <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-semibold text-white">
              {selectedValues.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-0 bg-[#0A0A0A] border-white/10"
        align="start"
      >
        <Command className="bg-[#0A0A0A]">
          <CommandInput
            placeholder={searchPlaceholder}
            className="border-white/10 text-white placeholder-gray-500"
          />
          <CommandList className="bg-[#0A0A0A]">
            <CommandEmpty className="text-gray-400 text-sm py-6 text-center">
              No results found.
            </CommandEmpty>
            <CommandGroup className="bg-[#0A0A0A]">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => onValueChange(option.value)}
                  className="flex items-center gap-3 cursor-pointer text-gray-300 hover:bg-white/5 aria-selected:bg-white/10"
                >
                  <Checkbox
                    checked={selectedValues.includes(option.value)}
                    className="border-white/20 data-[state=checked]:bg-blue-500"
                  />
                  <span>{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
