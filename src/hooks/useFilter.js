import { useContext } from "react";
import { FilterContext } from "../context/FilterContext";

export const useFilters = () => useContext(FilterContext);