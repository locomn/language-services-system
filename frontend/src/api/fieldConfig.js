import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const fieldConfigApi = {
  getAllFields: async () => {
    const response = await axios.get(`${API_BASE_URL}/field-config`);
    return response.data;
  },

  updateField: async (id, data) => {
    const response = await axios.patch(`${API_BASE_URL}/field-config/${id}`, data);
    return response.data;
  },

  createField: async (data) => {
    const response = await axios.post(`${API_BASE_URL}/field-config`, data);
    return response.data;
  },

  deleteField: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/field-config/${id}`);
    return response.data;
  },

  getAuditTrail: async () => {
    const response = await axios.get(`${API_BASE_URL}/field-config/audit`);
    return response.data;
  }
};
