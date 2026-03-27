import { CalendarX } from 'lucide-react';

export default function EmptyState({ icon: Icon = CalendarX, title = 'Nenhum registro', message = '' }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}>
      <Icon size={48} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.5 }} />
      <p style={{ fontWeight: 600, fontSize: 16, color: '#6b7280', marginBottom: 4 }}>{title}</p>
      {message && <p style={{ fontSize: 14 }}>{message}</p>}
    </div>
  );
}
