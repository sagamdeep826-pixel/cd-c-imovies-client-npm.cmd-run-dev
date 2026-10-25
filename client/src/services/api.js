import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('imovies_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';

    if (error.response?.status === 401) {
      // Clear token on unauthorized if not login/register
      const isAuthPath = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthPath) {
        localStorage.removeItem('imovies_token');
        localStorage.removeItem('imovies_user');
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
