export const AREA_LABELS = {
  COURT: 'Quadra Esportiva',
  KIOSK: 'Quiosque',
  PARTY_ROOM: 'Salao de Festas',
};

export const AREA_COLORS = {
  COURT: '#16a34a',
  KIOSK: '#2563eb',
  PARTY_ROOM: '#9333ea',
};

export const STATUS_LABELS = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmada',
  REJECTED: 'Rejeitada',
  FINISHED: 'Finalizada',
  CANCELLED: 'Cancelada',
};

export const STATUS_COLORS = {
  PENDING: { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
  CONFIRMED: { bg: '#dcfce7', text: '#14532d', border: '#16a34a' },
  REJECTED: { bg: '#fee2e2', text: '#7f1d1d', border: '#dc2626' },
  FINISHED: { bg: '#f3f4f6', text: '#374151', border: '#9ca3af' },
  CANCELLED: { bg: '#fff7ed', text: '#7c2d12', border: '#f97316' },
};

export const ROLE_LABELS = { ADMIN: 'Sindico', OPERATOR: 'Porteiro', RESIDENT: 'Morador' };

export const ROLE_COLORS = {
  ADMIN: { bg: '#fdf4ff', text: '#701a75', border: '#d946ef' },
  OPERATOR: { bg: '#f0fdf4', text: '#14532d', border: '#16a34a' },
  RESIDENT: { bg: '#eff6ff', text: '#1e3a5f', border: '#3b82f6' },
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

export const formatDateTime = (isoStr) => {
  if (!isoStr) return '-';
  const d = new Date(isoStr);
  return d.toLocaleString('pt-BR');
};
