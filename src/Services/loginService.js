import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

const loginService = {
  /**
   * Primary Login Method
   * Sends credentials to the backend and saves the session on success.
   */
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });

      if (response.data) {
        // Save full user info
        localStorage.setItem('gfc_user', JSON.stringify(response.data));
        // Save token separately for easy access in API calls
        if (response.data.token) {
          localStorage.setItem('gfc_token', response.data.token);
        }
      }

      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || "Connection error. Please try again later.";
      throw new Error(message);
    }
  },

  /**
   * Password Reset Flow - Phase 1: Identify
   * Gets the security question associated with an email.
   */
  getSecurityQuestion: async (email) => {
    try {
      const response = await axios.post(`${API_URL}/forgot-password/identify`, { email });
      return response.data.question;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Account not found.");
    }
  },

  /**
   * Password Reset Flow - Phase 2: Verify & Update
   */
  resetPassword: async (email, answer, newPassword) => {
    try {
      const response = await axios.post(`${API_URL}/forgot-password/reset`, {
        email,
        answer,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Reset failed. Check your answer.");
    }
  },

  /**
   * Session Management
   */
  logout: () => {
    localStorage.removeItem('gfc_user');
    localStorage.removeItem('gfc_token');
    window.location.href = '/login';
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('gfc_user'));
  },

  getToken: () => {
    return localStorage.getItem('gfc_token');
  },

  isAuthenticated: () => {
    return localStorage.getItem('gfc_token') !== null;
  },

  /**
   * Returns axios headers with the JWT token attached.
   * Use this in any service that calls a protected backend route.
   * Example: axios.get(url, loginService.authHeaders())
   */
  authHeaders: () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('gfc_token')}`
    }
  })
};

export default loginService;
