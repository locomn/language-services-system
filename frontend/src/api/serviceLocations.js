import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getServiceLocations = async (filters = {}) => {
    const response = await axios.get(`${API_URL}/locations`, { params: filters });
    return response.data;
};

export const getServiceLocation = async (id) => {
    const response = await axios.get(`${API_URL}/locations/${id}`);
    return response.data;
};

export const createServiceLocation = async (locationData) => {
    const response = await axios.post(`${API_URL}/locations`, locationData);
    return response.data;
};

export const updateServiceLocation = async (id, locationData) => {
    const response = await axios.put(`${API_URL}/locations/${id}`, locationData);
    return response.data;
};

export const deleteServiceLocation = async (id) => {
    const response = await axios.delete(`${API_URL}/locations/${id}`);
    return response.data;
};
