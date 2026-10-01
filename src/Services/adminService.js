import axios from 'axios';
import { BACKEND_URL } from './eventUtils';

const API_URL = `${BACKEND_URL}/api/membership`;

export const getAllMembership = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const deleteMembership = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

export const updateMembershipStatus = async (id, newStatus) => {
  // This sends { status: "accepted" } to your PATCH route
  const response = await axios.patch(`${API_URL}/${id}`, { status: newStatus });
  return response.data;
};