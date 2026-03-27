import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { updateUser, uploadPhoto } from '../../services/users';
import useAuthStore from '../../store/useAuthStore';
import PageHeader from '../../components/ui/PageHeader';
import Avatar from '../../components/ui/Avatar';
import RoleTag from '../../components/ui/RoleTag';
import Spinner from '../../components/ui/Spinner';
import { Camera } from 'lucide-react';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', block: user?.block || '', apartment: user?.apartment || '' });
  const [pwForm, setPwForm] = useState({ password: '', confirm: '' });

  const updateMut = useMutation({
    mutationFn: (data) => updateUser(user.id, data),
    onSuccess: (res) => { setUser(res.data.data); toast.success('Perfil atualizado!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Erro'),
  });

  const photoMut = useMutation({
    mutationFn: (file) => uploadPhoto(user.id, file),
    onSuccess: (res) => { setUser(res.data.data); toast.success('Foto atualizada!'); },
    onError: () => toast.error('Erro ao enviar foto'),
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) photoMut.mutate(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const payload = { name: form.name, phone: form.phone, block: form.block, apartment: form.apartment };
    if (pwForm.password) {
      if (pwForm.password !== pwForm.confirm) { toast.error('Senhas nao conferem'); return; }
      payload.password = pwForm.password;
    }
    updateMut.mutate(payload);
  };

  const inp = (label, key, obj = form, setter = setForm, type = 'text') => (
    <div style={{ marginBottom: '.85rem' }}>
      <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4, color: '#374151' }}>{label}</label>
      <input value={obj[key]} onChange={(e) => setter((f) => ({ ...f, [key]: e.target.value }))} type={type}
        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, boxSizing: 'border-box' }} />
    </div>
  );

  return (
    <div style={{ maxWidth: 560 }}>
      <PageHeader title="Meu Perfil" />

      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: '2rem' }}>
          <div style={{ position: 'relative' }}>
            <Avatar name={user?.name} photoUrl={user?.photo_url} size={72} />
            <label style={{ position: 'absolute', bottom: 0, right: 0, background: '#2563eb', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid #fff' }}>
              {photoMut.isPending ? <Spinner size={14} color="#fff" /> : <Camera size={13} color="#fff" />}
              <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
            </label>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.name}</div>
            <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 6 }}>{user?.email}</div>
            <RoleTag role={user?.role} />
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {inp('Nome completo', 'name')}
            {inp('Telefone', 'phone', form, setForm, 'tel')}
            {user?.role === 'RESIDENT' && inp('Bloco', 'block')}
            {user?.role === 'RESIDENT' && inp('Apartamento', 'apartment')}
          </div>

          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1.25rem', marginTop: '.5rem' }}>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: '.75rem' }}>Alterar senha (deixe em branco para manter)</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {inp('Nova senha', 'password', pwForm, setPwForm, 'password')}
              {inp('Confirmar senha', 'confirm', pwForm, setPwForm, 'password')}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button type="submit" disabled={updateMut.isPending}
              style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              {updateMut.isPending && <Spinner size={16} color="#fff" />} Salvar alteracoes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
