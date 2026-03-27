import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createReservation } from '../../services/reservations';
import { listHolidays } from '../../services/holidays';
import { listItems } from '../../services/condoItems';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';

const AREAS = [
  { key: 'COURT', label: 'Quadra Esportiva', icon: '🏀', desc: 'Para esportes e atividades fisicas', color: '#16a34a' },
  { key: 'KIOSK', label: 'Quiosque', icon: '🏕️', desc: 'Area ao ar livre para confraternizacoes', color: '#2563eb' },
  { key: 'PARTY_ROOM', label: 'Salao de Festas', icon: '🎉', desc: 'Para festas e eventos (requer aprovacao)', color: '#9333ea' },
];

const STEP_LABELS = ['Escolha a area', 'Detalhe a reserva', 'Confirmar'];

function StepIndicator({ step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '2rem' }}>
      {STEP_LABELS.map((label, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600,
            background: i < step ? '#2563eb' : i === step ? '#2563eb' : '#e5e7eb',
            color: i <= step ? '#fff' : '#9ca3af' }}>
            {i < step ? '✓' : i + 1}
          </div>
          <span style={{ fontSize: 13, fontWeight: i === step ? 600 : 400, color: i === step ? '#111827' : '#9ca3af' }}>{label}</span>
          {i < 2 && <div style={{ width: 40, height: 2, background: i < step ? '#2563eb' : '#e5e7eb', borderRadius: 1 }} />}
        </div>
      ))}
    </div>
  );
}

