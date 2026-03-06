import axios from 'axios';

const API_URL = 'http://localhost:3000/api/applicants'; 

const applicantService = {
  createApplicant: async (formData) => {
    try {
      const response = await axios.post(API_URL, formData);
      return response.data;
    } catch (error) {
      console.error("Database Error:", error.response?.data || error.message);
      throw error;
    }
  }
};

export default applicantService;