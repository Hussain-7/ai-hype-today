import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MultiSelectDropdownProps<T extends string> {
  label: string;
  options: Array<{ value: T; label: string }>;
  selectedValues: T[];
  onValueChange: (value: T) => void;
  placeholder?: string;
}

export function MultiSelectDropdown<T extends string>({
  label,
  options,
  selectedValues,
  onValueChange,
}: MultiSelectDropdownProps<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
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
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-72 max-h-96 overflow-y-auto bg-[#0A0A0A] border-white/10"
      >
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selectedValues.includes(option.value)}
            onCheckedChange={() => onValueChange(option.value)}
            className="text-gray-300"
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
