import { useState } from "react";
import SearchBar from "./components/SearchBar";
import { searchMovies } from "./services/api";

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

      <div>
        {results.map((item) => (
          <div key={item.id}>
            <h3>{item.title || item.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;