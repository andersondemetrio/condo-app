import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import './index.css';

// Layout
import MainLayout from './components/layout/MainLayout';
import PrivateRoute from './routes/PrivateRoute';

// Auth
import LoginPage from './pages/auth/LoginPage';

// Admin
import AdminDashboard from './pages/admin/DashboardPage';
import UsersPage from './pages/admin/UsersPage';
import ReservationsPage from './pages/admin/ReservationsPage';

// Operator
import OperatorDashboard from './pages/operator/DashboardPage';
import ApproveSalaoPage from './pages/operator/ApproveSalaoPage';
import CheckoutPage from './pages/operator/CheckoutPage';
import HolidaysPage from './pages/operator/HolidaysPage';
import ItemsPage from './pages/operator/ItemsPage';

// Resident
import ResidentDashboard from './pages/resident/DashboardPage';
import NewReservationPage from './pages/resident/NewReservationPage';

// Shared
import CalendarPage from './pages/shared/CalendarPage';
import ProfilePage from './pages/shared/ProfilePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/unauthorized" element={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 48 }}>🚫</div>
              <h2>Acesso negado</h2>
              <a href="/login" style={{ color: '#2563eb' }}>Voltar ao login</a>
            </div>
          } />

          {/* Admin */}
          <Route element={<PrivateRoute roles={['ADMIN']} />}>
            <Route element={<MainLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/reservations" element={<ReservationsPage />} />
              <Route path="/admin/users" element={<UsersPage roleFilter="RESIDENT" />} />
              <Route path="/admin/operators" element={<UsersPage roleFilter="OPERATOR" />} />
            </Route>
          </Route>

          {/* Operator */}
          <Route element={<PrivateRoute roles={['OPERATOR']} />}>
            <Route element={<MainLayout />}>
              <Route path="/operator" element={<OperatorDashboard />} />
              <Route path="/operator/approve" element={<ApproveSalaoPage />} />
              <Route path="/operator/checkout" element={<CheckoutPage />} />
              <Route path="/operator/holidays" element={<HolidaysPage />} />
              <Route path="/operator/items" element={<ItemsPage />} />
            </Route>
          </Route>

          {/* Resident */}
          <Route element={<PrivateRoute roles={['RESIDENT']} />}>
            <Route element={<MainLayout />}>
              <Route path="/resident" element={<ResidentDashboard />} />
              <Route path="/resident/new" element={<NewReservationPage />} />
            </Route>
          </Route>

          {/* Shared (all authenticated) */}
          <Route element={<PrivateRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/shared/calendar" element={<CalendarPage />} />
              <Route path="/shared/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
