function MovieCard({ item, onSelect, isInWatchlist, onWatchlist }) {
  const imageUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : "https://via.placeholder.com/300x450?text=No+Image";

  const handleWatchlist = async (e) => {
    e.stopPropagation(); // prevent card click navigating to detail page
    await onWatchlist(item); // must await — toggleWatchlist is async
  };

  return (
    <div className="movie-card" onClick={() => onSelect(item)}>
      <img src={imageUrl} alt={item.title || item.name} loading="lazy" />
      <h3>{item.title || item.name}</h3>
      <p>⭐ {item.vote_average?.toFixed(1)}</p>
      <button
        className={`watchlist-btn ${isInWatchlist ? "in-watchlist" : ""}`}
        onClick={handleWatchlist}
      >
        <span>{isInWatchlist ? "❤️" : "🤍"}</span>
        <span>{isInWatchlist ? "Saved" : "Add to Watchlist"}</span>
      </button>
    </div>
  );
}

export default MovieCard;
