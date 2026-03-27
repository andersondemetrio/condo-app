import api from './api';

export const listPendingForms = () => api.get('/checkout-forms/pending');
export const createCheckoutForm = (data) => api.post('/checkout-forms', data);
export const approveForm = (id) => api.patch(`/checkout-forms/${id}/approve`);
export const rejectForm = (id, observations) => api.patch(`/checkout-forms/${id}/reject`, { observations });
