import axios from 'axios';

// The URL where your backend is listening for Partnership inquiries
const API_URL = 'http://localhost:3000/api/partnership'; 

const partnershipService = {
  /**
   * Sends a new partnership proposal to the database
   * @param {Object} partnerData - The data from the Partnership form
   */
  createInquiry: async (partnerData) => {
    try {
      // 1. Send the data to the server
      const response = await axios.post(API_URL, partnerData);
      
      // 2. Return the success message/data from the server
      return response.data;
    } catch (error) {
      // 3. Handle errors (e.g., server down, validation failed)
      console.error("Partnership Service Error:", error.response?.data || error.message);
      throw error;
    }
  }
};

export default partnershipService;