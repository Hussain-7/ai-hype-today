import { useCallback, useState } from "react";

export type SortDirection = "asc" | "desc" | null;

export interface SortState<T extends string> {
  field: T | null;
  direction: SortDirection;
}

export function useTableSort<T extends string>(defaultField?: T) {
  const [sortState, setSortState] = useState<SortState<T>>({
    field: defaultField || null,
    direction: defaultField ? "desc" : null,
  });

  const handleSort = useCallback((field: T) => {
    setSortState((prev) => {
      // If clicking the same field, cycle through: asc -> desc -> null
      if (prev.field === field) {
        if (prev.direction === "asc") {
          return { field, direction: "desc" };
        }
        if (prev.direction === "desc") {
          return { field: null, direction: null };
        }
        return { field, direction: "asc" };
      }
      // If clicking a new field, start with asc
      return { field, direction: "asc" };
    });
  }, []);

  const getSortIcon = useCallback(
    (field: T): "asc" | "desc" | "none" => {
      if (sortState.field !== field) return "none";
      if (sortState.direction === "asc") return "asc";
      if (sortState.direction === "desc") return "desc";
      return "none";
    },
    [sortState],
  );

  return {
    sortState,
    handleSort,
    getSortIcon,
  };
}
