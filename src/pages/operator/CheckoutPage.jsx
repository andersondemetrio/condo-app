import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { listPendingForms, approveForm, rejectForm } from '../../services/checkout';
import PageHeader from '../../components/ui/PageHeader';
import ConfirmModal from '../../components/ui/ConfirmModal';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import AreaBadge from '../../components/ui/AreaBadge';
import { formatDate } from '../../utils/formatters';
import { CheckCircle, XCircle, ClipboardList, Key } from 'lucide-react';

export default function CheckoutPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);

  const { data, isLoading } = useQuery({ queryKey: ['checkout-pending'], queryFn: listPendingForms });

  const approveMut = useMutation({
    mutationFn: approveForm,
    onSuccess: () => { toast.success('Conferencia aprovada!'); qc.invalidateQueries(['checkout-pending']); setModal(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'Erro'),
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, obs }) => rejectForm(id, obs),
    onSuccess: () => { toast.success('Conferencia rejeitada'); qc.invalidateQueries(['checkout-pending']); setModal(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'Erro'),
  });

  const forms = data?.data?.data || [];

  return (
    <div>
      <PageHeader title="Conferencias de Locacao" subtitle={`${forms.length} aguardando aprovacao`} />

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {isLoading ? <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}><Spinner /></div>
          : forms.length === 0 ? <EmptyState icon={ClipboardList} title="Nenhuma conferencia pendente" message="Tudo em dia!" />
          : forms.map((f) => (
            <div key={f.id} style={{ padding: '1.25rem', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{f.submitter?.name}</span>
                    <AreaBadge area={f.reservation?.area_type} />
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>{formatDate(f.reservation?.date)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 13 }}>
                    <Key size={14} color={f.key_returned ? '#16a34a' : '#dc2626'} />
                    <span style={{ color: f.key_returned ? '#16a34a' : '#dc2626' }}>
                      Chave {f.key_returned ? 'entregue' : 'NAO entregue'}
                    </span>
                  </div>
                  {f.notes && <div style={{ marginTop: 6, fontSize: 13, color: '#374151', background: '#f9fafb', borderRadius: 6, padding: '6px 10px' }}>Obs: {f.notes}</div>}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setModal({ type: 'approve', id: f.id, name: f.submitter?.name })}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: '#dcfce7', color: '#15803d', fontWeight: 500, cursor: 'pointer', fontSize: 13 }}>
                    <CheckCircle size={16} /> Aprovar
                  </button>
                  <button onClick={() => setModal({ type: 'reject', id: f.id, name: f.submitter?.name })}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: '#fee2e2', color: '#dc2626', fontWeight: 500, cursor: 'pointer', fontSize: 13 }}>
                    <XCircle size={16} /> Rejeitar
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      <ConfirmModal open={modal?.type === 'approve'} title="Aprovar conferencia" message={`Confirmar devolucao de "${modal?.name}"? A reserva sera marcada como FINALIZADA.`} onConfirm={() => approveMut.mutate(modal.id)} onCancel={() => setModal(null)} loading={approveMut.isPending} />
      <ConfirmModal open={modal?.type === 'reject'} title="Rejeitar conferencia" message={`Rejeitar a devolucao de "${modal?.name}"? Um e-mail sera enviado com o motivo.`} onConfirm={() => rejectMut.mutate({ id: modal.id, obs: 'Conferencia rejeitada pelo porteiro. Entre em contato.' })} onCancel={() => setModal(null)} loading={rejectMut.isPending} danger />
    </div>
  );
}
