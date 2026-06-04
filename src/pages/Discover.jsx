import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { discoverMovies, getGenres, getRegions } from "../services/api";
import MovieCard from "../components/MovieCard";
import LoginModal from "../components/LoginModal";
import { useWatchlist } from "../hooks/useWatchlist";


const POPULAR_REGION_CODES = ["US", "IN", "KR", "JP", "CN", "TH", "PH", "GB", "FR"];

const DEFAULT_FILTERS = {
  type: "movie",
  genre: "",
  region: "",
  topRated: false,
};

export default function DiscoverPage() {
  const navigate = useNavigate();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();


  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showLogin, setShowLogin] = useState(false);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const prevFiltersRef = useRef(filters);

  useEffect(() => {
    getRegions()
      .then((data) => setRegions(data.filter((r) => POPULAR_REGION_CODES.includes(r.code))))
      .catch(console.error);
  }, []);

  useEffect(() => {
    getGenres(filters.type).then(setGenres).catch(console.error);
  }, [filters.type]);

  useEffect(() => {
    let active = true;
    const filtersChanged = prevFiltersRef.current !== filters;
    prevFiltersRef.current = filters;

    const currentPage = filtersChanged ? 1 : page;

    discoverMovies({ ...filters, page: currentPage })
      .then((data) => {
        if (!active) return;
        setTotalPages(data.total_pages);
        const filtered = filters.genre
          ? data.results.filter((m) => m.genre_ids?.includes(Number(filters.genre)))
          : data.results;
        setMovies((prev) => currentPage === 1 ? filtered : [...prev, ...filtered]);
        setLoading(false);
        if (filtersChanged && page !== 1) setPage(1);
      })
      .catch((err) => {
        if (active) { console.error(err); setLoading(false); }
      });

    const loadTimer = setTimeout(() => { if (active) setLoading(true); }, 0);

    return () => {
      active = false;
      clearTimeout(loadTimer);
    };
  }, [filters, page]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const toggleFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? "" : value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  return (
    <div className="discover-page">
      <div className="discover-filter">
        <h2>🎯 Discover Content</h2>

        <h4>Content Type</h4>
        <div className="filter-chips">
          {["movie", "tv"].map((t) => (
            <button
              key={t}
              className={filters.type === t ? "active-chip" : ""}
              onClick={() => updateFilter("type", t)}
            >
              {t === "movie" ? "🎬 Movies" : "📺 TV Series"}
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
          {regions.map((r) => (
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

        <br />
        <button className="clear-filter-btn" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>

      <div className="discover-results">
        <h2>Showing {movies.length} Results</h2>
        <div className="movies-grid">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              item={{ ...movie, media_type: filters.type }}
              onSelect={(i) => navigate(`/${filters.type}/${i.id}`)}
              isInWatchlist={isInWatchlist(movie.id)}
              onWatchlist={(item) => {
                if (!toggleWatchlist(item)) setShowLogin(true);
              }}
            />
          ))}
        </div>

        {page < totalPages && (
          <div style={{ textAlign: "center", margin: "20px 0" }}>
            <button
              className="hero-btn primary"
              onClick={() => setPage((p) => p + 1)}
              disabled={loading}
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}

        {loading && page === 1 && <p className="loading">Loading...</p>}
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}