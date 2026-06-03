import axios from "axios";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export const searchMovies = async (query) => {
  const res = await axios.get(`${BASE_URL}/search/multi`, {
    params: {
      api_key: API_KEY,
      query,
    },
  });

  return res.data.results;
};

export const getMovieDetails = async (id, type) => {
  const res = await axios.get(
    `${BASE_URL}/${type}/${id}`,
    {
      params: {
        api_key: API_KEY,
      },
    }
  );

  return res.data;
};

export const getMovieCast = async (id, type) => {
  const res = await axios.get(
    `${BASE_URL}/${type}/${id}/credits`,
    {
      params: {
        api_key: API_KEY,
      },
    }
  );

  return res.data.cast;
};
export const getTrending = async () => {
  const res = await axios.get(
    `${BASE_URL}/trending/all/day`,
    {
      params: {
        api_key: API_KEY,
      },
    }
  );

  return res.data.results;
};
