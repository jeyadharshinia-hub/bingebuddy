import { useState } from "react";

function SearchBar({ onSearch, setSearchText, suggestions, setSuggestions }) {
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

      {/* ✅ Suggestions dropdown */}
      {suggestions?.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((movie) => (
            <li
              key={movie.id}
              onClick={() => {
                const name = movie.title || movie.name;

                setQuery(name);
                setSearchText(name);

                setSuggestions([]);   // close dropdown

                onSearch(name);       // 🔥 THIS is the missing part
              }}
            >
              {movie.title || movie.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;