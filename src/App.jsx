import SearchBar from "./components/SearchBar";
import MovieCard from "./components/MovieCard";
import Navbar from "./components/Navbar";
import useDebounce from "./hooks/useDebounce";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import { searchMovies, getMovieDetails, getMovieCast, getTrending } from "./services/api";
import { useState, useEffect } from "react";

/* ─── Main App ────────────────────────────────────────────── */
function App() {
  const [isLoggedIn] = useState(false);
  const [heroMovie, setHeroMovie] = useState(null);
  const [results, setResults] = useState([]);
  const [trending, setTrending] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const debouncedQuery = useDebounce(searchText, 500);
  const navigate = useNavigate();

  // Fetch trending on mount
  useEffect(() => {
    const fetchTrending = async () => {
      const data = await getTrending();
      setTrending(data);
      if (data.length > 0) setHeroMovie(data[0]);
    };
    fetchTrending();
  }, []);

  // Fetch search suggestions (debounced)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const data = await searchMovies(debouncedQuery);
        setSuggestions(data.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    };
    fetchSuggestions();
  }, [debouncedQuery]);

  // Full search on submit
  const handleSearch = async (query) => {
    if (query.trim().length < 3) return;
    setHasSearched(true);
    try {
      const data = await searchMovies(query);

      // FIX: Normalize media_type — if missing, default to "movie"
      // Filter out people (person type) — only keep movies and TV shows
      const filtered = data
        .map((item) => ({
          ...item,
          media_type: item.media_type || "movie", // fallback if endpoint doesn't return it
        }))
        .filter((item) => item.media_type === "movie" || item.media_type === "tv");

      setResults(filtered);
    } catch (error) {
      console.error(error);
    }
  };

  // FIX: Always derive type safely before navigating
  const handleSelect = (item) => {
    const type = item.media_type === "tv" ? "tv" : "movie";
    navigate(`/${type}/${item.id}`);
  };

  return (
    <div className="container">
      <Navbar />
      <h1 className="logo">
        Binge<span>Buddy</span>
      </h1>

      <Routes>
        {/* ── Home ── */}
        <Route
          path="/"
          element={
            <>
              <SearchBar
                onSearch={handleSearch}
                setSearchText={setSearchText}
                suggestions={suggestions}
                setSuggestions={setSuggestions}
              />

              {/* HERO — only before first search */}
              {!hasSearched && heroMovie && (
                <div
                  className="hero-banner"
                  style={{
                    backgroundImage: heroMovie.backdrop_path
                      ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)),
                         url(https://image.tmdb.org/t/p/original${heroMovie.backdrop_path})`
                      : "none",
                  }}
                >
                  <div className="hero-content">
                    <h1>{heroMovie.title || heroMovie.name}</h1>
                    <p>⭐ {heroMovie.vote_average?.toFixed(1)}</p>
                    <p>{heroMovie.overview}</p>
                    <button
                      className="hero-btn"
                      onClick={() => handleSelect(heroMovie)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              )}

              {/* TRENDING */}
              {!hasSearched && (
                <>
                  <h2>🔥 Trending Today</h2>
                  <div className="movies-grid">
                    {trending.map((item) => (
                      <MovieCard
                        key={item.id}
                        item={item}
                        onSelect={handleSelect}
                        isLoggedIn={isLoggedIn}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* SEARCH RESULTS */}
              {hasSearched && (
                <>
                  <h2>🔎 Search Results</h2>
                  {results.length === 0 ? (
                    <p style={{ color: "gray" }}>No results found</p>
                  ) : (
                    <div className="movies-grid">
                      {results.map((item) => (
                        <MovieCard
                          key={item.id}
                          item={item}
                          onSelect={handleSelect}  // clicking navigates to detail page
                          isLoggedIn={isLoggedIn}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          }
        />

        {/* ── Movie Detail Page ── */}
        <Route
          path="/movie/:id"
          element={
            <MovieDetailsPage
              getMovieDetails={getMovieDetails}
              getMovieCast={getMovieCast}
              type="movie"
            />
          }
        />

        {/* ── TV Detail Page ── */}
        <Route
          path="/tv/:id"
          element={
            <MovieDetailsPage
              getMovieDetails={getMovieDetails}
              getMovieCast={getMovieCast}
              type="tv"
            />
          }
        />
      </Routes>
    </div>
  );
}

/* ─── Movie / TV Details Page ────────────────────────────── */
function MovieDetailsPage({ getMovieDetails, getMovieCast, type }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);
  const [cast, setCast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(false);

      const details = await getMovieDetails(id, type);
      const castData = await getMovieCast(id, type);

      setSelectedItem(details);
      setCast(castData.slice(0, 8));
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  fetchDetails();
}, [id, type]); // ✅ VERY IMPORTANT

  if (loading) return <p className="loading">Loading details...</p>;
  if (error || !selectedItem) return <p style={{ color: "gray" }}>Could not load details.</p>;

  return (
    <div className="details-section">
      {/* Back button — returns to previous page (search results) */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="details-content">
        <img
          src={`https://image.tmdb.org/t/p/w500${selectedItem.poster_path}`}
          alt={selectedItem.title || selectedItem.name}
        />
        <div>
          <h2>{selectedItem.title || selectedItem.name}</h2>
          <p>⭐ {selectedItem.vote_average?.toFixed(1)}</p>
          <p>📅 {selectedItem.release_date || selectedItem.first_air_date}</p>
          <p>🎭 {selectedItem.genres?.map((g) => g.name).join(", ")}</p>
          <p>{selectedItem.overview}</p>
        </div>
      </div>

      {/* CAST */}
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
  );
}

/* ─── Comment Box ─────────────────────────────────────────── */
function CommentBox() {
  const [text, setText] = useState("");
  const [comments, setComments] = useState([]);

  const addComment = () => {
    if (!text.trim()) return;
    setComments([...comments, { text, time: new Date().toLocaleTimeString() }]);
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
