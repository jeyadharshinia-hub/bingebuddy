import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

export default function useSearchHistory() {
  const { user } = useAuth();
  const key = user ? `bb_history_${user.uid}` : "bb_history_guest";

  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
  });

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem(key)) || []); }
    catch { setHistory([]); }
  }, [key]);

  const addToHistory = (query) => {
    if (!query.trim()) return;
    setHistory((prev) => {
      const filtered = prev.filter((q) => q !== query);
      const next = [query, ...filtered].slice(0, 10);
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  };

  const clearHistory = () => {
    localStorage.removeItem(key);
    setHistory([]);
  };

  const removeItem = (query) => {
    setHistory((prev) => {
      const next = prev.filter((q) => q !== query);
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  };

  return { history, addToHistory, clearHistory, removeItem };
}
