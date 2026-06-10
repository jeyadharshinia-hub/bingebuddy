import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getCastRatingStats, getMyRating, rateCast } from "../services/apiClient";

const STARS = [1, 2, 3, 4, 5];

export default function CastCard({ actor, onNeedLogin }) {
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const [stats,       setStats]       = useState({ avgRating: 0, totalVotes: 0 });
  const [myRating,    setMyRating]    = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting,  setSubmitting]  = useState(false);

  useEffect(() => {
    getCastRatingStats(actor.id)
      .then(setStats)
      .catch(() => {});

    if (user) {
      getMyRating(actor.id)
        .then((d) => setMyRating(d.rating || 0))
        .catch(() => {});
    }
  }, [actor.id, user]);

  const handleRate = async (star) => {
    if (!user) { onNeedLogin(); return; }
    if (submitting) return;
    setSubmitting(true);
    try {
      const updated = await rateCast(
        actor.id, star,
        actor.name,
        actor.profile_path
          ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
          : ""
      );
      setMyRating(star);
      setStats({ avgRating: updated.avgRating, totalVotes: updated.totalVotes });
    } catch (err) {
      console.error("Rating failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const rankLabel = (avg) => {
    if (avg >= 4.5) return {  color: "#f59e0b" };
    if (avg >= 4.0) return {     color: "#22c55e" };
    if (avg >= 3.5) return {         color: "#3b82f6" };
    if (avg >= 3.0) return {       color: "#8b5cf6" };
    if (avg >= 2.0) return {     color: "#6b7280" };
    return               { color: "#4b5563" };
  };

  const rank = rankLabel(stats.avgRating);

  return (
    <div className="cast-card">
      {/* Photo — click to view profile */}
      <div
        className="cast-img-wrap"
        onClick={() => navigate(`/person/${actor.id}`)}
        style={{ cursor: "pointer" }}
      >
        <img
          src={
            actor.profile_path
              ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
              : "https://via.placeholder.com/100x150?text=?"
          }
          alt={actor.name}
          className="cast-img"
          loading="lazy"
        />
        <div className="cast-hover-overlay">
          
        </div>
      </div>

      {/* Info */}
      <div className="cast-card-body">
        <h4>{actor.name}</h4>
        <p className="cast-character">{actor.character || "—"}</p>

        {/* Average rating display */}
        {stats.totalVotes > 0 && (
          <div className="cast-rating-display">
            <span
              className="cast-rank-label"
              style={{ color: rank.color }}
            >
              {rank.label}
            </span>
            <span className="cast-avg-score">
              {stats.avgRating.toFixed(1)} / 5
            </span>
            <span className="cast-vote-count">
              {stats.totalVotes} {stats.totalVotes === 1 ? "vote" : "votes"}
            </span>
          </div>
        )}

        {/* Star rating input */}
        <div className="cast-star-row">
          {STARS.map((s) => (
            <button
              key={s}
              className={`cast-star-btn ${s <= (hoverRating || myRating) ? "active" : ""}`}
              onMouseEnter={() => setHoverRating(s)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => handleRate(s)}
              disabled={submitting}
              aria-label={`Rate ${s} stars`}
            >★</button>
          ))}
        </div>
        {!user && (
          <p className="cast-signin-note">
            <button className="inline-link" onClick={onNeedLogin}>Sign in</button> to rate
          </p>
        )}
      </div>
    </div>
  );
}