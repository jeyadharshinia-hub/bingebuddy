import MovieCard from "../components/MovieCard";
function Watchlist() {
  const movies =
    JSON.parse(localStorage.getItem("watchlist")) || [];

  return (
    <div>
      <h2>My Watchlist</h2>

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

export default Watchlist;