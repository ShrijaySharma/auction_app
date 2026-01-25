import axios from 'axios';

// Auto-detect API URL based on current host
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  const host = window.location.hostname;
  const apiUrl = `http://${host}:4000/api`;
  console.log('API URL:', apiUrl);
  return apiUrl;
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const login = async (username, password) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    if (error.response) {
      // Server responded with error
      throw error;
    } else if (error.request) {
      // Request made but no response
      throw new Error('Network error: Could not connect to server. Make sure the backend is running.');
    } else {
      // Something else happened
      throw new Error('Login failed: ' + error.message);
    }
  }
};

export const logout = async () => {
  await api.post('/auth/logout');
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data.user;
};

export default api;

