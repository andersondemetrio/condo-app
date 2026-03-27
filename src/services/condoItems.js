import api from './api';

export const listItems = (date) => api.get('/condo-items', { params: date ? { date } : {} });
export const createItem = (data) => api.post('/condo-items', data);
export const updateItem = (id, data) => api.put(`/condo-items/${id}`, data);
