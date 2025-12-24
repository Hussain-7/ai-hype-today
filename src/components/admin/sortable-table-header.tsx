import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

interface SortableTableHeaderProps<T extends string> {
  field: T;
  label: string;
  currentField: T | null;
  direction: "asc" | "desc" | null;
  onSort: (field: T) => void;
  className?: string;
}

export function SortableTableHeader<T extends string>({
  field,
  label,
  currentField,
  direction,
  onSort,
  className = "",
}: SortableTableHeaderProps<T>) {
  const isActive = currentField === field;

  return (
    <th className={`px-4 py-3 ${className}`}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className="flex items-center gap-2 font-medium text-gray-400 transition-colors hover:text-white"
      >
        <span>{label}</span>
        {isActive && direction === "asc" && (
          <ArrowUp className="h-4 w-4 text-blue-400" />
        )}
        {isActive && direction === "desc" && (
          <ArrowDown className="h-4 w-4 text-blue-400" />
        )}
        {!isActive && <ArrowUpDown className="h-4 w-4 opacity-30" />}
      </button>
    </th>
  );
}
