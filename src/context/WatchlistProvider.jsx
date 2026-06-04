import { useState } from "react";
import { WatchlistContext } from "./WatchlistContext";
import { useAuth } from "../hooks/useAuth";

export function WatchlistProvider({ children }) {
  const { user } = useAuth();

  const [watchlist, setWatchlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("watchlist")) || [];
    } catch {
      return [];
    }
  });

  const toggleWatchlist = (item) => {
    if (!user) return false;

    const exists = watchlist.find((i) => i.id === item.id);
    const updated = exists
      ? watchlist.filter((i) => i.id !== item.id)
      : [...watchlist, item];

    setWatchlist(updated);
    localStorage.setItem("watchlist", JSON.stringify(updated));
    return true;
  };

  const isInWatchlist = (id) => watchlist.some((i) => i.id === id);

  return (
    <WatchlistContext.Provider value={{ watchlist, toggleWatchlist, isInWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  );
}