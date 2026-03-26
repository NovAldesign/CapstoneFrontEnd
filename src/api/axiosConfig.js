import axios from 'axios';

const instance = axios.create({
  // Use environment variables so it works on both localhost and Railway
  baseURL: import.meta.env.VITE_API_URL || 'https://capstonebackend-production-78e3.up.railway.app',
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR: Automatically attaches JWT to every call
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Or however you store your JWT
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR: Handles global errors (like expired logins)
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If the token is expired, you could log them out or redirect
      console.error("Session expired. Please log in again.");
    }
    return Promise.reject(error);
  }
);

export default instance;