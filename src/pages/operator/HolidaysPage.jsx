import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { listHolidays, createHoliday, deleteHoliday } from '../../services/holidays';
import PageHeader from '../../components/ui/PageHeader';
import ConfirmModal from '../../components/ui/ConfirmModal';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import { formatDate } from '../../utils/formatters';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';

const TYPE_LABELS = { NATIONAL: 'Nacional', LOCAL: 'Local', CUSTOM: 'Personalizado' };
const TYPE_COLORS = { NATIONAL: '#dc2626', LOCAL: '#d97706', CUSTOM: '#7c3aed' };

export default function HolidaysPage() {
  const qc = useQueryClient();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', date: '', type: 'CUSTOM', recurring: false });

  const { data, isLoading } = useQuery({
    queryKey: ['holidays', month, year],
    queryFn: () => listHolidays({ month, year }),
  });

  const createMut = useMutation({
    mutationFn: createHoliday,
    onSuccess: () => { toast.success('Feriado cadastrado!'); qc.invalidateQueries(['holidays']); setShowForm(false); setForm({ name: '', date: '', type: 'CUSTOM', recurring: false }); },
    onError: (e) => toast.error(e.response?.data?.message || 'Erro ao cadastrar'),
  });

  const deleteMut = useMutation({
    mutationFn: deleteHoliday,
    onSuccess: () => { toast.success('Feriado removido'); qc.invalidateQueries(['holidays']); setDeleteTarget(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'Erro'),
  });

  const holidays = data?.data?.data || [];
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  const inp = (label, key, type = 'text') => (
    <div style={{ marginBottom: '.85rem' }}>
      <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>{label}</label>
      <input value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} type={type}
        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, boxSizing: 'border-box' }} />
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Feriados"
        subtitle="Datas bloqueadas para reservas"
        action={
          <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontWeight: 500, fontSize: 14 }}>
            <Plus size={16} /> Novo Feriado
          </button>
        }
      />

      <div style={{ display: 'flex', gap: 10, marginBottom: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14 }}>
          {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14 }}>
          {[2025, 2026, 2027, 2028].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {isLoading ? <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}><Spinner /></div>
          : holidays.length === 0 ? <EmptyState icon={AlertTriangle} title="Nenhum feriado neste mes" />
          : holidays.map((h) => (
            <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: (TYPE_COLORS[h.type] || '#6b7280') + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={20} color={TYPE_COLORS[h.type] || '#6b7280'} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{h.name}</div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                    {formatDate(h.date)} &bull;
                    <span style={{ marginLeft: 6, padding: '1px 8px', borderRadius: 99, fontSize: 11, fontWeight: 500, background: (TYPE_COLORS[h.type] || '#6b7280') + '18', color: TYPE_COLORS[h.type] || '#6b7280' }}>
                      {TYPE_LABELS[h.type]}
                    </span>
                    {h.recurring && <span style={{ marginLeft: 6, fontSize: 12, color: '#9ca3af' }}>↻ Recorrente</span>}
                  </div>
                </div>
              </div>
              <button onClick={() => setDeleteTarget(h)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 6 }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '2rem', width: 420 }}>
            <h2 style={{ margin: '0 0 1.5rem', fontSize: 18 }}>Novo Feriado</h2>
            {inp('Nome do feriado *', 'name')}
            {inp('Data *', 'date', 'date')}
            <div style={{ marginBottom: '.85rem' }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Tipo</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14 }}>
                <option value="NATIONAL">Nacional</option>
                <option value="LOCAL">Local</option>
                <option value="CUSTOM">Personalizado</option>
              </select>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', marginBottom: '1.5rem' }}>
              <input type="checkbox" checked={form.recurring} onChange={(e) => setForm((f) => ({ ...f, recurring: e.target.checked }))} />
              Recorrente (gerar para ano seguinte tambem)
            </label>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => createMut.mutate(form)} disabled={createMut.isPending || !form.name || !form.date}
                style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                {createMut.isPending && <Spinner size={16} color="#fff" />} Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal open={!!deleteTarget} title="Remover feriado" message={`Remover "${deleteTarget?.name}" do calendario?`} onConfirm={() => deleteMut.mutate(deleteTarget.id)} onCancel={() => setDeleteTarget(null)} loading={deleteMut.isPending} danger />
    </div>
  );
}
