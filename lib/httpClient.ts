import axios from "axios";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "@/lib/utils/tokenManager";
import { ENDPOINT } from "@/lib/constants/end-point";

const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
httpClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[HTTP Request] ${config.method?.toUpperCase()} ${config.url}`, config.data || "");
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
httpClient.interceptors.response.use(
  (response) => {
    console.log(`[HTTP Response] ${response.status} ${response.config.url}`, response.data || "");
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    if (status && status < 500) {
      console.warn(`[HTTP ${status}] ${error.response?.data?.message || error.message} for ${originalRequest?.url}`);
    } else {
      console.error(`[HTTP Error] ${status || error.message} for ${originalRequest?.url}`);
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Don't retry if this is the login or refresh endpoint itself
      if (
        originalRequest.url?.includes(ENDPOINT.AUTH.LOGIN) ||
        originalRequest.url?.includes(ENDPOINT.AUTH.PORTAL_LOGIN) ||
        originalRequest.url?.includes(ENDPOINT.AUTH.REFRESH)
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      const refreshToken = getRefreshToken();

      if (refreshToken) {
        try {
          console.log("[HTTP] Attempting token refresh...");
          // We call refresh directly using a clean axios instance to avoid infinite loop / token interceptors on this call
          const refreshRes = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1"}${ENDPOINT.AUTH.REFRESH}`,
            { refresh_token: refreshToken }
          );

          const { data } = refreshRes.data;
          if (refreshRes.status === 200 || refreshRes.status === 201) {
            const { access_token, refresh_token } = data;
            console.log("[HTTP] Token refresh succeeded.");
            setTokens(access_token, refresh_token || refreshToken);
            
            // Dispatch a token changed event so stores/providers know
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("token:changed", { detail: { access_token } }));
            }

            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return httpClient(originalRequest);
          }
        } catch (refreshError) {
          console.error("[HTTP] Token refresh failed:", refreshError);
        }
      }

      // If we reach here, refresh failed or was not available
      clearTokens();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:session_expired"));
      }
    }

    return Promise.reject(error);
  }
);

export default httpClient;
export { httpClient as fetchHttpClient }; // Export alias as mentioned in PROJECT_DIRECTORY.MD
