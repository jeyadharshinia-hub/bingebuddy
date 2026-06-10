import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { discoverMovies, getGenres } from "../services/api";
import MovieCard from "../components/MovieCard";
import { useWatchlist } from "../hooks/useWatchlist";

const REGIONS = [
  { code: "US", name: "USA" },
  { code: "IN", name: "India" },
  { code: "KR", name: "Korea" },
  { code: "JP", name: "Japan" },
  { code: "CN", name: "China" },
  { code: "TH", name: "Thailand" },
  { code: "PH", name: "Philippines" },
  { code: "GB", name: "UK" },
  { code: "FR", name: "France" },
];

const DEFAULT_FILTERS = {
  type: "movie",
  genre: "",
  region: "",
  topRated: false,
};

export default function DiscoverPage({ onNeedLogin }) {
  const navigate = useNavigate();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();

  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(() => {
    return Number(
      localStorage.getItem("discoverPage")
    ) || 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem("discoverFilters");
    return saved ? JSON.parse(saved) : DEFAULT_FILTERS;
  });

  const prevFiltersRef = useRef(filters);
  const sentinelRef = useRef(null); // element at bottom of list
  const loadingRef = useRef(false); // prevent double-firing

  // Fetch genres when content type changes
  useEffect(() => {
    getGenres(filters.type).then(setGenres).catch(console.error);
  }, [filters.type]);

  useEffect(() => {
    localStorage.setItem(
      "discoverFilters",
      JSON.stringify(filters)
    );
  }, [filters]);
  useEffect(() => {
    localStorage.setItem("discoverPage", page);
  }, [page]);

  useEffect(() => {
  const savedScroll = localStorage.getItem("discoverScroll");

  if (savedScroll) {
    setTimeout(() => {
      window.scrollTo(0, Number(savedScroll));
    }, 300);
  }
}, []);
  // Fetch movies when filters or page changes
  useEffect(() => {
    let active = true;

    const filtersChanged = prevFiltersRef.current !== filters;
    prevFiltersRef.current = filters;
    const currentPage = filtersChanged ? 1 : page;

    loadingRef.current = true;

    const timer = setTimeout(() => {
      if (active) setLoading(true);
    }, 0);

    discoverMovies({ ...filters, page: currentPage })
      .then((data) => {
        if (!active) return;
        setTotalPages(data.total_pages);
        const results = filters.genre
          ? data.results.filter((m) => m.genre_ids?.includes(Number(filters.genre)))
          : data.results;
        setMovies((prev) => currentPage === 1 ? results : [...prev, ...results]);
        if (filtersChanged && page !== 1) setPage(1);
      })
      .catch((err) => { if (active) console.error(err); })
      .finally(() => {
        if (active) {
          setLoading(false);
          loadingRef.current = false;
        }
      });

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [filters, page]);


  // IntersectionObserver — fires when sentinel div scrolls into view
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // Only load next page if:
        // - sentinel is visible
        // - not already loading
        // - more pages exist
        if (entry.isIntersecting && !loadingRef.current && page < totalPages) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "200px" } // trigger 200px before sentinel reaches viewport
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [page, totalPages]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const toggleFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? "" : value,
    }));
    setPage(1);
  };

  const clearFilters = () => {
    localStorage.removeItem("discoverFilters");
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const handleWatchlist = (item) => {
    if (!toggleWatchlist(item)) onNeedLogin();
  };

  return (
    <div className="discover-page">
      {/* ── Filter Panel ── */}
      <div className="discover-filter">
        <h2>🎯 Discover</h2>

        <h4>Content Type</h4>
        <div className="filter-chips">
          {[{ v: "movie", l: "🎬 Movies" }, { v: "tv", l: "📺 TV Series" }].map(({ v, l }) => (
            <button
              key={v}
              className={filters.type === v ? "active-chip" : ""}
              onClick={() => updateFilter("type", v)}
            >
              {l}
            </button>
          ))}
        </div>

        <h4>📍 Region</h4>
        <div className="filter-chips">
          <button
            className={filters.region === "" ? "active-chip" : ""}
            onClick={() => updateFilter("region", "")}
          >
            🌍 All
          </button>
          {REGIONS.map((r) => (
            <button
              key={r.code}
              className={filters.region === r.code ? "active-chip" : ""}
              onClick={() => toggleFilter("region", r.code)}
            >
              {r.name}
            </button>
          ))}
        </div>

        <h4>🎭 Genre</h4>
        <div className="filter-chips">
          <button
            className={filters.genre === "" ? "active-chip" : ""}
            onClick={() => updateFilter("genre", "")}
          >
            All
          </button>
          {genres.map((g) => (
            <button
              key={g.id}
              className={filters.genre === g.id ? "active-chip" : ""}
              onClick={() => toggleFilter("genre", g.id)}
            >
              {g.name}
            </button>
          ))}
        </div>

        <h4>📊 Extra</h4>
        <div className="filter-chips">
          <button
            className={filters.topRated ? "active-chip" : ""}
            onClick={() => updateFilter("topRated", !filters.topRated)}
          >
            ⭐ Top Rated
          </button>
        </div>

        <button className="clear-filter-btn" style={{ marginTop: "16px" }} onClick={clearFilters}>
          Clear Filters
        </button>
      </div>

      {/* ── Results ── */}
      <div className="discover-results">
        <h2>
          {loading && page === 1 ? "Loading..." : `Showing ${movies.length} Results`}
        </h2>

        {loading && page === 1 ? (
          <div className="discover-skeleton">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        ) : movies.length === 0 ? (
          <p className="no-data">No results found. Try different filters.</p>
        ) : (
          <div className="movies-grid">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                item={{ ...movie, media_type: filters.type }}
                onSelect={(i) => {
                  localStorage.setItem(
                    "discoverScroll",
                    window.scrollY
                  );

                  navigate(`/${filters.type}/${i.id}`);
                }}
                isInWatchlist={isInWatchlist(movie.id)}
                onWatchlist={handleWatchlist}
              />
            ))}
          </div>
        )}

        {/* Sentinel — IntersectionObserver watches this */}
        <div ref={sentinelRef} style={{ height: "1px" }} />

        {/* Loading spinner for subsequent pages */}
        {loading && page > 1 && (
          <p className="loading" style={{ padding: "20px", textAlign: "center" }}>
            Loading more...
          </p>
        )}

        {/* End of results */}
        {!loading && page >= totalPages && movies.length > 0 && (
          <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px", fontSize: "13px" }}>
            You've seen everything ✓
          </p>
        )}
      </div>
    </div>
  );
}