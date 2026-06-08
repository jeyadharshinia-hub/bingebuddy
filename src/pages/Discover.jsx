import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { discoverMovies, getGenres } from "../services/api";
import MovieCard from "../components/MovieCard";
import { useWatchlist } from "../hooks/useWatchlist";

const REGIONS = [
  { code: "US", name: "🇺🇸 USA" },
  { code: "IN", name: "🇮🇳 India" },
  { code: "KR", name: "🇰🇷 Korea" },
  { code: "JP", name: "🇯🇵 Japan" },
  { code: "CN", name: "🇨🇳 China" },
  { code: "TH", name: "🇹🇭 Thailand" },
  { code: "PH", name: "🇵🇭 Philippines" },
  { code: "GB", name: "🇬🇧 UK" },
  { code: "FR", name: "🇫🇷 France" },
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

  const [movies,     setMovies]     = useState([]);
  const [genres,     setGenres]     = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters,    setFilters]    = useState(DEFAULT_FILTERS);

  const prevFiltersRef = useRef(filters);

  // Fetch genres when content type changes
  useEffect(() => {
    async function fetchGenres() {
      try {
        const data = await getGenres(filters.type);
        setGenres(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchGenres();
  }, [filters.type]);

  // Fetch movies when filters or page changes
  useEffect(() => {
    let active = true;

    const filtersChanged = prevFiltersRef.current !== filters;
    prevFiltersRef.current = filters;
    const currentPage = filtersChanged ? 1 : page;

    async function fetchMovies() {
      try {
        if (active) setLoading(true);

        const data = await discoverMovies({ ...filters, page: currentPage });
        if (!active) return;

        setTotalPages(data.total_pages);

        const results = filters.genre
          ? data.results.filter((m) => m.genre_ids?.includes(Number(filters.genre)))
          : data.results;

        setMovies((prev) => currentPage === 1 ? results : [...prev, ...results]);

        if (filtersChanged && page !== 1) setPage(1);

      } catch (err) {
        if (active) console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchMovies();
    return () => { active = false; };
  }, [filters, page]);

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
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

const handleWatchlist = async (item) => {
  const success = await toggleWatchlist(item);
  if (!success) onNeedLogin();
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
                onSelect={(i) => navigate(`/${filters.type}/${i.id}`)}
                isInWatchlist={isInWatchlist(movie.id)}
                onWatchlist={handleWatchlist}
              />
            ))}
          </div>
        )}

        {!loading && page < totalPages && (
          <div style={{ textAlign: "center", margin: "28px 0" }}>
            <button className="load-more-btn" onClick={() => setPage((p) => p + 1)}>
              Load More
            </button>
          </div>
        )}

        {loading && page > 1 && (
          <p className="loading" style={{ textAlign: "center", padding: "20px" }}>
            Loading more...
          </p>
        )}
      </div>
    </div>
  );
}
