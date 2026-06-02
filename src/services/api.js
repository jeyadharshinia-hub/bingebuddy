import axios from "axios";

const API_KEY = "068432504d2b1e6549f88d1645ba0515";

export const searchMovies = async (query) => {
  const response = await axios.get(
    `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${query}`
  );

  return response.data.results;
};