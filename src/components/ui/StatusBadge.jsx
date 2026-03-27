import { STATUS_LABELS, STATUS_COLORS } from '../../utils/formatters';

export default function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.CANCELLED;
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 99,
      fontSize: 12, fontWeight: 500,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
    }}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
