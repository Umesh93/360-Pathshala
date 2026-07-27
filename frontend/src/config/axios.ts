import axios from "axios";
import { API_BASE_URL } from "./env";
import { isTokenExpired } from "../utils/jwt";

console.log("[axios] API_BASE_URL =", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("[axios] request", config.method?.toUpperCase(), config.url, "token=", !!token);
  if (token) {
    if (isTokenExpired(token)) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      localStorage.removeItem("userId");
      localStorage.removeItem("schoolId");
      window.location.href = "/";
      return Promise.reject(new Error("Token expired"));
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      localStorage.removeItem("userId");
      localStorage.removeItem("schoolId");
      window.location.href = "/";
    }
    console.error("[axios] response error", error.config?.url, error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
