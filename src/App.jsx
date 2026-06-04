import { Routes, Route, useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import MovieCard from "./components/MovieCard";
import HeroCarousel from "./components/HeroCarousel";
import CastCard from "./components/CastCard";
import CommentBox from "./components/CommentBox";
import LoginModal from "./components/LoginModal";
import PersonPage from "./pages/PersonPage";
import ProfilePage from "./pages/ProfilePage";
import { searchMovies, getMovieDetails, getMovieCast, getTrending, getVideos } from "./services/api";
import { useAuth } from "./hooks/useAuth";
import useWatchlist from "./hooks/useWatchlist";
import useSearchHistory from "./hooks/useSearchHistory";
import Discover from "./pages/Discover";

/* ─── Root layout that shares filter state ─────────────── */
function AppLayout() {
  const [filter, setFilter] = useState({});
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <Navbar onFilterChange={setFilter} currentFilter={filter} />
      <div className="container">
        <Routes>
          <Route path="/" element={<HomePage filter={filter} onNeedLogin={() => setShowLogin(true)} />} />
          <Route path="/movie/:id" element={<DetailPage type="movie" onNeedLogin={() => setShowLogin(true)} />} />
          <Route path="/tv/:id" element={<DetailPage type="tv" onNeedLogin={() => setShowLogin(true)} />} />
          <Route path="/person/:id" element={<PersonPage />} />
          <Route path="/watchlist" element={<WatchlistPage onNeedLogin={() => setShowLogin(true)} />} />
          <Route path="/profile" element={<ProfilePage onNeedLogin={() => setShowLogin(true)} />} />
          <Route path="/discover" element={<Discover />} />
        </Routes>
      </div>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}

/* ─── Home Page ─────────────────────────────────────────── */
function HomePage({ filter, onNeedLogin }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") || "";
  const urlSection = searchParams.get("section") || "";

  const [trending, setTrending] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Derived — no useState needed
  const hasSearched = Boolean(urlQuery);

  useSearchHistory();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();

  // Fetch trending on mount
  useEffect(() => {
    getTrending().then(setTrending).catch(console.error);
  }, []);

  // React to URL query param
  useEffect(() => {
    if (!urlQuery) return;
    let active = true;
    
    searchMovies(urlQuery)
      .then((data) => {
        if (!active) return;
        let filtered = data
          .map((i) => ({ ...i, media_type: i.media_type || "movie" }))
          .filter((i) => i.media_type === "movie" || i.media_type === "tv");
        if (filter.type && filter.type !== "all") filtered = filtered.filter((i) => i.media_type === filter.type);
        if (filter.language) filtered = filtered.filter((i) => i.original_language === filter.language);
        if (filter.genre) filtered = filtered.filter((i) => i.genre_ids?.includes(filter.genre));
        if (filter.topRated) filtered = filtered.filter((i) => (i.vote_average || 0) >= 7);
        if (filter.ongoing) filtered = filtered.filter((i) => i.media_type === "tv" && !i.last_air_date);
        setResults(filtered);
        setLoading(false);
      })
      .catch((err) => {
        if (active) { console.error(err); setLoading(false); }
      });
    return () => { active = false; };
  }, [urlQuery, filter]);

  const handleSelect = (item) => {
    const type = item.media_type === "tv" ? "tv" : "movie";
    navigate(`/${type}/${item.id}`);
  };

  const handleWatchlist = (item) => {
    if (!toggleWatchlist(item)) onNeedLogin();
  };

  // Filter trending by section
  const heroItems = trending.slice(0, 8);
  let displayTrending = trending;
  if (urlSection === "movies") displayTrending = trending.filter((i) => i.media_type === "movie");
  if (urlSection === "series") displayTrending = trending.filter((i) => i.media_type === "tv");

  if (filter.type && filter.type !== "all") displayTrending = displayTrending.filter((i) => i.media_type === filter.type);
  if (filter.language) displayTrending = displayTrending.filter((i) => i.original_language === filter.language);
  if (filter.genre) displayTrending = displayTrending.filter((i) => i.genre_ids?.includes(filter.genre));
  if (filter.topRated) displayTrending = displayTrending.filter((i) => (i.vote_average || 0) >= 7);

  return (
    <>
      {!hasSearched && heroItems.length > 0 && (
        <HeroCarousel items={heroItems} onSelect={handleSelect} />
      )}

      {hasSearched && (
        <>
          <div className="results-header">
            <h2>🔎 Results for "{urlQuery}"</h2>
            <button className="back-btn" onClick={() => navigate("/")}>← Home</button>
          </div>
          {loading ? (
            <p className="loading">Searching...</p>
          ) : results.length === 0 ? (
            <p className="no-data">No results found. Try different filters.</p>
          ) : (
            <div className="movies-grid">
              {results.map((item) => (
                <MovieCard
                  key={item.id}
                  item={item}
                  onSelect={handleSelect}
                  isInWatchlist={isInWatchlist(item.id)}
                  onWatchlist={handleWatchlist}
                />
              ))}
            </div>
          )}
        </>
      )}

      {!hasSearched && (
        <>
          <div className="section-nav">
            <Link to="/" className={!urlSection ? "active" : ""}>All</Link>
            <Link to="/?section=movies" className={urlSection === "movies" ? "active" : ""}>Movies</Link>
            <Link to="/?section=series" className={urlSection === "series" ? "active" : ""}>Series</Link>
            <Link to="/?section=trending" className={urlSection === "trending" ? "active" : ""}>Trending</Link>
          </div>
          <h2>🔥 {urlSection === "movies" ? "Movies" : urlSection === "series" ? "TV Series" : "Trending Today"}</h2>
          <div className="movies-grid">
            {displayTrending.map((item) => (
              <MovieCard
                key={item.id}
                item={item}
                onSelect={handleSelect}
                isInWatchlist={isInWatchlist(item.id)}
                onWatchlist={handleWatchlist}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}

/* ─── Detail Page ───────────────────────────────────────── */
function DetailPage({ type, onNeedLogin }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [cast, setCast] = useState([]);
  const [trailerKey, setTrailerKey] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toggleWatchlist, isInWatchlist } = useWatchlist();

  // Track whether this is the first mount to avoid extra re-renders
  const prevIdRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    let active = true;

    // Only reset to loading state if navigating to a different item
    // Use a timer to defer the setState out of the synchronous effect body
    let resetTimer;
    if (prevIdRef.current !== null && prevIdRef.current !== id) {
      resetTimer = setTimeout(() => {
        if (active) {
          setItem(null);
          setCast([]);
          setTrailerKey(null);
          setLoading(true);
        }
      }, 0);
    }
    prevIdRef.current = id;

    Promise.all([
      getMovieDetails(id, type),
      getMovieCast(id, type),
      getVideos(id, type),
    ])
      .then(([details, castData, trailer]) => {
        if (!active) return;
        setItem(details);
        setCast(castData.slice(0, 10));
        setTrailerKey(trailer);
        setLoading(false);
      })
      .catch((err) => {
        if (active) { console.error(err); setLoading(false); }
      });

    return () => {
      active = false;
      clearTimeout(resetTimer);
    };
  }, [id, type]);

  const handleWatchlist = () => {
    if (!item) return;
    if (!toggleWatchlist({ ...item, media_type: type })) onNeedLogin();
  };

  if (loading) return <p className="loading">Loading details...</p>;
  if (!item) return <p className="loading">Could not load details.</p>;

  const inWatchlist = isInWatchlist(item.id);

  return (
    <div className="details-section">
      <button className="back-btn" onClick={() => navigate("/")}>← Home</button>

      {item.backdrop_path && (
        <div
          className="detail-backdrop"
          style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${item.backdrop_path})` }}
        />
      )}

      <div className="details-content">
        <img
          src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "https://via.placeholder.com/300x450"}
          alt={item.title || item.name}
          className="detail-poster"
        />
        <div className="detail-info">
          <h2>{item.title || item.name}</h2>
          <div className="detail-meta">
            <span>⭐ {item.vote_average?.toFixed(1)}</span>
            <span>📅 {item.release_date || item.first_air_date}</span>
            {item.runtime && <span>⏱ {item.runtime} min</span>}
            {item.status && (
              <span className={`status-badge ${item.status === "Returning Series" ? "ongoing" : ""}`}>
                {item.status}
              </span>
            )}
          </div>
          <p className="genre-tags">
            {item.genres?.map((g) => <span key={g.id} className="genre-tag">{g.name}</span>)}
          </p>
          <p className="detail-overview">{item.overview}</p>

          <div className="detail-actions">
            {trailerKey && (
              <button className="trailer-btn" onClick={() => setShowTrailer(true)}>
                ▶ Watch Trailer
              </button>
            )}
            <button
              className={`watchlist-btn ${inWatchlist ? "in-watchlist" : ""}`}
              onClick={handleWatchlist}
            >
              {inWatchlist ? "❤️ Saved" : "🤍 Watchlist"}
            </button>
          </div>
        </div>
      </div>

      {trailerKey && (
        <div className="trailer-section">
          <h3>🎬 Trailer</h3>
          <div className="trailer-embed">
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?rel=0`}
              title="Trailer"
              allowFullScreen
            />
          </div>
        </div>
      )}

      <div className="cast-section">
        <h3>🎭 Cast — tap to view profile</h3>
        <div className="cast-grid">
          {cast.map((actor) => (
            <CastCard key={actor.id} actor={actor} />
          ))}
        </div>
      </div>

      <CommentBox mediaId={`${type}-${id}`} onNeedLogin={onNeedLogin} />

      {showTrailer && trailerKey && (
        <div className="modal-overlay" onClick={() => setShowTrailer(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowTrailer(false)}>✕</button>
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              title="Trailer"
              allowFullScreen
              allow="autoplay"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Watchlist Page ────────────────────────────────────── */
function WatchlistPage({ onNeedLogin }) {
  const { user } = useAuth();
  const { watchlist, toggleWatchlist } = useWatchlist();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="profile-page empty">
        <h2>❤️ Sign in to access your Watchlist</h2>
        <button className="hero-btn primary" onClick={onNeedLogin}>Sign In</button>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: "20px" }}>❤️ My Watchlist ({watchlist.length})</h2>
      {watchlist.length === 0 && <p className="no-data">Your watchlist is empty. Browse and save titles!</p>}
      <div className="movies-grid">
        {watchlist.map((item) => (
          <MovieCard
            key={item.id}
            item={item}
            onSelect={(i) => navigate(`/${i.media_type === "tv" ? "tv" : "movie"}/${i.id}`)}
            isInWatchlist={true}
            onWatchlist={(i) => toggleWatchlist(i)}
          />
        ))}
      </div>
    </div>
  );
}

export default AppLayout;