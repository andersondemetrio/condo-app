import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { listReservations, approveReservation, rejectReservation } from '../../services/reservations';
import PageHeader from '../../components/ui/PageHeader';
import ConfirmModal from '../../components/ui/ConfirmModal';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import { formatDate } from '../../utils/formatters';
import { CheckCircle, XCircle } from 'lucide-react';

export default function ApproveSalaoPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['reservations-pending-salao'],
    queryFn: () => listReservations({ status: 'PENDING', area_type: 'PARTY_ROOM', limit: 50 }),
  });

  const approveMut = useMutation({
    mutationFn: approveReservation,
    onSuccess: () => { toast.success('Salao aprovado!'); qc.invalidateQueries(['reservations-pending-salao']); setModal(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'Erro'),
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }) => rejectReservation(id, reason),
    onSuccess: () => { toast.success('Pre-reserva recusada'); qc.invalidateQueries(['reservations-pending-salao']); setModal(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'Erro'),
  });

  const pending = data?.data?.data || [];

  return (
    <div>
      <PageHeader title="Aprovar Salao de Festas" subtitle={`${pending.length} pre-reserva(s) aguardando`} />

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {isLoading ? <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}><Spinner /></div>
          : pending.length === 0 ? <EmptyState title="Nenhuma pre-reserva pendente" message="Tudo em dia!" />
          : pending.map((r) => (
            <div key={r.id} style={{ padding: '1.25rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{r.user?.name}</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                  {formatDate(r.date)} &bull; {r.guests} convidados {r.notes && `&bull; "${r.notes}"`}
                </div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                  {r.user?.block && `Bloco ${r.user.block}`} {r.user?.apartment && `/ Apto ${r.user.apartment}`}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setModal({ type: 'approve', id: r.id, name: r.user?.name })}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: '#dcfce7', color: '#15803d', fontWeight: 500, cursor: 'pointer', fontSize: 13 }}>
                  <CheckCircle size={16} /> Aprovar
                </button>
                <button onClick={() => setModal({ type: 'reject', id: r.id, name: r.user?.name })}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: '#fee2e2', color: '#dc2626', fontWeight: 500, cursor: 'pointer', fontSize: 13 }}>
                  <XCircle size={16} /> Recusar
                </button>
              </div>
            </div>
          ))}
      </div>

      <ConfirmModal open={modal?.type === 'approve'} title="Aprovar salao" message={`Confirmar aprovacao para "${modal?.name}"?`} onConfirm={() => approveMut.mutate(modal.id)} onCancel={() => setModal(null)} loading={approveMut.isPending} />
      <ConfirmModal open={modal?.type === 'reject'} title="Recusar pre-reserva" message={`Recusar a pre-reserva de "${modal?.name}"?`} onConfirm={() => rejectMut.mutate({ id: modal.id, reason: 'Recusado pelo porteiro' })} onCancel={() => setModal(null)} loading={rejectMut.isPending} danger />
    </div>
  );
}
