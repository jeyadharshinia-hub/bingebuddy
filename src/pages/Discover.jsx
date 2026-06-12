import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useNavigationType } from "react-router-dom";
import { discoverMovies, getGenres, getRegions } from "../services/api";
import MovieCard from "../components/MovieCard";
import { useWatchlist } from "../hooks/useWatchlist";
import isEqual from "lodash/isEqual";

const POPULAR_REGION_CODES = ["US", "IN", "KR", "JP", "CN", "TH", "PH", "GB", "FR"];

const REGION_LABELS = {
  US: "USA", IN: "India", KR: "Korea", JP: "Japan",
  CN: "China", TH: "Thailand", PH: "Philippines", GB: "UK", FR: "France",
};

const DEFAULT_FILTERS = {
  type: "movie",
  genre: "",
  region: "",
  topRated: false,
  ongoing: false,
};

const AWAY_ROUTES = ["/", "/watchlist", "/profile"];

function getHistorySavedState() {
  try {
    return window.history.state?.bb_discover_state ?? null;
  } catch {
    return null;
  }
}

function deleteHistorySavedState() {
  try {
    const s = window.history.state;
    if (!s?.bb_discover_state) return;
    const next = { ...s };
    delete next.bb_discover_state;
    window.history.replaceState(next, "");
  } catch { /* ignore */ }
}

