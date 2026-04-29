import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const membershipService = {
  createMembership: async (formData) => {
    try {
      const response = await axios.post(`${API}/api/membership`, formData);
      return response.data;
    } catch (error) {
      console.error("Database Error:", error.response?.data || error.message);
      throw error;
    }
  }
};

export default membershipService;