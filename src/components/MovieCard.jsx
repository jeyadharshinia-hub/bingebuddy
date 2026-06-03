function MovieCard({
    item,
    onSelect,
    isLoggedIn
}) {
    const imageUrl = item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : "https://via.placeholder.com/300x450?text=No+Image";

    const handleWatchlist = (e) => {
        e.stopPropagation();

        if (!isLoggedIn) {
            alert("Please login to add movies to Watchlist");
            return;
        }

        const watchlist =
            JSON.parse(localStorage.getItem("watchlist")) || [];

        const exists = watchlist.find(
            (m) => m.id === item.id
        );

        if (exists) {
            alert("Already in Watchlist ❤️");
            return;
        }

        watchlist.push(item);

        localStorage.setItem(
            "watchlist",
            JSON.stringify(watchlist)
        );

        alert("Added to Watchlist ❤️");
    };


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

            <button
                className="watchlist-btn"
                onClick={handleWatchlist}
            >
                <span>🤍</span>
                <span>Add to Watchlist</span>
            </button>
        </div>
    );
}

export default MovieCard;