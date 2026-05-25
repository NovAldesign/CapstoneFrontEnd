import axios from 'axios';

// Dynamically sets the backend URL based on whether you're developing locally or running live
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api/partnerships'
  : '/api/partnerships'; 

const partnershipService = {
  createInquiry: async (partnerData) => {
    try {
      const response = await axios.post(API_URL, partnerData);
      return response.data;
    } catch (error) {
      console.error("Partnership Submission Error:", error.response?.data || error.message);
      throw error;
    }
  }
};

export default partnershipService;
