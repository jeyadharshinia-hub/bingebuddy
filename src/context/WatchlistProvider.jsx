import { useState, useEffect, useCallback } from "react";
import { WatchlistContext } from "./WatchlistContext";
import { useAuth } from "../hooks/useAuth";
import apiClient from "../services/apiClient";

export function WatchlistProvider({ children }) {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading,   setLoading]   = useState(false);

  const loadWatchlist = useCallback(() => {
    if (!user) {
      setWatchlist([]);
      return;
    }
    setLoading(true);
    apiClient
      .get("/watchlist")
      .then((res) => setWatchlist(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  // Defer the load so setState never fires synchronously inside the effect body
  useEffect(() => {
    const timer = setTimeout(loadWatchlist, 0);
    return () => clearTimeout(timer);
  }, [loadWatchlist]);

  const toggleWatchlist = async (item) => {
    if (!user) return false;

    try {
      const payload = {
        tmdbId:     item.id,
        mediaType:  item.media_type === "tv" ? "tv" : "movie",
        title:      item.title || item.name,
        posterPath: item.poster_path,
      };

      const res = await apiClient.post("/watchlist", payload);

      const isRemoved =
        res.data?.action === "removed" ||
        (typeof res.data === "string" && res.data.includes("removed"));

      if (isRemoved) {
        setWatchlist((prev) => prev.filter((i) => i.tmdbId !== item.id));
      } else {
        setWatchlist((prev) => [...prev, res.data]);
      }

      return true;
    } catch (err) {
      console.error("Watchlist toggle failed:", err);
      return false;
    }
  };

  const isInWatchlist = (id) =>
    watchlist.some((i) => i.tmdbId === id || i.id === id);

  return (
    <WatchlistContext.Provider
      value={{ watchlist, toggleWatchlist, isInWatchlist, loading }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}