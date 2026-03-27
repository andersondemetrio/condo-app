import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { listItems, createItem, updateItem } from '../../services/condoItems';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import { Plus, Package, Pencil } from 'lucide-react';

export default function ItemsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: '', total_quantity: '' });

  const { data, isLoading } = useQuery({ queryKey: ['condo-items'], queryFn: () => listItems() });

  const createMut = useMutation({
    mutationFn: createItem,
    onSuccess: () => { toast.success('Item cadastrado!'); qc.invalidateQueries(['condo-items']); setShowForm(false); setForm({ name: '', total_quantity: '' }); },
    onError: (e) => toast.error(e.response?.data?.message || 'Erro'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...d }) => updateItem(id, d),
    onSuccess: () => { toast.success('Item atualizado!'); qc.invalidateQueries(['condo-items']); setEditTarget(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'Erro'),
  });

  const items = data?.data?.data || [];

  const FormModal = ({ onClose, onSave, initial = { name: '', total_quantity: '' }, loading, title }) => {
    const [d, setD] = useState(initial);
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 14, padding: '2rem', width: 380 }}>
          <h2 style={{ margin: '0 0 1.5rem', fontSize: 18 }}>{title}</h2>
          {[['Nome do item *', 'name', 'text'], ['Quantidade total *', 'total_quantity', 'number']].map(([label, key, type]) => (
            <div key={key} style={{ marginBottom: '.85rem' }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>{label}</label>
              <input value={d[key]} onChange={(e) => setD((x) => ({ ...x, [key]: e.target.value }))} type={type} min="0"
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}>Cancelar</button>
            <button onClick={() => onSave(d)} disabled={loading || !d.name || !d.total_quantity}
              style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              {loading && <Spinner size={16} color="#fff" />} Salvar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <PageHeader title="Itens do Condominio" subtitle="Cadeiras, mesas, utensílios" action={
        <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 500, fontSize: 14 }}>
          <Plus size={16} /> Novo Item
        </button>
      } />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
        {isLoading ? <Spinner /> : items.length === 0 ? <EmptyState icon={Package} title="Nenhum item cadastrado" /> :
          items.map((item) => (
            <div key={item.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={20} color="#2563eb" />
                </div>
                <button onClick={() => setEditTarget(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 4 }}>
                  <Pencil size={15} />
                </button>
              </div>
              <div style={{ marginTop: 12, fontWeight: 600, fontSize: 15 }}>{item.name}</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{item.total_quantity}</span> unidades
              </div>
            </div>
          ))}
      </div>

      {showForm && <FormModal title="Novo Item" onClose={() => setShowForm(false)} onSave={(d) => createMut.mutate({ name: d.name, total_quantity: Number(d.total_quantity) })} loading={createMut.isPending} />}
      {editTarget && <FormModal title="Editar Item" initial={editTarget} onClose={() => setEditTarget(null)} onSave={(d) => updateMut.mutate({ id: editTarget.id, name: d.name, total_quantity: Number(d.total_quantity) })} loading={updateMut.isPending} />}
    </div>
  );
}
