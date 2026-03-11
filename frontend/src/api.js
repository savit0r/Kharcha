import axios from "axios";

// Using VITE_API_URL from .env or fallback
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

export default api;
