import { useState } from "react";
import SearchBar from "./components/SearchBar";
import { searchMovies } from "./services/api";
import MovieCard from "./components/MovieCard";
function App() {
  const [results, setResults] = useState([]);

  const handleSearch = async (query) => {
    try {
      const data = await searchMovies(query);
      setResults(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>BingeBuddy</h1>

      <SearchBar onSearch={handleSearch} />

      <div className="movies-grid">
        {results.map((item) => (
          <MovieCard
            key={item.id}
            item={item}
          />
        ))}
      </div>
    </div>
  );
}

export default App;