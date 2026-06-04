import { useState, useEffect } from "react";
import { discoverMovies, getGenres } from "../services/api";
import MovieCard from "../components/MovieCard";

export default function DiscoverPage() {
    const [movies, setMovies] = useState([]);
    const [genres, setGenres] = useState([]);

    const [filters, setFilters] = useState({
        type: "movie",
        genre: "",
        region: "",
        topRated: false,

    });

    useEffect(() => {
        getGenres("movie")
            .then(setGenres)
            .catch(console.error);
    }, []);


    useEffect(() => {
        const loadMovies = async () => {
            try {
                let data = await discoverMovies(filters);

                // 🎯 STRICT genre filter (important fix)
                if (filters.genre) {
                    data = data.filter(movie =>
                        movie.genre_ids?.includes(Number(filters.genre))
                    );
                }

                setMovies(data);
            } catch (error) {
                console.error(error);
            }
        };

        loadMovies();
    }, [filters]);

    return (
        <div className="discover-page">

            {/* FILTER PANEL */}

            <div className="discover-filter">

                <h2>🎯 Discover Content</h2>

                {/* TYPE */}

                <h4>Content Type</h4>

                <div className="filter-chips">
                    <button
                        className={filters.region === "" ? "active-chip" : ""}
                        onClick={() =>
                            setFilters({
                                ...filters,
                                region: "",
                            })
                        }
                    >
                        🌍 All
                    </button>
                    <button
                        className={
                            filters.type === "movie"
                                ? "active-chip"
                                : ""
                        }
                        onClick={() =>
                            setFilters({
                                ...filters,
                                type: "movie",
                            })
                        }
                    >
                        🎬 Movies
                    </button>

                    <button
                        className={
                            filters.type === "tv"
                                ? "active-chip"
                                : ""
                        }
                        onClick={() =>
                            setFilters({
                                ...filters,
                                type: "tv",
                            })
                        }
                    >
                        📺 TV Series
                    </button>
                </div>


                <h4>📍 Region</h4>

                <div className="filter-chips">
                    {[
                        { code: "US", name: "USA" },
                        { code: "IN", name: "India" },
                        { code: "KR", name: "Korea" },
                        { code: "JP", name: "Japan" },
                        { code: "CN", name: "China" },
                        { code: "TH", name: "Thailand" },
                        { code: "PH", name: "Philippines" },
                        { code: "GB", name: "UK" },
                        { code: "FR", name: "France" }
                    ].map((region) => (
                        <button
                            key={region.code}
                            className={
                                filters.region === region.code
                                    ? "active-chip"
                                    : ""
                            }
                            onClick={() =>
                                setFilters({
                                    ...filters,
                                    region:
                                        filters.region === region.code
                                            ? ""
                                            : region.code,
                                })
                            }
                        >
                            {region.name}
                        </button>
                    ))}
                </div>
                {/* GENRE */}

                <h4>🎭 Genre</h4>

                <div className="filter-chips">

                    {genres.map((g) => (
                        <button
                            key={g.id}
                            className={
                                filters.genre === g.id
                                    ? "active-chip"
                                    : ""
                            }
                            onClick={() =>
                                setFilters({
                                    ...filters,
                                    genre:
                                        filters.genre === g.id
                                            ? ""
                                            : g.id,
                                })
                            }
                        >
                            {g.name}
                        </button>
                    ))}
                    <button
                        className={
                            filters.genre === "lgbtq"
                                ? "active-chip"
                                : ""
                        }
                        onClick={() =>
                            setFilters({
                                ...filters,
                                genre:
                                    filters.genre === "lgbtq"
                                        ? ""
                                        : "lgbtq",
                            })
                        }
                    >
                        LGBTQ+
                    </button>

                </div>

                {/* EXTRA FILTERS */}

                <h4>📊 Status</h4>

                <div className="filter-chips">

                    <button
                        className={filters.topRated ? "active-chip" : ""}
                        onClick={() =>
                            setFilters({
                                ...filters,
                                topRated: !filters.topRated
                            })
                        }
                    >
                        ⭐ Top Rated
                    </button>

                </div>
                <br />


                <br />
                <br />

                <button
                    className="clear-filter-btn"
                    onClick={() =>
                        setFilters({
                            type: "movie",
                            genre: "",
                            region: "",

                        })
                    }
                >
                    Clear Filters
                </button>

            </div>

            {/* RESULTS */}

            <div className="discover-results">

                <h2>
                    Showing {movies.length} Results
                </h2>

                <div className="movies-grid">
                    {movies.map((movie) => (
                        <MovieCard
                            key={movie.id}
                            item={movie}
                        />
                    ))}
                </div>

            </div>

        </div >
    );
}