import { useQuery } from '@tanstack/react-query';
import { listReservations } from '../../services/reservations';
import { listPendingForms } from '../../services/checkout';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import AreaBadge from '../../components/ui/AreaBadge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatDate } from '../../utils/formatters';
import { Clock } from 'lucide-react';

export default function OperatorDashboard() {
  const today = new Date().toISOString().split('T')[0];

  const { data: todayRes, isLoading } = useQuery({
    queryKey: ['reservations-today'],
    queryFn: () => listReservations({ date: today, limit: 50 }),
    refetchInterval: 60000,
  });

  const { data: pendingData } = useQuery({
    queryKey: ['reservations-pending'],
    queryFn: () => listReservations({ status: 'PENDING', limit: 20 }),
  });

  const { data: checkoutData } = useQuery({
    queryKey: ['checkout-pending'],
    queryFn: listPendingForms,
  });

  const todayList = todayRes?.data?.data || [];
  const pendingList = pendingData?.data?.data || [];
  const checkoutList = checkoutData?.data?.data || [];

  const Card = ({ title, count, color, children }) => (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: '1.5rem' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, fontSize: 15 }}>{title}</span>
        {count > 0 && <span style={{ background: color + '20', color, fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 99 }}>{count}</span>}
      </div>
      {children}
    </div>
  );

  return (
    <div>
      <PageHeader title="Dashboard Operacional" subtitle={`Hoje: ${formatDate(today)}`} />

      <Card title="Reservas de hoje" count={todayList.length} color="#2563eb">
        {isLoading ? <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}><Spinner /></div>
          : todayList.length === 0 ? <EmptyState title="Nenhuma reserva hoje" message="Dia tranquilo!" />
          : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead><tr style={{ background: '#f9fafb' }}>
                {['Morador','Area','Horario','Status'].map((h) => <th key={h} style={{ padding: '8px 16px', textAlign: 'left', fontSize: 13, fontWeight: 500, color: '#6b7280' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {todayList.map((r) => (
                  <tr key={r.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '9px 16px' }}>{r.user?.name || '-'}</td>
                    <td style={{ padding: '9px 16px' }}><AreaBadge area={r.area_type} /></td>
                    <td style={{ padding: '9px 16px', color: '#6b7280', fontSize: 13 }}>{r.start_time || '--'}–{r.end_time || '--'}</td>
                    <td style={{ padding: '9px 16px' }}><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </Card>

      {pendingList.length > 0 && (
        <Card title="Pre-reservas pendentes (Salao)" count={pendingList.length} color="#d97706">
          <div style={{ padding: '1rem' }}>
            {pendingList.map((r) => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: 14 }}>{r.user?.name} — {formatDate(r.date)}</span>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {checkoutList.length > 0 && (
        <Card title="Conferencias aguardando aprovacao" count={checkoutList.length} color="#9333ea">
          <div style={{ padding: '1rem' }}>
            {checkoutList.map((f) => (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 14, color: '#374151', borderBottom: '1px solid #f3f4f6' }}>
                <Clock size={15} color="#9333ea" />
                {f.submitter?.name} — {formatDate(f.reservation?.date)}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
