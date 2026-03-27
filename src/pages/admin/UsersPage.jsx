import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { listUsers, createResident, createOperator, deactivateUser } from '../../services/users';
import PageHeader from '../../components/ui/PageHeader';
import RoleTag from '../../components/ui/RoleTag';
import Avatar from '../../components/ui/Avatar';
import ConfirmModal from '../../components/ui/ConfirmModal';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';

function UserForm({ role, onClose, onCreate }) {
  const [data, setData] = useState({ name: '', email: '', password: '', block: '', apartment: '', phone: '', company: '' });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setData((d) => ({ ...d, [k]: e.target.value }));
  const fn = role === 'RESIDENT' ? createResident : createOperator;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fn(data);
      toast.success(`${role === 'RESIDENT' ? 'Morador' : 'Porteiro'} cadastrado!`);
      onCreate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao cadastrar');
    } finally { setLoading(false); }
  };

  const inp = (label, key, type = 'text') => (
    <div style={{ marginBottom: '.85rem' }}>
      <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>{label}</label>
      <input value={data[key]} onChange={set(key)} type={type} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, boxSizing: 'border-box' }} />
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: '2rem', width: 460, maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ margin: '0 0 1.5rem', fontSize: 18 }}>Novo {role === 'RESIDENT' ? 'Morador' : 'Porteiro'}</h2>
        <form onSubmit={submit}>
          {inp('Nome completo *', 'name')}
          {inp('E-mail *', 'email', 'email')}
          {inp('Senha *', 'password', 'password')}
          {inp('Telefone', 'phone', 'tel')}
          {role === 'RESIDENT' ? (<>{inp('Bloco', 'block')}{inp('Apartamento', 'apartment')}</>) : inp('Empresa', 'company')}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" disabled={loading} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              {loading && <Spinner size={16} color="#fff" />} Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage({ roleFilter = 'RESIDENT' }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users', roleFilter, search],
    queryFn: () => listUsers({ role: roleFilter, search }),
  });

  const { mutate: doDeactivate, isPending: deactivating } = useMutation({
    mutationFn: (id) => deactivateUser(id),
    onSuccess: () => { toast.success('Usuario desativado'); qc.invalidateQueries(['users']); setDeactivateTarget(null); },
    onError: () => toast.error('Erro ao desativar'),
  });

  const users = data?.data?.data || [];
  const label = roleFilter === 'RESIDENT' ? 'Moradores' : 'Porteiros';

  return (
    <div>
      <PageHeader
        title={label}
        subtitle={`${data?.data?.total || 0} cadastrados`}
        action={
          <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 500, fontSize: 14 }}>
            <UserPlus size={16} /> Novo {roleFilter === 'RESIDENT' ? 'Morador' : 'Porteiro'}
          </button>
        }
      />

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Search size={16} color="#9ca3af" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, e-mail..." style={{ border: 'none', outline: 'none', fontSize: 14, flex: 1 }} />
        </div>

        {isLoading ? (
          <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}><Spinner /></div>
        ) : users.length === 0 ? (
          <EmptyState title={`Nenhum ${label.toLowerCase()} encontrado`} />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Usuario', 'E-mail', 'Bloco/Apto', 'Role', 'Acoes'].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 500, color: '#6b7280', fontSize: 13 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={u.name} photoUrl={u.photo_url} size={32} />
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 16px', color: '#6b7280' }}>{u.email}</td>
                  <td style={{ padding: '10px 16px', color: '#6b7280' }}>{u.block && u.apartment ? `${u.block} / ${u.apartment}` : '-'}</td>
                  <td style={{ padding: '10px 16px' }}><RoleTag role={u.role} /></td>
                  <td style={{ padding: '10px 16px' }}>
                    <button onClick={() => setDeactivateTarget(u)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 4 }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <UserForm role={roleFilter} onClose={() => setShowForm(false)} onCreate={() => { setShowForm(false); qc.invalidateQueries(['users']); }} />
      )}

      <ConfirmModal
        open={!!deactivateTarget}
        title="Desativar usuario"
        message={`Tem certeza que deseja desativar "${deactivateTarget?.name}"?`}
        onConfirm={() => doDeactivate(deactivateTarget.id)}
        onCancel={() => setDeactivateTarget(null)}
        loading={deactivating}
        danger
      />
    </div>
  );
}
