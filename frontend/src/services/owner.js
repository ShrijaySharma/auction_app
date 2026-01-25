import api from './auth';

export const getCurrentInfo = async () => {
  const response = await api.get('/owner/current-info');
  return response.data;
};

export const placeBid = async (amount) => {
  const response = await api.post('/owner/bid', { amount });
  return response.data;
};

export const getPlayersByStatus = async (status) => {
  const response = await api.get(`/owner/players-by-status/${status}`);
  return response.data;
};

