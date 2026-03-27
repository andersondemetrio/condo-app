export default function Spinner({ size = 24, color = '#3b82f6' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `3px solid ${color}30`,
      borderTopColor: color,
      animation: 'spin 0.7s linear infinite',
    }} />
  );
}
// inject keyframe once
if (!document.getElementById('spin-style')) {
  const s = document.createElement('style');
  s.id = 'spin-style';
  s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(s);
}
