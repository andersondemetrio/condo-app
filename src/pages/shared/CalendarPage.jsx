import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCalendar } from '../../services/reservations';
import PageHeader from '../../components/ui/PageHeader';
import useAuthStore from '../../store/useAuthStore';
import { AREA_COLORS } from '../../utils/formatters';

export default function CalendarPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data } = useQuery({
    queryKey: ['calendar', month, year],
    queryFn: () => getCalendar(month, year),
  });

  const calData = data?.data?.data || {};
  const reservations = calData.reservations || [];
  const holidays = calData.holidays || [];

  const events = [
    ...holidays.map((h) => ({
      id: `h-${h.id}`, title: `🔴 ${h.name}`, date: h.date,
      backgroundColor: '#fee2e2', borderColor: '#dc2626', textColor: '#7f1d1d',
      display: 'block',
    })),
    ...reservations.map((r) => ({
      id: r.id,
      title: `${r.area_type === 'COURT' ? '🏀' : r.area_type === 'KIOSK' ? '🏕️' : '🎉'} ${r.user?.name || 'Reserva'}`,
      date: r.date,
      backgroundColor: AREA_COLORS[r.area_type] + '22',
      borderColor: AREA_COLORS[r.area_type],
      textColor: AREA_COLORS[r.area_type],
    })),
  ];

  return (
    <div>
      <PageHeader title="Calendario de Reservas" subtitle="Visao geral de todos os espacos" />
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '1.5rem', overflow: 'hidden' }}>
        <style>{`
          .fc .fc-toolbar-title { font-size: 16px; font-weight: 600; }
          .fc .fc-button { font-size: 13px; }
          .fc .fc-event { cursor: pointer; font-size: 12px; border-radius: 4px; padding: 2px 4px; }
          .fc .fc-daygrid-day:hover { background: #f0f9ff; cursor: pointer; }
        `}</style>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="pt-br"
          events={events}
          headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
          height="auto"
          datesSet={(info) => {
            const d = info.view.currentStart;
            setMonth(d.getMonth() + 1);
            setYear(d.getFullYear());
          }}
          dateClick={(info) => {
            if (user?.role === 'RESIDENT') navigate('/resident/new');
          }}
          eventClick={(info) => {
            const id = info.event.id;
            if (!id.startsWith('h-') && ['ADMIN', 'OPERATOR'].includes(user?.role)) {
              // future: open detail modal
            }
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 20, marginTop: '1rem', flexWrap: 'wrap' }}>
        {[
          { color: '#dc2626', label: 'Feriado' },
          { color: '#16a34a', label: 'Quadra' },
          { color: '#2563eb', label: 'Quiosque' },
          { color: '#9333ea', label: 'Salao de Festas' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280' }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
