import { useState } from "react";
import { searchMovies } from "../services/api";

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query);
    setSuggestions([]);
  };

  const handleChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const data = await searchMovies(value);

      const filtered = data
        .filter((item) => item.poster_path)
        .slice(0, 6);

      setSuggestions(filtered);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelect = (movie) => {
    const name = movie.title || movie.name;
    setQuery(name);
    setSuggestions([]);
    onSearch(name);
  };

 return (
  <div className="search-container">
    <form onSubmit={handleSubmit}>
      
      <div className="search-wrapper">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search movies, series..."
        />

        {suggestions.length > 0 && (
          <ul className="suggestions">
            {suggestions.map((movie) => (
              <li
                key={movie.id}
                onClick={() => {
                  setQuery(movie.title || movie.name);
                  setSuggestions([]);
                  onSearch(movie.title || movie.name);
                }}
              >
                {movie.title || movie.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button>Search</button>
    </form>
  </div>
);
}

export default SearchBar;