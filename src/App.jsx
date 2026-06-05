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
import { useWatchlist } from "./hooks/useWatchlist";
import useSearchHistory from "./hooks/useSearchHistory";
import Discover from "./pages/Discover";

/* ─── Root layout ───────────────────────────────────────── */
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

  const hasSearched = Boolean(urlQuery);

  useSearchHistory();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();

  useEffect(() => {
    getTrending().then(setTrending).catch(console.error);
  }, []);

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
            <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
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
  const prevIdRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    let active = true;

    const resetTimer = prevIdRef.current !== null && prevIdRef.current !== id
      ? setTimeout(() => { if (active) setLoading(true); }, 0)
      : null;
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
      })
      .catch((err) => { if (active) console.error(err); })
      .finally(() => { if (active) setLoading(false); });

    return () => {
      active = false;
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, [id, type]);

  const handleWatchlist = () => {
    if (!item) return;
    if (!toggleWatchlist({ ...item, media_type: type })) onNeedLogin();
  };

  if (loading) return <p className="loading">Loading details...</p>;
  if (!item) return <p className="loading">Could not load details.</p>;

  const inWatchlist = isInWatchlist(item.id);

  // Helpers
  const fmt = (n) => n ? `$${Number(n).toLocaleString()}` : null;
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : null;

  return (
    <div className="details-section">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      {item.backdrop_path && (
        <div
          className="detail-backdrop"
          style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${item.backdrop_path})` }}
        />
      )}

      {/* ── Main Info ── */}
      <div className="details-content">
        <img
          src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "https://via.placeholder.com/300x450"}
          alt={item.title || item.name}
          className="detail-poster"
        />
        <div className="detail-info">

          {item.tagline && <p className="detail-tagline">"{item.tagline}"</p>}
          <h2>{item.title || item.name}</h2>

          <div className="detail-meta">
            <span>⭐ {item.vote_average?.toFixed(1)} <span className="meta-sub">({item.vote_count?.toLocaleString()} votes)</span></span>
            <span>📅 {item.release_date || item.first_air_date}</span>
            {item.runtime && <span>⏱ {item.runtime} min</span>}
            {item.original_language && <span>🗣 {item.original_language?.toUpperCase()}</span>}
            {item.status && (
              <span className={`status-badge ${item.status === "Returning Series" ? "ongoing" : ""}`}>
                {item.status}
              </span>
            )}
          </div>

          <div className="genre-tags">
            {item.genres?.map((g) => <span key={g.id} className="genre-tag">{g.name}</span>)}
          </div>

          <p className="detail-overview">{item.overview}</p>

          <div className="detail-actions">
            {trailerKey && (
              <button className="trailer-btn" onClick={() => setShowTrailer(true)}>▶ Watch Trailer</button>
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

      {/* ── Extra Details Table ── */}
      <div className="detail-extra">

        {/* MOVIE specific */}
        {type === "movie" && (
          <div className="detail-facts">
            <h3>🎬 Movie Details</h3>
            <div className="facts-grid">
              {item.original_title && item.original_title !== item.title && (
                <div className="fact-item"><span className="fact-label">Original Title</span><span>{item.original_title}</span></div>
              )}
              {fmtDate(item.release_date) && (
                <div className="fact-item"><span className="fact-label">Release Date</span><span>{fmtDate(item.release_date)}</span></div>
              )}
              {item.runtime > 0 && (
                <div className="fact-item"><span className="fact-label">Runtime</span><span>{item.runtime} min ({Math.floor(item.runtime / 60)}h {item.runtime % 60}m)</span></div>
              )}
              {fmt(item.budget) && (
                <div className="fact-item"><span className="fact-label">Budget</span><span>{fmt(item.budget)}</span></div>
              )}
              {fmt(item.revenue) && (
                <div className="fact-item"><span className="fact-label">Revenue</span><span>{fmt(item.revenue)}</span></div>
              )}
              {item.popularity && (
                <div className="fact-item"><span className="fact-label">Popularity</span><span>🔥 {item.popularity.toFixed(1)}</span></div>
              )}
              {item.spoken_languages?.length > 0 && (
                <div className="fact-item"><span className="fact-label">Languages</span><span>{item.spoken_languages.map(l => l.english_name).join(", ")}</span></div>
              )}
              {item.production_countries?.length > 0 && (
                <div className="fact-item"><span className="fact-label">Countries</span><span>{item.production_countries.map(c => c.name).join(", ")}</span></div>
              )}
              {item.production_companies?.length > 0 && (
                <div className="fact-item"><span className="fact-label">Studios</span><span>{item.production_companies.map(c => c.name).join(", ")}</span></div>
              )}
              {item.imdb_id && (
                <div className="fact-item">
                  <span className="fact-label">IMDb</span>
                  <a href={`https://www.imdb.com/title/${item.imdb_id}`} target="_blank" rel="noreferrer" className="imdb-link">
                    View on IMDb
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TV specific */}
        {type === "tv" && (
          <div className="detail-facts">
            <h3>📺 Series Details</h3>
            <div className="facts-grid">
              {item.original_name && item.original_name !== item.name && (
                <div className="fact-item"><span className="fact-label">Original Name</span><span>{item.original_name}</span></div>
              )}
              {item.first_air_date && (
                <div className="fact-item"><span className="fact-label">First Aired</span><span>{fmtDate(item.first_air_date)}</span></div>
              )}
              {item.last_air_date && (
                <div className="fact-item"><span className="fact-label">Last Aired</span><span>{fmtDate(item.last_air_date)}</span></div>
              )}
              {item.number_of_seasons > 0 && (
                <div className="fact-item"><span className="fact-label">Seasons</span><span>{item.number_of_seasons}</span></div>
              )}
              {item.number_of_episodes > 0 && (
                <div className="fact-item"><span className="fact-label">Episodes</span><span>{item.number_of_episodes}</span></div>
              )}
              {item.episode_run_time?.length > 0 && (
                <div className="fact-item"><span className="fact-label">Episode Runtime</span><span>{item.episode_run_time[0]} min</span></div>
              )}
              <div className="fact-item">
                <span className="fact-label">In Production</span>
                <span>{item.in_production ? "✅ Yes" : "❌ No"}</span>
              </div>
              {item.created_by?.length > 0 && (
                <div className="fact-item"><span className="fact-label">Created By</span><span>{item.created_by.map(c => c.name).join(", ")}</span></div>
              )}
              {item.networks?.length > 0 && (
                <div className="fact-item"><span className="fact-label">Networks</span><span>{item.networks.map(n => n.name).join(", ")}</span></div>
              )}
              {item.origin_country?.length > 0 && (
                <div className="fact-item"><span className="fact-label">Origin Country</span><span>{item.origin_country.join(", ")}</span></div>
              )}
              {item.spoken_languages?.length > 0 && (
                <div className="fact-item"><span className="fact-label">Languages</span><span>{item.spoken_languages.map(l => l.english_name).join(", ")}</span></div>
              )}
              {item.production_companies?.length > 0 && (
                <div className="fact-item"><span className="fact-label">Studios</span><span>{item.production_companies.map(c => c.name).join(", ")}</span></div>
              )}
              {item.popularity && (
                <div className="fact-item"><span className="fact-label">Popularity</span><span>🔥 {item.popularity.toFixed(1)}</span></div>
              )}
            </div>

            {/* Next Episode */}
            {item.next_episode_to_air && (
              <div className="episode-card next">
                <h4>🔜 Next Episode</h4>
                <p><strong>S{item.next_episode_to_air.season_number} E{item.next_episode_to_air.episode_number}</strong> — {item.next_episode_to_air.name}</p>
                <small>📅 {fmtDate(item.next_episode_to_air.air_date)}</small>
                {item.next_episode_to_air.overview && <p className="ep-overview">{item.next_episode_to_air.overview}</p>}
              </div>
            )}

            {/* Last Episode */}
            {item.last_episode_to_air && (
              <div className="episode-card last">
                <h4>✅ Last Episode</h4>
                <p><strong>S{item.last_episode_to_air.season_number} E{item.last_episode_to_air.episode_number}</strong> — {item.last_episode_to_air.name}</p>
                <small>📅 {fmtDate(item.last_episode_to_air.air_date)} • ⭐ {item.last_episode_to_air.vote_average?.toFixed(1)}</small>
                {item.last_episode_to_air.overview && <p className="ep-overview">{item.last_episode_to_air.overview}</p>}
              </div>
            )}

            {/* Seasons list */}
            {item.seasons?.length > 0 && (
              <div className="seasons-list">
                <h4>📋 Seasons</h4>
                <div className="seasons-grid">
                  {item.seasons.filter(s => s.season_number > 0).map((s) => (
                    <div key={s.id} className="season-card">
                      <img
                        src={s.poster_path ? `https://image.tmdb.org/t/p/w200${s.poster_path}` : "https://via.placeholder.com/100x150?text=?"}
                        alt={s.name}
                      />
                      <div>
                        <p>{s.name}</p>
                        <small>{s.episode_count} episodes</small>
                        {s.air_date && <small> • {s.air_date.slice(0, 4)}</small>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Trailer ── */}
      {trailerKey && (
        <div className="trailer-section">
          <h3>🎬 Trailer</h3>
          <div className="trailer-embed">
            <iframe src={`https://www.youtube.com/embed/${trailerKey}?rel=0`} title="Trailer" allowFullScreen />
          </div>
        </div>
      )}

      {/* ── Cast ── */}
      <div className="cast-section">
        <h3>🎭 Cast</h3>
        <div className="cast-grid">
          {cast.map((actor) => (
            <CastCard key={actor.id} actor={actor} />
          ))}
        </div>
      </div>

      {/* ── Comments ── */}
      <CommentBox mediaId={`${type}-${id}`} onNeedLogin={onNeedLogin} />

      {/* ── Trailer Modal ── */}
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