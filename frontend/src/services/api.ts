import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

export const TOKEN_KEY = "rb_token";

export const getStoredToken = () =>
  typeof window !== "undefined" ? Cookies.get(TOKEN_KEY) : undefined;

export const storeToken = (token: string) =>
  Cookies.set(TOKEN_KEY, token, {
    expires: 7,
    sameSite: "strict",
    // secure only in production (localhost doesn't support HTTPS)
    secure: process.env.NODE_ENV === "production",
  });

export const clearToken = () => Cookies.remove(TOKEN_KEY);

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  timeout: 12_000,
  headers: { "Content-Type": "application/json" },
});

// Attach token on every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 → redirect to login
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      clearToken();
      if (typeof window !== "undefined") window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;