import { useState } from "react";
import SearchBar from "./components/SearchBar";
import MovieCard from "./components/MovieCard";
import {
  searchMovies,
  getMovieDetails,
  getMovieCast,
} from "./services/api";

function App() {
  const [results, setResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [cast, setCast] = useState([]);

  const handleSearch = async (query) => {
    try {
      const data = await searchMovies(query);
      setResults(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelect = async (item) => {
    const type = item.media_type === "tv" ? "tv" : "movie";

    try {
      const details = await getMovieDetails(item.id, type);
      const castData = await getMovieCast(item.id, type);

      setSelectedItem(details);
      setCast(castData.slice(0, 8));
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="container">
      <h1 className="logo">
        Binge<span>Buddy</span>
      </h1>

      <SearchBar onSearch={handleSearch} />

      <div className="movies-grid">
        {results.map((item) => (
          <MovieCard
            key={item.id}
            item={item}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {selectedItem && (
        <div className="details-section">

          <div className="details-content">
            <img
              src={`https://image.tmdb.org/t/p/w500${selectedItem.poster_path}`}
              alt={selectedItem.title || selectedItem.name}
            />

            <div>
              <h2>{selectedItem.title || selectedItem.name}</h2>

              <p>
                ⭐ {selectedItem.vote_average?.toFixed(1)}
              </p>

              <p>
                📅 {selectedItem.release_date || selectedItem.first_air_date}
              </p>

              <p>
                🎭 {selectedItem.genres?.map((g) => g.name).join(", ")}
              </p>

              <p>{selectedItem.overview}</p>
            </div>
          </div>

          <div className="cast-section">
            <h3>🎭 Cast</h3>

            <div className="cast-grid">
              {cast.map((actor) => (
                <div className="cast-card" key={actor.id}>
                  <img
                    src={
                      actor.profile_path
                        ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                        : "https://via.placeholder.com/100"
                    }
                    alt={actor.name}
                  />

                  <h4>{actor.name}</h4>
                  <p>{actor.character}</p>
                </div>
              ))}
            </div>
          </div>

          {/* COMMENTS */}
          <div className="comments-section">
            <h3>💬 Comments</h3>
            <CommentBox />
          </div>

        </div>
      )}
    </div>
  );
}

/* COMMENT COMPONENT */
function CommentBox() {
  const [text, setText] = useState("");
  const [comments, setComments] = useState([]);

  const addComment = () => {
    if (!text.trim()) return;

    setComments([
      ...comments,
      { text, time: new Date().toLocaleTimeString() },
    ]);

    setText("");
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "10px" }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
        />
        <button onClick={addComment}>Post</button>
      </div>

      <div style={{ marginTop: "15px" }}>
        {comments.map((c, i) => (
          <p key={i}>
            💬 {c.text} <small>({c.time})</small>
          </p>
        ))}
      </div>
    </div>
  );
}

export default App;