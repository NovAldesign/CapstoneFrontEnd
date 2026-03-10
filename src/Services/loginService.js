import axios from 'axios';

// The base URL for your backend API
const API_URL = 'http://localhost:3001/api/auth';

const loginService = {
  /**
   * Primary Login Method
   * Sends credentials to the backend and saves the session on success.
   */
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      
      // If the backend returns user data, we store it in LocalStorage
      if (response.data) {
        // We store the role, name, id, and tier (for members)
        localStorage.setItem('gfc_user', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      // Catching the Rate Limiter "Too many attempts" message here
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
    window.location.href = '/login';
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('gfc_user'));
  },

  isAuthenticated: () => {
    return localStorage.getItem('gfc_user') !== null;
  }
};

export default loginService;