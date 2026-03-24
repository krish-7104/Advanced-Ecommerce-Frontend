import axios from "axios";
import { BASE_API_URL } from "./api-helper";

const apiHelper = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true,
});

apiHelper.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await apiHelper.get("/auth/refresh");

        return apiHelper(error.config); // retry
      } catch {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default apiHelper;
