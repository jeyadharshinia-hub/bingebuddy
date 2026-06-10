import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCastLeaderboard } from "../services/apiClient";

const MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function CastLeaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getCastLeaderboard()
      .then(setLeaders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="loading">Loading leaderboard...</p>;

  return (
    <div className="leaderboard-page">
      <h1>Cast Leaderboard</h1>
      <p className="leaderboard-sub">
        Ranked by viewer ratings · Updated in real time
      </p>

      {leaders.length === 0 && (
        <p className="no-data">No ratings yet. Be the first to rate a cast member!</p>
      )}

      <div className="leaderboard-list">
        {leaders.map((actor) => (
          <div
            key={actor.actorId}
            className="leaderboard-item"
            onClick={() => navigate(`/person/${actor.actorId}`)}
          >
            <div className="leaderboard-rank">
              {MEDALS[actor.rank] || `#${actor.rank}`}
            </div>

            <img
              src={actor.actorPhoto || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
              alt={actor.actorName}
              className="leaderboard-photo"
            />

            <div className="leaderboard-info">
              <strong>{actor.actorName}</strong>
              <small>{actor.totalVotes} {actor.totalVotes === 1 ? "vote" : "votes"}</small>
            </div>

            <div className="leaderboard-score">
              <span className="leaderboard-avg">{actor.avgRating.toFixed(1)}</span>
              <div className="leaderboard-stars">
                {[1,2,3,4,5].map((s) => (
                  <span
                    key={s}
                    className={s <= Math.round(actor.avgRating) ? "star-filled" : "star-empty"}
                  >★</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}