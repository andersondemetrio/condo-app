import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { listReservations, approveReservation, rejectReservation, cancelReservation } from '../../services/reservations';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import AreaBadge from '../../components/ui/AreaBadge';
import ConfirmModal from '../../components/ui/ConfirmModal';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import { formatDate } from '../../utils/formatters';
import { CheckCircle, XCircle, Ban } from 'lucide-react';

export default function ReservationsPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [modal, setModal] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['reservations-admin', statusFilter, areaFilter],
    queryFn: () => listReservations({ status: statusFilter || undefined, area_type: areaFilter || undefined, limit: 50 }),
  });

  const approveMut = useMutation({ mutationFn: (id) => approveReservation(id), onSuccess: () => { toast.success('Reserva aprovada'); qc.invalidateQueries(['reservations-admin']); setModal(null); }, onError: (e) => toast.error(e.response?.data?.message || 'Erro') });
  const rejectMut = useMutation({ mutationFn: ({ id, reason }) => rejectReservation(id, reason), onSuccess: () => { toast.success('Reserva rejeitada'); qc.invalidateQueries(['reservations-admin']); setModal(null); }, onError: (e) => toast.error(e.response?.data?.message || 'Erro') });
  const cancelMut = useMutation({ mutationFn: (id) => cancelReservation(id), onSuccess: () => { toast.success('Reserva cancelada'); qc.invalidateQueries(['reservations-admin']); setModal(null); }, onError: (e) => toast.error(e.response?.data?.message || 'Erro') });

  const reservations = data?.data?.data || [];

  const selectStyle = { padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, background: '#fff' };

  return (
    <div>
      <PageHeader title="Gestao de Reservas" subtitle={`${data?.data?.total || 0} reservas`} />

      <div style={{ display: 'flex', gap: 10, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="">Todos os status</option>
          {['PENDING','CONFIRMED','REJECTED','FINISHED','CANCELLED'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)} style={selectStyle}>
          <option value="">Todas as areas</option>
          <option value="COURT">Quadra</option>
          <option value="KIOSK">Quiosque</option>
          <option value="PARTY_ROOM">Salao de Festas</option>
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}><Spinner /></div>
        ) : reservations.length === 0 ? (
          <EmptyState title="Nenhuma reserva encontrada" />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Morador','Area','Data','Horario','Status','Acoes'].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 500, color: '#6b7280', fontSize: 13 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 16px' }}>{r.user?.name || '-'}</td>
                  <td style={{ padding: '10px 16px' }}><AreaBadge area={r.area_type} /></td>
                  <td style={{ padding: '10px 16px' }}>{formatDate(r.date)}</td>
                  <td style={{ padding: '10px 16px', color: '#6b7280', fontSize: 13 }}>{r.start_time && r.end_time ? `${r.start_time} - ${r.end_time}` : '-'}</td>
                  <td style={{ padding: '10px 16px' }}><StatusBadge status={r.status} /></td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {r.status === 'PENDING' && (
                        <>
                          <button onClick={() => setModal({ type: 'approve', id: r.id, label: r.user?.name })} title="Aprovar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', padding: 4 }}><CheckCircle size={17} /></button>
                          <button onClick={() => setModal({ type: 'reject', id: r.id, label: r.user?.name })} title="Rejeitar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 4 }}><XCircle size={17} /></button>
                        </>
                      )}
                      {['PENDING','CONFIRMED'].includes(r.status) && (
                        <button onClick={() => setModal({ type: 'cancel', id: r.id, label: r.user?.name })} title="Cancelar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f97316', padding: 4 }}><Ban size={17} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmModal
        open={modal?.type === 'approve'}
        title="Aprovar reserva"
        message={`Aprovar reserva de "${modal?.label}"?`}
        onConfirm={() => approveMut.mutate(modal.id)}
        onCancel={() => setModal(null)}
        loading={approveMut.isPending}
      />
      <ConfirmModal
        open={modal?.type === 'reject'}
        title="Rejeitar reserva"
        message={`Rejeitar reserva de "${modal?.label}"?`}
        onConfirm={() => rejectMut.mutate({ id: modal.id, reason: 'Solicitacao recusada pelo administrador' })}
        onCancel={() => setModal(null)}
        loading={rejectMut.isPending}
        danger
      />
      <ConfirmModal
        open={modal?.type === 'cancel'}
        title="Cancelar reserva"
        message={`Cancelar reserva de "${modal?.label}"?`}
        onConfirm={() => cancelMut.mutate(modal.id)}
        onCancel={() => setModal(null)}
        loading={cancelMut.isPending}
        danger
      />
    </div>
  );
}
