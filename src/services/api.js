import axios from "axios";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export const searchMovies = async (query, signal) => {
  const res = await axios.get(`${BASE_URL}/search/multi`, {
    params: { api_key: API_KEY, query },
    signal,
  });
  return res.data.results;
};

export const getMovieDetails = async (id, type, signal) => {
  const res = await axios.get(`${BASE_URL}/${type}/${id}`, {
    params: { api_key: API_KEY },
    signal,
  });
  return res.data;
};

export const getMovieCast = async (id, type, signal) => {
  const res = await axios.get(`${BASE_URL}/${type}/${id}/credits`, {
    params: { api_key: API_KEY },
    signal,
  });
  return res.data.cast;
};

export const getTrending = async (signal) => {
  const res = await axios.get(`${BASE_URL}/trending/all/day`, {
    params: { api_key: API_KEY },
    signal,
  });
  return res.data.results;
};

export const getVideos = async (id, type, signal) => {
  const res = await axios.get(`${BASE_URL}/${type}/${id}/videos`, {
    params: { api_key: API_KEY },
    signal,
  });
  const results = res.data.results;
  const trailer =
    results.find((v) => v.type === "Trailer" && v.site === "YouTube") ||
    results.find((v) => v.site === "YouTube");
  return trailer ? trailer.key : null;
};

export const getPersonDetails = async (personId, signal) => {
  const [details, credits] = await Promise.all([
    axios.get(`${BASE_URL}/person/${personId}`, {
      params: { api_key: API_KEY },
      signal,
    }),
    axios.get(`${BASE_URL}/person/${personId}/combined_credits`, {
      params: { api_key: API_KEY },
      signal,
    }),
  ]);
  return { ...details.data, credits: credits.data };
};

export const getGenres = async (type = "movie") => {
  const res = await axios.get(`${BASE_URL}/genre/${type}/list`, {
    params: { api_key: API_KEY },
  });
  return res.data.genres;
};

// Fetches all available regions from TMDB
export const getRegions = async () => {
  const res = await axios.get(`${BASE_URL}/configuration/countries`, {
    params: { api_key: API_KEY },
  });
  // Returns [{ iso_3166_1: "US", english_name: "United States", native_name: "..." }, ...]
  return res.data
    .map((c) => ({ code: c.iso_3166_1, name: c.english_name }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const discoverMovies = async ({
  type = "movie",
  genre = "",
  region = "",
  topRated = false,
  page = 1,
} = {}) => {
  const mediaType = type === "tv" ? "tv" : "movie";

  // Map region code to language code for better coverage
  const regionToLanguage = {
    TH: "th",
    KR: "ko",
    JP: "ja",
    CN: "zh",
    IN: "hi",
    FR: "fr",
    ES: "es",
    PH: "tl",
  };

  const language = region ? regionToLanguage[region] : undefined;

  const params = {
    api_key: API_KEY,
    page,
    with_genres: genre ? String(genre) : undefined,
    sort_by: topRated ? "vote_average.desc" : "popularity.desc",
    "vote_count.gte": topRated ? 200 : 10,
  };

  // Use language-based filtering instead of strict origin country
  // This gives far more results (e.g. Thai language content vs Thai production only)
  if (region) {
    params.with_original_language = language || undefined;
    // Also keep origin country as a secondary hint but don't rely on it alone
    if (!language) params.with_origin_country = region;
  }

  const res = await axios.get(`${BASE_URL}/discover/${mediaType}`, { params });

  return {
    results: res.data.results,
    total_pages: Math.min(res.data.total_pages, 500),
    total_results: res.data.total_results,
  };
};