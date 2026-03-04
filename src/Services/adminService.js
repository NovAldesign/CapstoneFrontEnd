import axios from "axios";

const API_URL = "http://localhost:3000/api/applicants";

export const getAllApplicants = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const updateApplicantStatus = async(id, status) => {
    const response = await axios.patch(`${API_URL}/${id}`, { status });
};

export const deleteApplicant = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
