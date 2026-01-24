import axios from "axios";
import { getCookie } from "cookies-next";
import { BASE_URL, COOKIE_TOKEN_KEY } from "./constants";

// Create an Axios instance with custom configuration
const Api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds
  headers: { "Content-Type": "application/json" },
});

// Request interceptor for adding auth token
Api.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    const token =
      typeof window !== "undefined" ? getCookie(COOKIE_TOKEN_KEY) : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling common errors
Api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors here
    return Promise.reject(error);
  }
);

export default Api;
