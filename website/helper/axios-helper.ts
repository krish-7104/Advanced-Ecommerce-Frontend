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

    // Skip interceptor for auth endpoints except about/me
    if (
      originalRequest.url?.includes("/auth") &&
      !originalRequest.url?.includes("/auth/about/me")
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await apiHelper.get("/auth/refresh");
        return apiHelper(originalRequest);
      } catch {
        // Dynamically import store and action to prevent circular dependency at initial module evaluation
        const { store } = await import("../redux/store");
        const { logout } = await import("../redux/slices/user.slice");
        store.dispatch(logout());

        // Return original error, not refresh error
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default apiHelper;
