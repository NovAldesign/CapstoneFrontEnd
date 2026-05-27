// 1. Swap from the raw library import to your custom configured instance
import axios from '../api/axiosConfig';

const partnershipService = {
  createInquiry: async (partnerData) => {
    try {
      // 2. Use a clean relative path. axiosConfig already knows where the server is!
      const response = await axios.post('/api/partnerships', partnerData);
      return response.data;
    } catch (error) {
      console.error("Partnership Submission Error:", error.response?.data || error.message);
      throw error;
    }
  }
};

export default partnershipService;