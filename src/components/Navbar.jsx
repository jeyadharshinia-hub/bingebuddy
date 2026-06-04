import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import useSearchHistory from "../hooks/useSearchHistory";
import useDebounce from "../hooks/useDebounce";
import LoginModal from "./LoginModal";
import { searchMovies, getGenres } from "../services/api";

export default function Navbar({ onFilterChange, currentFilter }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { history, addToHistory, clearHistory, removeItem } = useSearchHistory();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [navQuery, setNavQuery] = useState("");
  const [navSuggestions, setNavSuggestions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [genres, setGenres] = useState([]);
  const debouncedNav = useDebounce(navQuery, 400);



  useEffect(() => {
    getGenres("movie").then(setGenres).catch(() => { });
  }, []);

  useEffect(() => {
    if (!debouncedNav.trim()) {
      const timer = setTimeout(() => setNavSuggestions([]), 0);
      return () => clearTimeout(timer);
    }
    let active = true;
    searchMovies(debouncedNav)
      .then((data) => { if (active) setNavSuggestions(data.slice(0, 5)); })
      .catch(() => { });
    return () => { active = false; };
  }, [debouncedNav]);

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest(".nav-search-wrapper")) {
        setNavSuggestions([]);
        setShowHistory(false);
      }
      if (!e.target.closest(".profile-section")) setShowProfile(false);
      if (!e.target.closest(".filter-wrapper")) setShowFilter(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNavSelect = (item) => {
    const type = item.media_type === "tv" ? "tv" : "movie";
    addToHistory(item.title || item.name);
    setNavQuery("");
    setNavSuggestions([]);
    setShowHistory(false);
    navigate(`/${type}/${item.id}`);
  };

  const handleNavSearch = (e) => {
    e.preventDefault();
    if (!navQuery.trim()) return;
    addToHistory(navQuery);
    navigate(`/?q=${encodeURIComponent(navQuery)}`);
    setNavQuery("");
    setNavSuggestions([]);
  };

  const handleHistoryClick = (q) => {
    addToHistory(q);
    navigate(`/?q=${encodeURIComponent(q)}`);
    setNavQuery("");
    setShowHistory(false);
  };

  const applyFilters = () => {
    navigate(
      `/discover?type=${currentFilter?.type || ""}&language=${currentFilter?.language || ""}&genre=${currentFilter?.genre || ""}&region=${currentFilter?.region || ""}`
    );
  };



  return (
    <>
      <nav className="navbar">
        <Link to="/" className="nav-logo">🎬 Binge<span>Buddy</span></Link>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/?section=trending">Trending</Link>
          <Link to="/?section=movies">Movies</Link>
          <Link to="/?section=series">Series</Link>
          <Link to="/watchlist">❤️ Watchlist</Link>
        </div>

        {/* Navbar Search */}
        <div className="nav-search-wrapper">
          <form onSubmit={handleNavSearch} className="nav-search-form">
            <input
              value={navQuery}
              onChange={(e) => setNavQuery(e.target.value)}
              onFocus={() => setShowHistory(true)}
              placeholder="🔍 Search..."
              className="nav-search-input"
            />
          </form>

          {navSuggestions.length > 0 && (
            <ul className="nav-suggestions">
              {navSuggestions.map((item) => (
                <li key={item.id} onClick={() => handleNavSelect(item)}>
                  {item.poster_path && (
                    <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt="" />
                  )}
                  <div>
                    <span>{item.title || item.name}</span>
                    <small>{item.media_type === "tv" ? "TV Series" : "Movie"} • {(item.release_date || item.first_air_date || "").slice(0, 4)}</small>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {showHistory && !navQuery && history.length > 0 && (
            <div className="search-history-dropdown">
              <div className="history-header">
                <span>Recent Searches</span>
                <button onClick={clearHistory}>Clear</button>
              </div>
              {history.map((q) => (
                <div key={q} className="history-item">
                  <span onClick={() => handleHistoryClick(q)}>🕐 {q}</span>
                  <button onClick={() => removeItem(q)}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filter */}
        <div className="filter-wrapper">
          <button className="filter-toggle-btn" onClick={() => setShowFilter(!showFilter)}>
            ⚙️ Filter
          </button>
          {showFilter && (
            <div className="filter-panel">
              <h4>Filter Results</h4>

              <label>Type</label>
              <div className="filter-chips">
                {["all", "movie", "tv"].map((t) => (
                  <button
                    key={t}
                    className={`chip ${(currentFilter?.type || "all") === t ? "active" : ""}`}
                    onClick={() => onFilterChange?.({ ...currentFilter, type: t })}
                  >
                    {t === "all" ? "All" : t === "tv" ? "TV Series" : "Movies"}
                  </button>
                ))}
              </div>

              <label>Language</label>
              <label>🌍 Popular Languages</label>

              <div className="filter-chips">
                {[
                  { code: "en", name: "English" },
                  { code: "ko", name: "Korean" },
                  { code: "ja", name: "Japanese" },
                  { code: "zh", name: "Chinese" },
                  { code: "ta", name: "Tamil" },
                  { code: "hi", name: "Hindi" },
                  { code: "th", name: "Thai" },
                  { code: "tl", name: "Filipino" }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    className={`chip ${currentFilter?.language === lang.code
                      ? "active"
                      : ""
                      }`}
                    onClick={() =>
                      onFilterChange?.({
                        ...currentFilter,
                        language:
                          currentFilter?.language === lang.code
                            ? ""
                            : lang.code,
                      })
                    }
                  >
                    {lang.name}
                  </button>
                ))}
              </div>

              <label>🌎 Region</label>

              <div className="filter-chips">
                {[
                  { code: "US", name: "USA" },
                  { code: "IN", name: "India" },
                  { code: "KR", name: "Korea" },
                  { code: "JP", name: "Japan" },
                  { code: "CN", name: "China" },
                  { code: "TH", name: "Thailand" },
                  { code: "PH", name: "Philippines" },
                  { code: "GB", name: "UK" }
                ].map((region) => (
                  <button
                    key={region.code}
                    className={`chip ${currentFilter?.region === region.code
                        ? "active"
                        : ""
                      }`}
                    onClick={() =>
                      onFilterChange?.({
                        ...currentFilter,
                        region:
                          currentFilter?.region === region.code
                            ? ""
                            : region.code,
                      })
                    }
                  >
                    {region.name}
                  </button>
                ))}
              </div>

              <label>Genre</label>
              <div className="filter-chips genre-chips">
                {genres.map((g) => (
                  <button
                    key={g.id}
                    className={`chip ${currentFilter?.genre === g.id ? "active" : ""}`}
                    onClick={() => onFilterChange?.({ ...currentFilter, genre: currentFilter?.genre === g.id ? null : g.id })}
                  >
                    {g.name}
                  </button>
                ))}
              </div>

              <div className="filter-toggles">
                <label>
                  <input
                    type="checkbox"
                    checked={!!currentFilter?.topRated}
                    onChange={(e) => onFilterChange?.({ ...currentFilter, topRated: e.target.checked })}
                  />
                  ⭐ Top Rated (7+)
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={!!currentFilter?.ongoing}
                    onChange={(e) => onFilterChange?.({ ...currentFilter, ongoing: e.target.checked })}
                  />
                  📺 Ongoing Series
                </label>
              </div>
              <button
                className="apply-filter-btn"
                onClick={applyFilters}
              >
                Apply Filters
              </button>
              <button className="clear-filter-btn" onClick={() => onFilterChange?.({})}>
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="profile-section" onClick={() => setShowProfile(!showProfile)}>
          <img
            src={user?.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
            alt="profile"
            className="profile-pic"
          />
          {showProfile && (
            <div className="profile-dropdown">
              {user ? (
                <>
                  <div className="profile-info">
                    <img src={user.photoURL} alt="" />
                    <div>
                      <strong>{user.displayName}</strong>
                      <small>{user.email}</small>
                    </div>
                  </div>
                  <Link to="/profile" className="profile-link">👤 My Profile</Link>
                  <Link to="/watchlist" className="profile-link">❤️ Watchlist</Link>
                  <button className="logout-btn" onClick={(e) => { e.stopPropagation(); logout(); }}>
                    🚪 Sign Out
                  </button>
                </>
              ) : (
                <button
                  className="signin-prompt"
                  onClick={(e) => { e.stopPropagation(); setShowProfile(false); setShowLoginModal(true); }}
                >
                  Sign In / Register
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </>
  );
}