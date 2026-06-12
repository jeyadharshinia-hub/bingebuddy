import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import useSearchHistory from "../hooks/useSearchHistory";
import useDebounce from "../hooks/useDebounce";
import { searchMovies } from "../services/api";
import logo from "../assets/logo.png";
export default function Navbar({ onNeedLogin }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { history, addToHistory, clearHistory, removeItem } = useSearchHistory();

  const [showProfile, setShowProfile] = useState(false);
  const [navQuery, setNavQuery] = useState("");
  const [navSuggestions, setNavSuggestions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("bb_theme") !== "light";
  });

  const debouncedNav = useDebounce(navQuery, 400);

  // Apply theme to <html> element on mount and when toggled
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("bb_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

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

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        <img src={logo} alt="BingeBuddy" className="nav-logo-img" />
        <span className="binge">Binge</span>
        <span className="buddy">Buddy</span>
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/?section=trending">Trending</Link>
        <Link to="/?section=movies">Movies</Link>
        <Link to="/?section=series">Series</Link>
        <Link to="/discover">Discover</Link>
        <Link to="/watchlist">Watchlist</Link>
        <Link to="/leaderboard">Leaderboard</Link>
      </div>

      {/* Search */}
      <div className="nav-search-wrapper">
        <form onSubmit={handleNavSearch} className="nav-search-form">
          <input
            value={navQuery}
            onChange={(e) => setNavQuery(e.target.value)}
            onFocus={() => setShowHistory(true)}
            placeholder="Search movies, series..."
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
                  <small>
                    {item.media_type === "tv" ? "TV Series" : "Movie"} •{" "}
                    {(item.release_date || item.first_air_date || "").slice(0, 4)}
                  </small>
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

      {/* Theme Toggle */}
      <button
        className="theme-toggle-btn"
        onClick={() => setDarkMode((d) => !d)}
        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {darkMode ? "☀️" : "🌙"}
      </button>

      {/* Profile */}
      <div
        className="profile-section"
        onClick={() => user && setShowProfile((p) => !p)}
      >
        {user ? (
          <img
            src={user.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
            alt="profile"
            className="profile-pic"
          />
        ) : (
          <button
            className="nav-signin-btn"
            onClick={(e) => {
              e.stopPropagation();
              onNeedLogin();
            }}
          >
            Sign In
          </button>
        )}

        {showProfile && user && (
          <div className="profile-dropdown">
            <div className="profile-info">
              <img
                src={user.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                alt=""
              />
              <div>
                <strong>{user.displayName}</strong>
                <small>{user.email}</small>
              </div>
            </div>
            <Link to="/profile" className="profile-link" onClick={() => setShowProfile(false)}>
              My Profile
            </Link>
            <Link to="/watchlist" className="profile-link" onClick={() => setShowProfile(false)}>
              Watchlist
            </Link>
            <button
              className="logout-btn"
              onClick={(e) => {
                e.stopPropagation();
                logout();
                setShowProfile(false);
              }}
            >
              Sign Out
            </button>
          </div>
        )}

        {showProfile && !user && (
          <div className="profile-dropdown">
            <button
              className="signin-prompt"
              onClick={(e) => {
                e.stopPropagation();
                setShowProfile(false);
                onNeedLogin();
              }}
            >
              Sign In / Register
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}