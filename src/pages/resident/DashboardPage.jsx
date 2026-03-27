import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMyReservations, cancelReservation } from '../../services/reservations';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import AreaBadge from '../../components/ui/AreaBadge';
import ConfirmModal from '../../components/ui/ConfirmModal';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import { formatDate } from '../../utils/formatters';
import { Plus, Ban, CalendarCheck } from 'lucide-react';
import { useState } from 'react';

export default function ResidentDashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [cancelTarget, setCancelTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-reservations'],
    queryFn: () => getMyReservations({ limit: 20 }),
  });

  const cancelMut = useMutation({
    mutationFn: cancelReservation,
    onSuccess: () => { toast.success('Reserva cancelada'); qc.invalidateQueries(['my-reservations']); setCancelTarget(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'Erro ao cancelar'),
  });

  const reservations = data?.data?.data || [];
  const upcoming = reservations.filter((r) => ['PENDING', 'CONFIRMED'].includes(r.status));
  const past = reservations.filter((r) => ['FINISHED', 'CANCELLED', 'REJECTED'].includes(r.status));

  const Section = ({ title, items }) => (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: '1.5rem' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f3f4f6', fontWeight: 600, fontSize: 15 }}>{title}</div>
      {items.length === 0 ? <EmptyState title="Nenhuma reserva aqui" /> :
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead><tr style={{ background: '#f9fafb' }}>
            {['Area', 'Data', 'Horario', 'Status', ''].map((h) => <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 13, fontWeight: 500, color: '#6b7280' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                <td style={{ padding: '10px 16px' }}><AreaBadge area={r.area_type} /></td>
                <td style={{ padding: '10px 16px' }}>{formatDate(r.date)}</td>
                <td style={{ padding: '10px 16px', color: '#6b7280', fontSize: 13 }}>{r.start_time && r.end_time ? `${r.start_time} – ${r.end_time}` : '–'}</td>
                <td style={{ padding: '10px 16px' }}><StatusBadge status={r.status} /></td>
                <td style={{ padding: '10px 16px' }}>
                  {r.status === 'CONFIRMED' && new Date(r.date) > new Date() && (
                    <button onClick={() => setCancelTarget(r)} title="Cancelar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f97316', padding: 4 }}>
                      <Ban size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>}
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Minhas Reservas"
        action={
          <button onClick={() => navigate('/resident/new')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 500, fontSize: 14 }}>
            <Plus size={16} /> Nova Reserva
          </button>
        }
      />

      {isLoading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Spinner /></div> : (
        <>
          <Section title={`Proximas (${upcoming.length})`} items={upcoming} />
          {past.length > 0 && <Section title="Historico" items={past} />}
        </>
      )}

      <ConfirmModal open={!!cancelTarget} title="Cancelar reserva" message={`Cancelar reserva de ${cancelTarget?.area_type} em ${formatDate(cancelTarget?.date)}?`} onConfirm={() => cancelMut.mutate(cancelTarget.id)} onCancel={() => setCancelTarget(null)} loading={cancelMut.isPending} danger />
    </div>
  );
}
