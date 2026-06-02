function MovieCard({ item, onSelect }) {
    const imageUrl = item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : "https://via.placeholder.com/300x450?text=No+Image";

    return (
        <div
            className="movie-card"
            onClick={() => onSelect(item)}
        >
            <img
                src={imageUrl}
                alt={item.title || item.name}
            />

            <h3>{item.title || item.name}</h3>

            <p>
                ⭐ {item.vote_average?.toFixed(1)}
            </p>
        </div>
    );
}

export default MovieCard;