import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { login as loginApi } from '../../services/auth';
import useAuthStore from '../../store/useAuthStore';
import Spinner from '../../components/ui/Spinner';

const schema = z.object({
  email: z.string().email('E-mail invalido'),
  password: z.string().min(6, 'Minimo 6 caracteres'),
});

const ROLE_HOME = { ADMIN: '/admin', OPERATOR: '/operator', RESIDENT: '/resident' };

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email, password }) => {
    setLoading(true);
    try {
      const { data } = await loginApi(email, password);
      login(data.data.user, data.data.accessToken, data.data.refreshToken);
      toast.success(`Bem-vindo, ${data.data.user.name}!`);
      navigate(ROLE_HOME[data.data.user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem', width: '100%', maxWidth: 420, boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#111827' }}>Condo<span style={{ color: '#2563eb' }}>App</span></div>
          <p style={{ color: '#6b7280', marginTop: 6, fontSize: 14 }}>Agenda de Reservas do Condominio</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#374151' }}>E-mail</label>
            <input
              {...register('email')}
              type="email"
              placeholder="seu@email.com"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${errors.email ? '#dc2626' : '#e5e7eb'}`, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
            {errors.email && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{errors.email.message}</p>}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#374151' }}>Senha</label>
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${errors.password ? '#dc2626' : '#e5e7eb'}`, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
            {errors.password && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
          >
            {loading && <Spinner size={18} color="#fff" />}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: 8, fontSize: 12, color: '#6b7280' }}>
          <strong>Demo:</strong> admin@condominio.com / Admin@1234
        </div>
      </div>
    </div>
  );
}
