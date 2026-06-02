import { useState } from "react";
import SearchBar from "./components/SearchBar";
import { searchMovies } from "./services/api";
import MovieCard from "./components/MovieCard";
function App() {
  const [results, setResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const handleSearch = async (query) => {
    try {
      const data = await searchMovies(query);
      setResults(data);
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
            onSelect={setSelectedItem}
          />
        ))}
      </div>
      {selectedItem && (
        <div className="details-section">
          <h2>{selectedItem.title || selectedItem.name}</h2>

          <p>
            Rating: ⭐ {selectedItem.vote_average?.toFixed(1)}
          </p>

          <p>{selectedItem.overview}</p>
        </div>
      )}
    </div>
  );
}

export default App;