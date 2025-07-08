import axios from 'axios';

// Create an instance of axios
const apiClient = axios.create({
  baseURL: '/api' // Use the relative path we discussed for the proxy
});

// --- This is the key part ---
// We use an interceptor to automatically add the JWT token to every request.
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;