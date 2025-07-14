import axios from "axios";
import ApiRoutes from "./ApiRoutes";
import { useAuthStore } from "~/store/auth";


const DEMO_URL = "http://localhost5000/api"
const LIVE_URL = "https://big-server-4oor.onrender.com/api"


// Create an Axios instance
const apiClient = axios.create({
  baseURL: LIVE_URL, 
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach the token
apiClient.interceptors.request.use(
  (config) => {
    // Check if running on the client side
    if (process.client) {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2I0MTMyMTg2YTZhY2Y4ZTE1YzM4ZmEiLCJpYXQiOjE3Mzk5MTg4NTcsImV4cCI6MTc3MTQ3NjQ1NywiYXVkIjoiNjdiNDEzMjE4NmE2YWNmOGUxNWMzOGZhIiwiaXNzIjoicGlja3VycGFja2FnZS5jb20ifQ.dQFDmKGW-hNlZ1DNYAscJ93raeiZGQyVqrSdazw_hrw" // Access localStorage only on the client
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized response detected");

      // Check if running on the client side
      if (process.client) {
        const authStore = useAuthStore()
        await authStore.clearAuthData() // Use the store method to clear auth data

        // Only redirect if we're not already on the signin page
        if (window.location.pathname !== '/signin') {
          navigateTo('/signin')
        }
      }
    }
    return Promise.reject(error);
  }
);

const apiService = {
  // Authentication
  signup: (userData) => apiClient.post(ApiRoutes.AUTH.SIGNUP, userData),
  login: (credentials) => apiClient.post(ApiRoutes.AUTH.LOGIN, credentials),
  logout: () => apiClient.post(ApiRoutes.AUTH.LOGOUT),
  resetPassword: (data) => apiClient.post(ApiRoutes.AUTH.RESET_PASSWORD, data),
  getCurrentUser: () => apiClient.get(ApiRoutes.AUTH.CURRENT_USER),

};



export default apiService;
