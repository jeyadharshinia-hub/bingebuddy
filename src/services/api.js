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
  return res.data
    .map((c) => ({ code: c.iso_3166_1, name: c.english_name }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const discoverMovies = async ({
  type = "movie",
  genre = "",
  region = "",
  topRated = false,
  ongoing = false,
  page = 1,
} = {}) => {
  const mediaType = type === "tv" ? "tv" : "movie";
  const params = {
    api_key: API_KEY,
    page,
    sort_by: topRated
      ? "vote_average.desc"
      : "popularity.desc",
  };

  if (topRated) {
    params["vote_count.gte"] = 1000;
    params["vote_average.gte"] = 7;
  }
  // Let TMDB handle genre filtering server-side — no client-side filtering needed
  if (genre) params.with_genres = String(genre);
  if (region) params.with_origin_country = region;

  if (topRated) {
    params["vote_average.gte"] = 7.0;
  }

  // Ongoing: filter to series with a recent first air date and no end date
  if (ongoing && type === "tv") {
    params["first_air_date.gte"] = "2020-01-01";
    params["first_air_date.lte"] = new Date().toISOString().split("T")[0];
    params.with_status = "0|1|2"; // Returning, Planned, In Production
  }

  const res = await axios.get(`${BASE_URL}/discover/${mediaType}`, { params });

  const results = topRated
  ? [...res.data.results].sort(
      (a, b) => b.vote_average - a.vote_average
    )
  : res.data.results;

return {
  results,
  total_pages: Math.min(res.data.total_pages, 500),
  total_results: res.data.total_results,
};
};

export const getWatchProviders = async (id, type) => {
  const res = await axios.get(`${BASE_URL}/${type}/${id}/watch/providers`, {
    params: { api_key: API_KEY },
  });
  const results = res.data.results;
  return results?.IN || results?.US || null;
};

export const getRecommendations = async (id, type) => {
  const res = await axios.get(`${BASE_URL}/${type}/${id}/recommendations`, {
    params: { api_key: API_KEY, page: 1 },
  });
  return res.data.results.slice(0, 12).map((i) => ({
    ...i,
    media_type: type,
  }));
};
