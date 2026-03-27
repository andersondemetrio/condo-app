import { AREA_LABELS, AREA_COLORS } from '../../utils/formatters';

export default function AreaBadge({ area }) {
  const color = AREA_COLORS[area] || '#6b7280';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 10px', borderRadius: 99, fontSize: 12, fontWeight: 500,
      background: color + '18', color, border: `1px solid ${color}40`,
    }}>
      {AREA_LABELS[area] || area}
    </span>
  );
}
