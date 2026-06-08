import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Call this after login to attach the Firebase token to every request
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
};

export default apiClient;