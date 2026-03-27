import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, ClipboardList, AlertTriangle, Package, LogOut, CheckSquare, Home } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useUIStore from '../../store/useUIStore';
import Avatar from '../ui/Avatar';
import { ROLE_LABELS } from '../../utils/formatters';
import { logout as logoutApi } from '../../services/auth';

const NAV = {
  ADMIN: [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/reservations', icon: ClipboardList, label: 'Reservas' },
    { to: '/admin/users', icon: Users, label: 'Moradores' },
    { to: '/admin/operators', icon: Users, label: 'Porteiros' },
    { to: '/shared/calendar', icon: Calendar, label: 'Calendario' },
  ],
  OPERATOR: [
    { to: '/operator', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/operator/approve', icon: CheckSquare, label: 'Aprovar Salao' },
    { to: '/operator/checkout', icon: ClipboardList, label: 'Conferencias' },
    { to: '/operator/holidays', icon: AlertTriangle, label: 'Feriados' },
    { to: '/operator/items', icon: Package, label: 'Itens' },
    { to: '/shared/calendar', icon: Calendar, label: 'Calendario' },
  ],
  RESIDENT: [
    { to: '/resident', icon: Home, label: 'Inicio' },
    { to: '/resident/new', icon: Calendar, label: 'Nova Reserva' },
    { to: '/shared/calendar', icon: Calendar, label: 'Calendario' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen } = useUIStore();
  const location = useLocation();
  const navigate = useNavigate();

  const links = NAV[user?.role] || [];

  const handleLogout = async () => {
    try { await logoutApi(); } catch {}
    logout();
    navigate('/login');
  };

  if (!sidebarOpen) return null;

  return (
    <aside style={{
      width: 240, minHeight: '100vh', background: '#111827', color: '#f9fafb',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
    }}>
      <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid #1f2937' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#f9fafb' }}>Condo<span style={{ color: '#3b82f6' }}>App</span></div>
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Agenda de Reservas</div>
      </div>

      <nav style={{ flex: 1, padding: '1rem 0' }}>
        {links.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 1.25rem', fontSize: 14, fontWeight: active ? 600 : 400,
              color: active ? '#fff' : '#9ca3af',
              background: active ? '#1d4ed8' : 'transparent',
              textDecoration: 'none', borderRadius: 0,
              transition: 'all .15s',
            }}>
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #1f2937' }}>
        <Link to="/shared/profile" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 12 }}>
          <Avatar name={user?.name || ''} photoUrl={user?.photo_url} size={34} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#f9fafb' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>{ROLE_LABELS[user?.role]}</div>
          </div>
        </Link>
        <button onClick={handleLogout} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 10px', borderRadius: 8, border: 'none',
          background: '#1f2937', color: '#9ca3af', cursor: 'pointer', fontSize: 13,
        }}>
          <LogOut size={16} /> Sair
        </button>
      </div>
    </aside>
  );
}
