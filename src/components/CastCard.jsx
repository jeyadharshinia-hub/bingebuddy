import { useNavigate } from "react-router-dom";

export default function CastCard({
  actor
}) {



  const navigate = useNavigate();

  return (
    <div className="cast-card" onClick={() => navigate(`/person/${actor.id}`)}>
      <img
        src={
          actor.profile_path
            ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
            : "https://via.placeholder.com/100x150?text=?"
        }
        alt={actor.name}
        className="cast-img"
      />
      <h4>{actor.name}</h4>
      <p>{actor.character}</p>

      
    </div>
  );
}