export default function NewReservationPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [area, setArea] = useState(null);
  const [form, setForm] = useState({ date: '', start_time: '', end_time: '', guests: 0, notes: '', items: [] });

  const now = new Date();
  const { data: holidayData } = useQuery({
    queryKey: ['holidays', now.getMonth() + 1, now.getFullYear()],
    queryFn: () => listHolidays({ month: now.getMonth() + 1, year: now.getFullYear() }),
  });

  const { data: itemsData } = useQuery({
    queryKey: ['condo-items-date', form.date],
    queryFn: () => listItems(form.date),
    enabled: !!form.date,
  });

  const holidayDates = (holidayData?.data?.data || []).map((h) => h.date);
  const condoItems = itemsData?.data?.data || [];

  const createMut = useMutation({
    mutationFn: createReservation,
    onSuccess: () => { toast.success(area === 'PARTY_ROOM' ? 'Pre-reserva enviada! Aguarde aprovacao.' : 'Reserva confirmada!'); navigate('/resident'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Erro ao criar reserva'),
  });

  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const btnStyle = (active) => ({
    padding: '10px 24px', borderRadius: 8, fontWeight: 500, fontSize: 14, cursor: 'pointer',
    border: active ? 'none' : '1px solid #e5e7eb',
    background: active ? '#2563eb' : '#fff',
    color: active ? '#fff' : '#374151',
  });

  const inp = (label, key, type = 'text', extra = {}) => (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>{label}</label>
      <input value={form[key]} onChange={setF(key)} type={type} {...extra}
        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, boxSizing: 'border-box' }} />
    </div>
  );

  const isHoliday = form.date && holidayDates.includes(form.date);
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div>
      <PageHeader title="Nova Reserva" />
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <StepIndicator step={step} />

        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {AREAS.map((a) => (
              <div key={a.key} onClick={() => { setArea(a.key); setStep(1); }} style={{
                background: '#fff', border: `2px solid ${area === a.key ? a.color : '#e5e7eb'}`,
                borderRadius: 14, padding: '1.25rem 1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16,
                transition: 'border-color .15s, box-shadow .15s',
                boxShadow: area === a.key ? `0 0 0 4px ${a.color}22` : 'none',
              }}>
                <div style={{ fontSize: 36 }}>{a.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{a.label}</div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>{a.desc}</div>
                  {a.key === 'PARTY_ROOM' && <div style={{ marginTop: 6, fontSize: 12, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 99, display: 'inline-block' }}>Requer aprovacao do porteiro</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 1 && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '1.75rem' }}>
            <div style={{ marginBottom: '1.25rem', padding: '10px 14px', background: '#eff6ff', borderRadius: 8, fontSize: 14, color: '#1e40af', fontWeight: 500 }}>
              {AREAS.find((a) => a.key === area)?.icon} {AREAS.find((a) => a.key === area)?.label}
            </div>

            {inp('Data *', 'date', 'date', { min: minDate })}

            {isHoliday && (
              <div style={{ background: '#fee2e2', border: '1px solid #dc2626', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#7f1d1d', marginBottom: '1rem' }}>
                ⚠️ Esta data e um feriado e nao pode ser reservada.
              </div>
            )}

            {area === 'COURT' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {inp('Hora inicio *', 'start_time', 'time')}
                {inp('Hora fim *', 'end_time', 'time')}
              </div>
            )}

            {(area === 'KIOSK' || area === 'PARTY_ROOM') && (
              inp('N° de convidados', 'guests', 'number', { min: 0 })
            )}

            {area === 'PARTY_ROOM' && condoItems.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 8 }}>Itens do condominio</label>
                {condoItems.map((item) => {
                  const sel = form.items.find((i) => i.condo_item_id === item.id);
                  return (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ fontSize: 14 }}>{item.name} <span style={{ color: '#9ca3af', fontSize: 12 }}>(disp: {item.available_quantity ?? item.total_quantity})</span></span>
                      <input type="number" min="0" max={item.available_quantity ?? item.total_quantity} value={sel?.quantity_requested || 0}
                        onChange={(e) => {
                          const qty = Number(e.target.value);
                          setForm((f) => ({
                            ...f,
                            items: qty > 0
                              ? [...f.items.filter((i) => i.condo_item_id !== item.id), { condo_item_id: item.id, quantity_requested: qty }]
                              : f.items.filter((i) => i.condo_item_id !== item.id),
                          }));
                        }}
                        style={{ width: 70, padding: '6px 8px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 14 }}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {inp('Observacoes', 'notes', 'text')}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <button onClick={() => setStep(0)} style={btnStyle(false)}>← Voltar</button>
              <button onClick={() => setStep(2)} disabled={!form.date || isHoliday} style={btnStyle(true)}>Revisar →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '1.75rem' }}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: 17 }}>Confirmar reserva</h3>

            {[
              ['Area', AREAS.find((a) => a.key === area)?.label],
              ['Data', formatDate(form.date)],
              form.start_time && ['Horario', `${form.start_time} – ${form.end_time}`],
              form.guests > 0 && ['Convidados', form.guests],
              form.notes && ['Obs', form.notes],
            ].filter(Boolean).map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6', fontSize: 14 }}>
                <span style={{ color: '#6b7280' }}>{label}</span>
                <span style={{ fontWeight: 500 }}>{value}</span>
              </div>
            ))}

            {area === 'PARTY_ROOM' && (
              <div style={{ marginTop: '1rem', padding: '10px 14px', background: '#fef3c7', borderRadius: 8, fontSize: 13, color: '#92400e' }}>
                ℹ️ O Salao de Festas requer aprovacao do porteiro ou sindico. Voce sera notificado por e-mail.
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <button onClick={() => setStep(1)} style={btnStyle(false)}>← Editar</button>
              <button
                onClick={() => createMut.mutate({ area_type: area, date: form.date, start_time: form.start_time || undefined, end_time: form.end_time || undefined, guests: Number(form.guests), notes: form.notes, items: form.items })}
                disabled={createMut.isPending}
                style={{ ...btnStyle(true), display: 'flex', alignItems: 'center', gap: 8 }}>
                {createMut.isPending && <Spinner size={16} color="#fff" />}
                {area === 'PARTY_ROOM' ? 'Enviar pre-reserva' : 'Confirmar reserva'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(d) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}
