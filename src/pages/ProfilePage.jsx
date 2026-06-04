import { useAuth } from "../hooks/useAuth";
import { useWatchlist } from "../hooks/useWatchlist";
import useSearchHistory from "../hooks/useSearchHistory";
import { useNavigate } from "react-router-dom";

export default function ProfilePage({ onNeedLogin }) {
  const { user, logout } = useAuth();
  const { watchlist } = useWatchlist();
  const { history, clearHistory } = useSearchHistory();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="profile-page empty">
        <h2>👤 Sign in to view your profile</h2>
        <button className="hero-btn primary" onClick={onNeedLogin}>Sign In</button>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-hero">
        <img src={user.photoURL} alt={user.displayName} className="profile-hero-pic" />
        <div>
          <h1>{user.displayName}</h1>
          <p>{user.email}</p>
          <button className="logout-btn" onClick={() => { logout(); navigate("/"); }}>
            🚪 Sign Out
          </button>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <span>{watchlist.length}</span>
          <label>Watchlist</label>
        </div>
        <div className="stat-card">
          <span>{history.length}</span>
          <label>Searches</label>
        </div>
      </div>

      <section>
        <div className="section-header">
          <h2>❤️ Watchlist</h2>
          <button onClick={() => navigate("/watchlist")}>View All</button>
        </div>
        {watchlist.length === 0 && <p className="no-data">Nothing saved yet.</p>}
        <div className="profile-grid">
          {watchlist.slice(0, 6).map((item) => (
            <div
              key={item.id}
              className="profile-grid-card"
              onClick={() => navigate(`/${item.media_type === "tv" ? "tv" : "movie"}/${item.id}`)}
            >
              <img src={item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : "https://via.placeholder.com/120x180"} alt={item.title || item.name} />
              <p>{item.title || item.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="section-header">
          <h2>🕐 Search History</h2>
          {history.length > 0 && <button onClick={clearHistory}>Clear</button>}
        </div>
        {history.length === 0 && <p className="no-data">No recent searches.</p>}
        <div className="history-tags">
          {history.map((q) => (
            <button key={q} className="history-tag" onClick={() => navigate(`/?q=${encodeURIComponent(q)}`)}>
              🔍 {q}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
