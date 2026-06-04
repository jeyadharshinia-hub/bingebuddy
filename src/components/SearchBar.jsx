import { useState } from "react";

function SearchBar({ setSearchText, suggestions, setSuggestions, onSearch }) {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSearchText(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query);
  };

  const handleSelect = (movie) => {
    const name = movie.title || movie.name;

    setQuery(name);
    setSearchText(name);
    setSuggestions([]);
    onSearch(name);
  };

  return (
    <div className="search-wrapper">
      <form onSubmit={handleSubmit} className="search-container">
        <input
          value={query}
          onChange={handleChange}
          placeholder="Search movies..."
        />
        <button>Search</button>
      </form>

      {suggestions?.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((movie) => (
            <li key={movie.id} onClick={() => handleSelect(movie)}>
              {movie.title || movie.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;