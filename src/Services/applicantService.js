import axios from 'axios';


const API_URL = 'http://localhost:3000/api/applicant';

const applicantService = {

    createApplicant: async (formData) => {
        try{
            const response = await axios.post(API_URL, formData);
      return response.data;
    } catch (error) {
      console.error("Error submitting application:", error);
      throw error;
    }
  }
};

export default applicantService;