import { ROLE_LABELS, ROLE_COLORS } from '../../utils/formatters';

export default function RoleTag({ role }) {
  const c = ROLE_COLORS[role] || ROLE_COLORS.RESIDENT;
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 99,
      fontSize: 11, fontWeight: 500,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
    }}>
      {ROLE_LABELS[role] || role}
    </span>
  );
}
