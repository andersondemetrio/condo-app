import { useQuery } from '@tanstack/react-query';
import { Users, CalendarCheck, Clock, XCircle } from 'lucide-react';
import { listReservations } from '../../services/reservations';
import { listUsers } from '../../services/users';
import { listPendingForms } from '../../services/checkout';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import AreaBadge from '../../components/ui/AreaBadge';
import Spinner from '../../components/ui/Spinner';
import { formatDate } from '../../utils/formatters';

function KPICard({ icon: Icon, label, value, color }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '1.25rem', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={24} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{value}</div>
        <div style={{ fontSize: 13, color: '#6b7280' }}>{label}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: resData, isLoading: loadingRes } = useQuery({
    queryKey: ['reservations', month, year],
    queryFn: () => listReservations({ page: 1, limit: 50 }),
  });

  const { data: usersData } = useQuery({
    queryKey: ['users-count'],
    queryFn: () => listUsers({ limit: 1 }),
  });

  const { data: pendingForms } = useQuery({
    queryKey: ['checkout-pending'],
    queryFn: listPendingForms,
  });

  const reservations = resData?.data?.data || [];
  const pending = reservations.filter((r) => r.status === 'PENDING').length;
  const confirmed = reservations.filter((r) => r.status === 'CONFIRMED').length;
  const cancelled = reservations.filter((r) => r.status === 'CANCELLED').length;
  const totalUsers = usersData?.data?.total || 0;
  const pendingCheckouts = pendingForms?.data?.data?.length || 0;

  const recent = [...reservations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={`${month.toString().padStart(2,'0')}/${year} — visao geral`} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: '2rem' }}>
        <KPICard icon={CalendarCheck} label="Confirmadas" value={confirmed} color="#16a34a" />
        <KPICard icon={Clock} label="Pendentes" value={pending} color="#d97706" />
        <KPICard icon={XCircle} label="Canceladas" value={cancelled} color="#dc2626" />
        <KPICard icon={Users} label="Moradores ativos" value={totalUsers} color="#2563eb" />
      </div>

      {pendingCheckouts > 0 && (
        <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#92400e' }}>
          <Clock size={18} /> {pendingCheckouts} conferencia(s) aguardando aprovacao
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e5e7eb', fontWeight: 600, fontSize: 15 }}>Reservas recentes</div>
        {loadingRes ? (
          <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}><Spinner /></div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Morador', 'Area', 'Data', 'Status'].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 500, color: '#6b7280', fontSize: 13 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 16px' }}>{r.user?.name || '-'}</td>
                  <td style={{ padding: '10px 16px' }}><AreaBadge area={r.area_type} /></td>
                  <td style={{ padding: '10px 16px', color: '#6b7280' }}>{formatDate(r.date)}</td>
                  <td style={{ padding: '10px 16px' }}><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
