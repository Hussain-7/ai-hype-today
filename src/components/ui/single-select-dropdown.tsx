import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ReactNode } from "react";

interface SingleSelectDropdownProps<T extends string> {
  triggerIcon?: ReactNode;
  triggerLabel: string;
  options: Array<{ value: T; label: string }>;
  selectedValue: T;
  onValueChange: (value: T) => void;
  children?: ReactNode;
}

export function SingleSelectDropdown<T extends string>({
  triggerIcon,
  triggerLabel,
  options,
  selectedValue,
  onValueChange,
  children,
}: SingleSelectDropdownProps<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10"
        >
          {triggerIcon}
          <span className="hidden sm:inline">{triggerLabel}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-64 bg-[#0A0A0A] border-white/10"
      >
        <DropdownMenuRadioGroup
          value={selectedValue}
          onValueChange={(value) => onValueChange(value as T)}
        >
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              className="text-gray-300"
            >
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
