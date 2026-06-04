import { useNavigate } from "react-router-dom";

export default function CastCard({ actor }) {
  const navigate = useNavigate();

  return (
    <div className="cast-card" onClick={() => navigate(`/person/${actor.id}`)}>
      <div className="cast-img-wrap">
        <img
          src={
            actor.profile_path
              ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
              : "https://via.placeholder.com/100x150?text=?"
          }
          alt={actor.name}
        />
        <div className="cast-hover-overlay">
          <span>View Profile</span>
        </div>
      </div>
      <h4>{actor.name}</h4>
      <p>{actor.character}</p>
    </div>
  );
}
