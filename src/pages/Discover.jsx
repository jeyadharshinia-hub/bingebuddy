import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";
import { discoverMovies } from "../services/api";

function Discover() {
  const [movies, setMovies] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const language = params.get("language");
    const genre = params.get("genre");
    const type = params.get("type");

    discoverMovies({
      language,
      genre,
      type,
    }).then(setMovies);
  }, [location.search]);

  return (
    <div className="container">
      <h2>🎬 Discover Results</h2>

      <div className="movies-grid">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            item={movie}
          />
        ))}
      </div>
    </div>
  );
}

export default Discover;