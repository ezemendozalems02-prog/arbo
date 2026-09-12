import { Link } from 'react-router-dom'

const C = {
  dark:  '#1A2820',
  deep:  '#314D39',
  cream: '#F3EFE7',
  gold:  '#B8A96A',
  mid:   '#4C6B50',
  muted: 'rgba(243,239,231,0.5)',
}

const IgIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
  </svg>
)

const LeafIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.5 }}>
    <path d="M17 8C8 10 5.9 16.17 3.82 19.34L5.71 21c1-1.66 2.13-3.26 3.51-4.53 1.32-1.21 2.82-2.1 4.64-2.5-.74 1.64-1.9 3.03-3.38 4.03L12 20l4-6.5C17.84 11.84 18.5 10 17 8z"/>
  </svg>
)

export default function Footer() {
  return (
    <footer style={{ background: C.dark, borderTop: '1px solid rgba(76,107,80,0.2)' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '80px 28px 52px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 52 }}>

        <div>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", color: C.cream, fontSize: 22, fontWeight: 600, letterSpacing: '0.22em', lineHeight: 1.2 }}>MOULI</div>
            <div style={{ fontFamily: "'Inter', sans-serif", color: C.gold, fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', marginTop: 5, opacity: 0.8 }}>Café · Cocina · Encuentros</div>
          </Link>
          <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 18, color: C.gold, fontStyle: 'italic', marginTop: 24, lineHeight: 1.55 }}>
            "Una pausa en la jungla<br />de Palermo."
          </p>
          <div style={{ display: 'flex', gap: 16, marginTop: 22 }}>
            <a href="https://instagram.com/mouli.palermo" target="_blank" rel="noopener noreferrer"
              style={{ color: C.cream, opacity: 0.45, transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.45'}>
              <IgIcon />
            </a>
          </div>
        </div>

        <div>
          <h4 style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.3em', color: C.gold, textTransform: 'uppercase', marginBottom: 22 }}>Ubicación</h4>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: C.muted, lineHeight: 2.1 }}>
            Thames 1786<br />Palermo, CABA<br />Buenos Aires, Argentina
          </p>
          <a href="tel:+541144445678"
            style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: 14, color: C.muted, marginTop: 14, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = C.gold}
            onMouseLeave={e => e.currentTarget.style.color = C.muted}>
            11 4444-5678
          </a>
        </div>

        <div>
          <h4 style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.3em', color: C.gold, textTransform: 'uppercase', marginBottom: 22 }}>Horarios</h4>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: C.muted, lineHeight: 2.1 }}>
            Martes a Domingo<br />
            <span style={{ color: C.cream, fontWeight: 500 }}>09:00 — 00:00</span><br />
            Lunes: cerrado
          </p>
        </div>

        <div>
          <h4 style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.3em', color: C.gold, textTransform: 'uppercase', marginBottom: 22 }}>Reservas</h4>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: C.muted, lineHeight: 1.85, marginBottom: 22 }}>
            Escribinos por WhatsApp.<br />Te respondemos enseguida.
          </p>
          <a href="https://wa.me/541144445678" target="_blank" rel="noopener noreferrer"
            style={{
              fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: C.dark, background: '#4C6B50',
              padding: '12px 24px', textDecoration: 'none',
              transition: 'background 0.25s', display: 'inline-block',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#5a7d5e'}
            onMouseLeave={e => e.currentTarget.style.background = '#4C6B50'}>
            WhatsApp
          </a>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(76,107,80,0.15)', padding: '28px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 16, color: C.gold, fontStyle: 'italic', letterSpacing: '0.08em', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <LeafIcon /> La jungla escondida en Palermo. <LeafIcon />
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: 'rgba(243,239,231,0.25)', letterSpacing: '0.06em' }}>
          © {new Date().getFullYear()} MOULI — Palermo, Buenos Aires
        </p>
      </div>
    </footer>
  )
}