export default function DiscoverPage({ onNeedLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();

  const savedFromHistory = getHistorySavedState();
  const shouldRestore = navigationType === "POP" && savedFromHistory !== null;

  const [movies, setMovies] = useState(shouldRestore ? savedFromHistory.movies || [] : []);
  const [genres, setGenres] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(!shouldRestore);
  const [page, setPage] = useState(shouldRestore ? savedFromHistory.page || 1 : 1);
  const [totalPages, setTotalPages] = useState(1);

  // Keep refs in sync so the IntersectionObserver always reads fresh values
  // without needing to be re-created on every state change.
  useEffect(() => { loadingRef.current = loading; }, [loading]);
  useEffect(() => { pageRef.current = page; }, [page]);
  useEffect(() => { totalPagesRef.current = totalPages; }, [totalPages]);
  const [filters, setFilters] = useState(
    shouldRestore ? savedFromHistory.filters || DEFAULT_FILTERS : DEFAULT_FILTERS
  );

  const prevFiltersRef = useRef(filters);
  const skipFetchRef = useRef(!!shouldRestore);
  const scrollRestoredRef = useRef(false);
  const sentinelRef = useRef(null);
  const prevPathnameRef = useRef(location.pathname);
  const loadingRef = useRef(!shouldRestore);
  const pageRef = useRef(shouldRestore ? savedFromHistory.page || 1 : 1);
  const totalPagesRef = useRef(1);

  // Wipe saved state when navigating away from Discover to Home/Watchlist/Profile
  useEffect(() => {
    const prev = prevPathnameRef.current;
    const curr = location.pathname;
    prevPathnameRef.current = curr;

    const leavingDiscover = prev === "/discover" || prev.startsWith("/discover");
    const goingToAwayRoute = AWAY_ROUTES.some(
      (r) => curr === r || curr.startsWith(r + "/")
    );

    if (leavingDiscover && goingToAwayRoute) {
      deleteHistorySavedState();
    }
  }, [location.pathname]);

  // Restore scroll position after coming back from detail page
  useEffect(() => {
    if (
      shouldRestore &&
      savedFromHistory?.scrollY &&
      !scrollRestoredRef.current &&
      movies.length > 0
    ) {
      scrollRestoredRef.current = true;
      setTimeout(() => window.scrollTo({ top: savedFromHistory.scrollY, behavior: "auto" }), 50);
    }
  }, [movies, shouldRestore, savedFromHistory]);

  // Load popular regions
  useEffect(() => {
    let active = true;
    getRegions()
      .then((data) => {
        if (!active) return;
        const popular = Array.isArray(data)
          ? data.filter((r) => POPULAR_REGION_CODES.includes(r.code))
          : [];
        setRegions(popular);
      })
      .catch((err) => console.error("getRegions error", err));
    return () => { active = false; };
  }, []);

  // Load genres for selected type
  useEffect(() => {
    let active = true;
    getGenres(filters.type)
      .then((g) => { if (!active) return; setGenres(Array.isArray(g) ? g : []); })
      .catch((err) => console.error("getGenres error", err));
    return () => { active = false; };
  }, [filters.type]);

  // Fetch movies when filters or page change
  useEffect(() => {
    if (skipFetchRef.current) {
      skipFetchRef.current = false;
      return;
    }

    let active = true;
    const filtersChanged = !isEqual(prevFiltersRef.current, filters);
    prevFiltersRef.current = filters;
    const currentPage = filtersChanged ? 1 : page;

    setLoading(true);

    discoverMovies({ ...filters, page: currentPage })
      .then((data) => {
        if (!active) return;
        setTotalPages(data?.total_pages ?? 1);
        const results = Array.isArray(data?.results) ? data.results : [];

        const filtered = filters.genre
          ? results.filter((m) => m.genre_ids?.includes(Number(filters.genre)))
          : results;

        const sorted = filters.topRated
          ? [...filtered].sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0))
          : filtered;

        setMovies((prev) => {
          const combined = currentPage === 1 ? sorted : [...prev, ...sorted];
          return filters.topRated
            ? [...combined].sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0))
            : combined;
        });

        if (filtersChanged && page !== 1) setPage(1);
      })
      .catch((err) => { if (active) console.error("discoverMovies error", err); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [filters, page]);

  // Infinite scroll via IntersectionObserver.
  // Uses refs (loadingRef, pageRef, totalPagesRef) so the observer is created
  // ONCE and never reads stale closure values — the root cause of "only 4 results".
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting && 
          !loadingRef.current &&
          pageRef.current < totalPagesRef.current
        ) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "200px", threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []); // empty deps: created once, reads live values via refs

  // ── Filter helpers ──────────────────────────────────────────────────────────

  const updateFilter = (key, value) => {
    deleteHistorySavedState();
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const toggleFilter = (key, value) => {
    deleteHistorySavedState();
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? "" : value }));
    setPage(1);
  };

  const clearFilters = () => {
    deleteHistorySavedState();
    setFilters((prev) => ({ ...DEFAULT_FILTERS, type: prev.type }));
    setPage(1);
  };

  const handleWatchlist = async (item) => {
    try {
      const success = await toggleWatchlist(item);
      if (!success) onNeedLogin();
    } catch (err) {
      console.error("toggleWatchlist error", err);
      onNeedLogin();
    }
  };

  // Save discover state into history entry, then navigate to detail
  const handleSelect = (item) => {
    try {
      const s = window.history.state || {};
      const bb = {
        filters,
        page,
        movies,
        scrollY: window.scrollY || 0,
      };
      window.history.replaceState({ ...s, bb_discover_state: bb }, "");
    } catch { /* ignore */ }
    navigate(`/${filters.type}/${item.id}`);
  };

  const activeFilterCount = [
    filters.region, filters.genre, filters.topRated, filters.ongoing,
  ].filter(Boolean).length;

  return (
    <div className="discover-page">
      <div className="discover-filter">
        <div className="discover-filter-header">
          <h2>Discover</h2>
          {activeFilterCount > 0 && (
            <span className="filter-count-badge">{activeFilterCount} active</span>
          )}
        </div>

        <h4>Type</h4>
        <div className="filter-chips">
          {[{ v: "movie", l: "Movies" }, { v: "tv", l: "TV Series" }].map(({ v, l }) => (
            <button
              key={v} type="button"
              aria-pressed={filters.type === v}
              className={filters.type === v ? "active-chip" : ""}
              onClick={() => updateFilter("type", v)}
            >{l}</button>
          ))}
        </div>

        <h4>Region</h4>
        <div className="filter-chips">
          <button
            type="button" aria-pressed={filters.region === ""}
            className={filters.region === "" ? "active-chip" : ""}
            onClick={() => updateFilter("region", "")}
          >All</button>
          {regions.map((r) => (
            <button
              key={r.code} type="button"
              aria-pressed={filters.region === r.code}
              className={filters.region === r.code ? "active-chip" : ""}
              onClick={() => toggleFilter("region", r.code)}
            >{REGION_LABELS[r.code] || r.name || r.code}</button>
          ))}
        </div>

        <h4>Genre</h4>
        <div className="filter-chips">
          <button
            type="button" aria-pressed={filters.genre === ""}
            className={filters.genre === "" ? "active-chip" : ""}
            onClick={() => updateFilter("genre", "")}
          >All</button>
          {genres.map((g) => (
            <button
              key={g.id} type="button"
              aria-pressed={String(filters.genre) === String(g.id)}
              className={String(filters.genre) === String(g.id) ? "active-chip" : ""}
              onClick={() => toggleFilter("genre", g.id)}
            >{g.name}</button>
          ))}
        </div>

        <h4>Sort &amp; Status</h4>
        <div className="filter-chips">
          <button
            type="button" aria-pressed={!!filters.topRated}
            className={filters.topRated ? "active-chip" : ""}
            onClick={() => updateFilter("topRated", !filters.topRated)}
          >⭐ Top Rated</button>
          {filters.type === "tv" && (
            <button
              type="button" aria-pressed={!!filters.ongoing}
              className={filters.ongoing ? "active-chip" : ""}
              onClick={() => updateFilter("ongoing", !filters.ongoing)}
            >Ongoing</button>
          )}
        </div>

        <button className="clear-filter-btn" type="button" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>

      <div className="discover-results">
        <div className="discover-results-header">
          <h2>
            {loading && page === 1 ? "Loading..." : `${movies.length} Results`}
            {(filters.region || filters.topRated || filters.ongoing || filters.genre) && (
              <span className="results-region-label">
                {" — "}
                {filters.region ? (REGION_LABELS[filters.region] || filters.region) : ""}
                {filters.type === "tv" ? " Series" : " Movies"}
                {filters.ongoing ? " · Ongoing" : ""}
                {filters.topRated ? " · Top Rated" : ""}
              </span>
            )}
          </h2>
        </div>

        {loading && page === 1 ? (
          <div className="discover-skeleton">
            {[...Array(12)].map((_, i) => <div key={i} className="skeleton-card" />)}
          </div>
        ) : movies.length === 0 ? (
          <p className="no-data">No results found. Try different filters.</p>
        ) : (
          <div className="movies-grid">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                item={{ ...movie, media_type: filters.type }}
                onSelect={handleSelect}
                isInWatchlist={isInWatchlist(movie.id)}
                onWatchlist={handleWatchlist}
              />
            ))}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        {movies.length > 0 && (
          <>
            <div ref={sentinelRef} style={{ height: 1 }} />
            {loading && page > 1 && (
              <p className="loading" style={{ textAlign: "center", padding: "20px" }}>
                Loading more...
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
