import { useContext } from "react";
import { WatchlistContext } from "../context/WatchlistContext";

export const useWatchlist = () => useContext(WatchlistContext);