import { useContext } from "react";
import { ActivityContext } from "../context/ActivityContext";

export const useActivity = () =>
  useContext(ActivityContext);