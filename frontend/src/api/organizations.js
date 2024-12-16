import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getOrganizations = async (search = '') => {
    try {
        const response = await axios.get(`${API_URL}/organizations?search=${encodeURIComponent(search)}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching organizations:', error);
        throw error;
    }
};
