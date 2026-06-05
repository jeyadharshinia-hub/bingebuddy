import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPersonDetails } from "../services/api";



export default function PersonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullBio, setShowFullBio] = useState(false);

  const [liked, setLiked] = useState(false);

  const [likeCount, setLikeCount] = useState(() => {
    const likes = JSON.parse(localStorage.getItem("castLikes")) || {};
    return likes[id]?.count || 0;
  });





  useEffect(() => {
    let active = true;

    const timer = setTimeout(() => { if (active) setLoading(true); }, 0);

    getPersonDetails(id)
      .then((data) => { if (active) setPerson(data); })
      .catch(console.error)
      .finally(() => {
        if (active) setLoading(false);
        clearTimeout(timer);
      });

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [id]);

  if (loading) return <p className="loading">Loading profile...</p>;
  if (!person) return <p className="loading">Could not load profile.</p>;

  const age = person.birthday
    ? Math.floor((new Date() - new Date(person.birthday)) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const knownFor = person.credits?.cast
    ?.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
    .slice(0, 12) || [];

  const allCredits = person.credits?.cast
    ?.sort((a, b) => {
      const dateA = a.release_date || a.first_air_date || "";
      const dateB = b.release_date || b.first_air_date || "";
      return dateB.localeCompare(dateA);
    }) || [];

  return (
    <div className="person-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      {/* Header */}
      <div className="person-header">
        <img
          src={
            person.profile_path
              ? `https://image.tmdb.org/t/p/w300${person.profile_path}`
              : "https://via.placeholder.com/200x300?text=?"
          }
          alt={person.name}
          className="person-photo"
        />
        <div className="person-info">
          <h1>{person.name}</h1>
          <button
            className={`cast-like-btn ${liked ? "liked" : ""}`}
            onClick={() => {
              const likes = JSON.parse(localStorage.getItem("castLikes")) || {};

              const newLiked = !liked;
              const newCount = newLiked
                ? likeCount + 1
                : Math.max(0, likeCount - 1);

              likes[id] = {
                count: newCount,
                liked: newLiked,
              };

              localStorage.setItem("castLikes", JSON.stringify(likes));

              setLiked(newLiked);
              setLikeCount(newCount);
            }}
          >
            {liked ? "❤️ Liked" : "🤍 Like"} ({likeCount})
          </button>
          <div className="person-meta">
            {person.known_for_department && (
              <span>🎭 {person.known_for_department}</span>
            )}
            {person.gender === 1 && <span>👩 Female</span>}
            {person.gender === 2 && <span>👨 Male</span>}
            {person.popularity && (
              <span>🔥 Popularity: {person.popularity.toFixed(1)}</span>
            )}
          </div>

          {person.birthday && (
            <p>
              🎂 {new Date(person.birthday).toLocaleDateString("en-IN", {
                day: "numeric", month: "long", year: "numeric"
              })}
              {age && ` (age ${age})`}
              {person.deathday && (
                <> — ✝️ {new Date(person.deathday).toLocaleDateString("en-IN", {
                  day: "numeric", month: "long", year: "numeric"
                })}</>
              )}
            </p>
          )}

          {person.place_of_birth && (
            <p>📍 {person.place_of_birth}</p>
          )}

          {person.also_known_as?.length > 0 && (
            <p>🔤 Also known as: {person.also_known_as.slice(0, 3).join(", ")}</p>
          )}

          {person.biography && (
            <div className="person-bio">
              <p>
                {showFullBio
                  ? person.biography
                  : `${person.biography.slice(0, 400)}${person.biography.length > 400 ? "..." : ""}`}
              </p>
              {person.biography.length > 400 && (
                <button
                  className="bio-toggle-btn"
                  onClick={() => setShowFullBio((prev) => !prev)}
                >
                  {showFullBio ? "Show Less" : "Read More"}
                </button>
              )}
            </div>
          )}

          {person.imdb_id && (
            <a
              href={`https://www.imdb.com/name/${person.imdb_id}`}
              target="_blank"
              rel="noreferrer"
              className="imdb-link"
            >
              🎬 View on IMDb
            </a>
          )}
        </div>
      </div>

      {/* Known Works */}
      <div className="person-works">
        <h2>⭐ Best Known For</h2>
        <div className="person-works-grid">
          {knownFor.map((work) => (
            <div
              key={`known-${work.id}-${work.credit_id}`}
              className="person-work-card"
              onClick={() => navigate(`/${work.media_type === "tv" ? "tv" : "movie"}/${work.id}`)}
            >
              <img
                src={
                  work.poster_path
                    ? `https://image.tmdb.org/t/p/w200${work.poster_path}`
                    : "https://via.placeholder.com/120x180?text=?"
                }
                alt={work.title || work.name}
              />
              <p>{work.title || work.name}</p>
              {work.character && <small>{work.character}</small>}
              <small>{(work.release_date || work.first_air_date || "").slice(0, 4)}</small>
            </div>
          ))}
        </div>
      </div>

      {/* Full Filmography */}
      <div className="person-filmography">
        <h2>🎞️ Full Filmography ({allCredits.length})</h2>
        <div className="filmography-list">
          {allCredits.map((work) => (
            <div
              key={`film-${work.id}-${work.credit_id}`}
              className="filmography-item"
              onClick={() => navigate(`/${work.media_type === "tv" ? "tv" : "movie"}/${work.id}`)}
            >
              <img
                src={
                  work.poster_path
                    ? `https://image.tmdb.org/t/p/w92${work.poster_path}`
                    : "https://via.placeholder.com/46x69?text=?"
                }
                alt={work.title || work.name}
              />
              <div>
                <p>{work.title || work.name}</p>
                <small>
                  {work.media_type === "tv" ? "📺 TV" : "🎬 Movie"}
                  {work.character && ` • ${work.character}`}
                  {(work.release_date || work.first_air_date) &&
                    ` • ${(work.release_date || work.first_air_date).slice(0, 4)}`}
                  {work.vote_average > 0 && ` • ⭐ ${work.vote_average.toFixed(1)}`}
                </small>
              </div>
            </div>

          ))}
        </div>
      </div>
    </div>
  );
}