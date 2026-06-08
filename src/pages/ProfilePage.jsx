import { useState, useEffect, useContext } from "react";
import { useAuth } from "../hooks/useAuth";
import { useWatchlist } from "../hooks/useWatchlist";
import useSearchHistory from "../hooks/useSearchHistory";
import { useActivity } from "../hooks/useActivity";
import { CommentContext } from "../context/CommentContext";
import { useNavigate } from "react-router-dom";

const FALLBACK_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

export default function ProfilePage({ onNeedLogin }) {
  const { user, logout }          = useAuth();
  const { watchlist }             = useWatchlist();
  const { history, clearHistory } = useSearchHistory();
  const { activities: localActivities } = useActivity();
  const { getMyActivity }         = useContext(CommentContext);
  const navigate                  = useNavigate();

  const [activeTab,       setActiveTab]       = useState("watchlist");
  const [allActivities,   setAllActivities]   = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // ALL hooks must be called before any conditional return
  useEffect(() => {
  if (!user) return;

  const timer = setTimeout(() => {
    setActivityLoading(true);
    getMyActivity()
      .then((apiComments) => {
        const merged = [...apiComments, ...localActivities]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAllActivities(merged);
      })
      .catch(() => setAllActivities(localActivities))
      .finally(() => setActivityLoading(false));
  }, 0);

  return () => clearTimeout(timer);
}, [user]);
  // Conditional return AFTER all hooks
  if (!user) {
    return (
      <div className="profile-page empty">
        <h2>👤 Sign in to view your profile</h2>
        <button className="hero-btn primary" onClick={onNeedLogin}>
          Sign In
        </button>
      </div>
    );
  }

  const fmt = (iso) => {
    try {
      return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      });
    } catch { return iso; }
  };

  return (
    <div className="profile-page">

      {/* Header */}
      <div className="profile-hero">
        <img
          src={user.photoURL || FALLBACK_AVATAR}
          alt={user.displayName}
          className="profile-hero-pic"
        />
        <div>
          <h1>{user.displayName}</h1>
          <p>{user.email}</p>
          <button
            className="logout-btn"
            onClick={() => { logout(); navigate("/"); }}
          >
            🚪 Sign Out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="profile-stats">
        <div className="stat-card">
          <span>{watchlist.length}</span>
          <label>Watchlist</label>
        </div>
        <div className="stat-card">
          <span>{allActivities.length}</span>
          <label>Activities</label>
        </div>
        <div className="stat-card">
          <span>{history.length}</span>
          <label>Searches</label>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        {["watchlist", "activity", "history"].map((tab) => (
          <button
            key={tab}
            className={`profile-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "watchlist" ? "❤️ Watchlist"
              : tab === "activity" ? "📈 Activity"
              : "🔍 History"}
          </button>
        ))}
      </div>

      {/* Watchlist Tab */}
      {activeTab === "watchlist" && (
        <section>
          <div className="section-header">
            <h2>❤️ Saved Titles ({watchlist.length})</h2>
            {watchlist.length > 0 && (
              <button onClick={() => navigate("/watchlist")}>View All →</button>
            )}
          </div>
          {watchlist.length === 0 && (
            <p className="no-data">Nothing saved yet. Browse and add titles!</p>
          )}
          <div className="profile-grid">
            {watchlist.slice(0, 12).map((item) => (
              <div
                key={item.id}
                className="profile-grid-card"
                onClick={() =>
                  // Java API returns mediaType and tmdbId — not media_type and id
                  navigate(`/${item.mediaType === "tv" ? "tv" : "movie"}/${item.tmdbId}`)
                }
              >
                <img
                  src={
                    item.posterPath
                      ? `https://image.tmdb.org/t/p/w200${item.posterPath}`
                      : "https://via.placeholder.com/120x180"
                  }
                  alt={item.title}
                />
                <p>{item.title}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Activity Tab */}
      {activeTab === "activity" && (
        <section>
          <h2>📈 Recent Activity</h2>
          {activityLoading && <p className="loading">Loading activity...</p>}
          {!activityLoading && allActivities.length === 0 && (
            <p className="no-data">No activity yet.</p>
          )}
          <div className="activity-list">
            {allActivities.slice(0, 20).map((activity) => (
              <div
                key={activity.id}
                className="activity-item"
                onClick={() => {
                  // API comments have mediaId like "tv-1234"
                  if (activity.mediaId) {
                    const parts = activity.mediaId.split("-");
                    const type  = parts[0];
                    const id    = parts.slice(1).join("-");
                    navigate(`/${type}/${id}`);
                  }
                }}
              >
                <div className="activity-meta">
                  {activity.mediaTitle && (
                    <strong className="activity-title">{activity.mediaTitle}</strong>
                  )}
                  {activity.rating > 0 && (
                    <span className="comment-stars">
                      {"★".repeat(activity.rating)}{"☆".repeat(5 - activity.rating)}
                    </span>
                  )}
                  <small>{fmt(activity.createdAt)}</small>
                </div>
                <p className="activity-text">
                  {activity.text || activity.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <section>
          <div className="section-header">
            <h2>🔍 Search History</h2>
            {history.length > 0 && (
              <button onClick={clearHistory}>Clear All</button>
            )}
          </div>
          {history.length === 0 && (
            <p className="no-data">No recent searches.</p>
          )}
          <div className="history-tags">
            {history.map((q) => (
              <button
                key={q}
                className="history-tag"
                onClick={() => navigate(`/?q=${encodeURIComponent(q)}`)}
              >
                🔍 {q}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}