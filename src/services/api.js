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

export const discoverMovies = async ({
  type = "movie",
  language = "",
  genre = "",
  region = "",
} = {}) => {
  const mediaType = type === "tv" ? "tv" : "movie";

  const res = await axios.get(
    `${BASE_URL}/discover/${mediaType}`,
    {
      params: {
        api_key: API_KEY,
        with_genres: genre,
        with_original_language: language,
        region: region,
      },
    }
  );

  return res.data.results;
};