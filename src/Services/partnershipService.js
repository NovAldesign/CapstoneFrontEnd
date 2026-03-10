import axios from 'axios';

const API_URL = 'http://localhost:3000/api/partnerships'; 

const partnershipService = {
  // 1. Submit the initial proposal and create the account
  createInquiry: async (partnerData) => {
    try {
      const response = await axios.post(API_URL, partnerData);
      return response.data;
    } catch (error) {
      console.error("Partnership Submission Error:", error.response?.data || error.message);
      throw error;
    }
  },

  // 2. Fetch a single partner's profile (For their private Vault)
  getPartnerProfile: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching partner profile:", error);
      throw error;
    }
  },

  // 3. Document Upload 
  uploadDocument: async (id, fileData) => {
    try {
      const response = await axios.post(`${API_URL}/${id}/documents`, fileData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error("Document Upload Error:", error);
      throw error;
    }
  }
};

export default partnershipService;
