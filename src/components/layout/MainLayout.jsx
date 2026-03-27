import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';
import { Menu } from 'lucide-react';
import useUIStore from '../../store/useUIStore';

export default function MainLayout() {
  const { toggleSidebar } = useUIStore();
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
      <Sidebar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '1rem 1.5rem', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
          <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <Menu size={20} color="#6b7280" />
          </button>
        </div>
        <div style={{ flex: 1, padding: '1.5rem', overflow: 'auto' }}>
          <Outlet />
        </div>
      </main>
      <Toaster position="top-right" />
    </div>
  );
}
