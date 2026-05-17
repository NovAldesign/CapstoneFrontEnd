import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const loginService = {
  /**
   * Unified login — tries admin first, then member/partner.
   * Admin requires an accessKey; members and partners do not.
   */
  login: async (email, password, accessKey = '') => {
    // ── Step 1: Try admin login if accessKey is provided ──────────────
    if (accessKey) {
      try {
        const { data } = await axios.post(`${API}/api/admin/login`, {
          email,
          password,
          accessKey,
        });

        // Admin login successful — save session
        localStorage.setItem('gfc_token', data.token);
        localStorage.setItem('gfc_user', JSON.stringify({
          ...data.admin,
          role: 'admin',
        }));

        return { ...data.admin, role: 'admin' };
      } catch (err) {
        // Wrong access key or not an admin — fall through to member login
        if (err.response?.status !== 401) {
          throw new Error(err.response?.data?.error || 'Admin login failed.');
        }
      }
    }

    // ── Step 2: Try member / partner login ────────────────────────────
    try {
      const { data } = await axios.post(`${API}/api/auth/login`, {
        email,
        password,
      });

      localStorage.setItem('gfc_token', data.token);
      localStorage.setItem('gfc_user', JSON.stringify(data.user || data));

      return data.user || data;
    } catch (err) {
      const message = err.response?.data?.error || 'Connection error. Please try again.';
      throw new Error(message);
    }
  },

  /**
   * Password Reset Flow - Phase 1: Get security question
   */
  getSecurityQuestion: async (email) => {
    try {
      const { data } = await axios.post(`${API}/api/auth/forgot-password/identify`, { email });
      return data.question;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Account not found.');
    }
  },

  /**
   * Password Reset Flow - Phase 2: Verify answer & update password
   */
  resetPassword: async (email, answer, newPassword) => {
    try {
      const { data } = await axios.post(`${API}/api/auth/forgot-password/reset`, {
        email,
        answer,
        newPassword,
      });
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Reset failed. Check your answer.');
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
    try {
      return JSON.parse(localStorage.getItem('gfc_user'));
    } catch {
      return null;
    }
  },

  getToken: () => localStorage.getItem('gfc_token'),

  isAuthenticated: () => !!localStorage.getItem('gfc_token'),

  isAdmin: () => {
    try {
      const user = JSON.parse(localStorage.getItem('gfc_user'));
      return user?.role?.toLowerCase() === 'admin';
    } catch {
      return false;
    }
  },

  authHeaders: () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('gfc_token')}`,
    },
  }),
};

export default loginService;