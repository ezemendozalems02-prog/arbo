const PALETTE = ['#173A2C', '#527A63', '#B99A62', '#2E5E7A', '#7A6233', '#4B5750']

function initials(name = '') {
  return name.replace(/\(.*?\)/g, '').trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || '·'
}

// Color estable por nombre: el mismo cliente siempre tiene el mismo avatar.
function colorFor(name = '') {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return PALETTE[h % PALETTE.length]
}

export default function Avatar({ name, size = 36 }) {
  return (
    <span aria-hidden="true" style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      width: size, height: size, borderRadius: '50%', background: colorFor(name), color: '#F7F4EE',
      fontSize: Math.round(size * 0.38), fontWeight: 700, letterSpacing: '0.02em',
    }}>
      {initials(name)}
    </span>
  )
}
