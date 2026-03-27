import api from './api';

export const listReservations = (params) => api.get('/reservations', { params });
export const getMyReservations = (params) => api.get('/reservations/my', { params });
export const getCalendar = (month, year) => api.get('/reservations/calendar', { params: { month, year } });
export const getReservation = (id) => api.get(`/reservations/${id}`);
export const createReservation = (data) => api.post('/reservations', data);
export const approveReservation = (id) => api.patch(`/reservations/${id}/approve`);
export const rejectReservation = (id, reason) => api.patch(`/reservations/${id}/reject`, { reason });
export const cancelReservation = (id) => api.patch(`/reservations/${id}/cancel`);
