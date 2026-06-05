import { useState } from "react";
import { ActivityContext } from "./ActivityContext";

export function ActivityProvider({ children }) {
  const [activities, setActivities] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("bb_activities")
      ) || [];
    } catch {
      return [];
    }
  });

  const addActivity = (activity) => {
    setActivities((prev) => {
      const updated = [
        {
          ...activity,
          id: Date.now(),
          createdAt: Date.now(),
        },
        ...prev,
      ];

      localStorage.setItem(
        "bb_activities",
        JSON.stringify(updated)
      );

      return updated;
    });
  };

  return (
    <ActivityContext.Provider
      value={{
        activities,
        addActivity,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
}