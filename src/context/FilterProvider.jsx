import { useState } from "react";
import { FilterContext } from "./FilterContext";

const defaultFilters = {
  type: null,
  language: null,
  region: null,
  genre: null,
  topRated: false,
  ongoing: false,
};

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState(defaultFilters);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
    }));
  };

  const clearFilters = () => setFilters(defaultFilters);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <FilterContext.Provider
      value={{ filters, setFilters, updateFilter, toggleFilter, clearFilters, activeFilterCount }}
    >
      {children}
    </FilterContext.Provider>
  );
}