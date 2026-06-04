import { useState, useEffect, useRef } from "react";
import { useAuth } from "./useAuth";

export default function useWatchlist() {
  const { user } = useAuth();
  const storageKey = user ? `bb_watchlist_${user.uid}` : null;
  const isFirstRender = useRef(true);

  const [watchlist, setWatchlist] = useState(() => {
    if (!storageKey) return [];
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch {
      return [];
    }
  });

  // Re-load watchlist when user changes, skip on first render
  // since useState initializer already handled it
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const loaded = (() => {
      if (!storageKey) return [];
      try {
        return JSON.parse(localStorage.getItem(storageKey)) || [];
      } catch {
        return [];
      }
    })();

    // Use a timeout to move setState out of the synchronous effect body
    const timer = setTimeout(() => setWatchlist(loaded), 0);
    return () => clearTimeout(timer);
  }, [storageKey]);

  const toggleWatchlist = (item) => {
    if (!user) return false;
    setWatchlist((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      const next = exists ? prev.filter((i) => i.id !== item.id) : [...prev, item];
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
    return true;
  };

  const isInWatchlist = (id) => watchlist.some((i) => i.id === id);

  return { watchlist, toggleWatchlist, isInWatchlist };
}