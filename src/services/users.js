import api from './api';

export const listUsers = (params) => api.get('/users', { params });
export const getUser = (id) => api.get(`/users/${id}`);
export const createResident = (data) => api.post('/users/resident', data);
export const createOperator = (data) => api.post('/users/operator', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deactivateUser = (id) => api.delete(`/users/${id}`);
export const uploadPhoto = (id, file) => {
  const form = new FormData();
  form.append('photo', file);
  return api.post(`/users/${id}/photo`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
};
