import axios from "axios";
import { BASE_API_URL } from "./api-helper";

const apiHelper = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true,
});

const ignorePath = ["/auth"];

apiHelper.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      ignorePath.includes(originalRequest.url) &&
      !ignorePath.includes("/auth/about/me")
    ) {
      return Promise.reject(error);
    }

    if (
      error.response?.status >= 400 &&
      error.response?.status < 500 &&
      originalRequest.url?.includes("/auth/refresh")
    ) {
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Handle normal API 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await apiHelper.get("/auth/refresh");
        return apiHelper(originalRequest);
      } catch {
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default apiHelper;
