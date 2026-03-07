import axios from "axios";
import { BASE_API_URL } from "./api-helper";

const apiHelper = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true,
});

apiHelper.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest.url?.includes("/auth");

    if (isAuthEndpoint) {
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

    const isAboutMe = originalRequest.url?.includes("/auth/about/me");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAboutMe
    ) {
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

    return Promise.reject(error);
  },
);

export default apiHelper;
