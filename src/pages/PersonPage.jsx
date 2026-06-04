import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPersonDetails } from "../services/api";

export default function PersonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPersonDetails(id)
      .then(setPerson)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="loading">Loading cast profile...</p>;
  if (!person) return <p className="loading">Could not load profile.</p>;

  const knownFor = person.credits?.cast
    ?.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
    .slice(0, 12) || [];

  return (
    <div className="person-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

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
          {person.birthday && (
            <p>🎂 Born: {new Date(person.birthday).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              {person.place_of_birth && ` • ${person.place_of_birth}`}
            </p>
          )}
          {person.known_for_department && <p>🎭 Known for: {person.known_for_department}</p>}
          {person.biography && (
            <p className="person-bio">{person.biography.slice(0, 400)}{person.biography.length > 400 ? "..." : ""}</p>
          )}
        </div>
      </div>

      <div className="person-works">
        <h2>🎬 Known Works</h2>
        <div className="person-works-grid">
          {knownFor.map((work) => (
            <div
              key={work.id}
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
              {work.character && <small as="{work.character}">{work.character}</small>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
