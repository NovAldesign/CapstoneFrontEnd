import axios from "axios";

// Base URL for membership (Applicants & Members)
const API_URL = "http://localhost:3000/api/membership";

export const getAllMembership = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// Changed to PUT to match your router's .route("/membership/:id").put()
export const updateMembershipStatus = async (id, status) => {
    const response = await axios.put(`${API_URL}/${id}`, { status });
    return response.data;
};

export const deleteMembership = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};