import axios from "axios";

// Use environment variable for production, fallback to localhost for development
// Ensure /api is appended for production URL
const getBaseURL = () => {
  const envURL = import.meta.env.VITE_API_URL || import.meta.env.API_URL;
  if (envURL) {
    return `${envURL}/api`;
  }
  return "http://localhost:5000/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
