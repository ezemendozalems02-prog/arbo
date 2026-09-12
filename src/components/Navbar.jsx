import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const C = {
  dark:  '#1F2E24',
  deep:  '#314D39',
  cream: '#F3EFE7',
  gold:  '#B8A96A',
  mid:   '#4C6B50',
}

const links = [
  { label: 'Inicio',    to: '/' },
  { label: 'Menú',      to: '/menu' },
  { label: 'Take Away', to: '/takeaway' },
  { label: 'Nosotros',  to: '/nuestra-selva' },
  { label: 'Eventos',   to: '/galeria' },
  { label: 'Reservas',  to: '/contacto' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen]         = useState(false)
  const location = useLocation()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => setOpen(false), [location])

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
        transition: 'all 0.45s ease',
        background: scrolled ? 'rgba(31,46,36,0.94)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(76,107,80,0.3)' : 'none',
      }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 76 }}>

          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.1 }}>
              <div style={{ color: C.cream, fontSize: 22, fontWeight: 600, letterSpacing: '0.22em' }}>MOULI</div>
              <div style={{ color: C.gold, fontSize: 9, letterSpacing: '0.32em', textTransform: 'uppercase', marginTop: 3, opacity: 0.85 }}>Café · Cocina · Encuentros</div>
            </div>
          </Link>

          <nav style={{ display: 'flex', gap: 36, alignItems: 'center' }} className="desktop-nav">
            {links.map(l => (
              <Link key={l.to} to={l.to}
                style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 500,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: location.pathname === l.to ? C.gold : C.cream,
                  textDecoration: 'none', transition: 'color 0.25s',
                  borderBottom: location.pathname === l.to ? `1.5px solid ${C.gold}` : '1.5px solid transparent',
                  paddingBottom: 2, opacity: location.pathname === l.to ? 1 : 0.85,
                }}
                onMouseEnter={e => { e.currentTarget.style.color = C.gold; e.currentTarget.style.opacity = '1' }}
                onMouseLeave={e => { e.currentTarget.style.color = location.pathname === l.to ? C.gold : C.cream; e.currentTarget.style.opacity = location.pathname === l.to ? '1' : '0.85' }}
              >{l.label}</Link>
            ))}

            <Link to="/contacto" style={{ textDecoration: 'none' }}>
              <div style={{
                fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
                letterSpacing: '0.16em', textTransform: 'uppercase',
                color: C.dark, background: C.gold,
                padding: '10px 22px', transition: 'all 0.25s', cursor: 'pointer',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#cfc080'}
                onMouseLeave={e => e.currentTarget.style.background = C.gold}
              >
                Reservar
              </div>
            </Link>
          </nav>

          <button onClick={() => setOpen(v => !v)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
            className="hamburger-btn" aria-label="Menú">
            <div style={{ width: 24, height: 1.5, background: C.cream, marginBottom: 6, transition: 'all 0.3s', transform: open ? 'rotate(45deg) translateY(7.5px)' : 'none' }} />
            <div style={{ width: 24, height: 1.5, background: C.cream, marginBottom: 6, opacity: open ? 0 : 1, transition: 'opacity 0.3s' }} />
            <div style={{ width: 24, height: 1.5, background: C.cream, transition: 'all 0.3s', transform: open ? 'rotate(-45deg) translateY(-7.5px)' : 'none' }} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: 'easeInOut' }}
            style={{
              position: 'fixed', inset: 0, zIndex: 998,
              background: 'rgba(31,46,36,0.98)',
              backdropFilter: 'blur(24px)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 40,
            }}
          >
            <div style={{ position: 'absolute', top: 28, left: 28 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", color: C.cream, fontSize: 20, fontWeight: 600, letterSpacing: '0.22em' }}>MOULI</div>
            </div>

            {links.map((l, i) => (
              <motion.div key={l.to}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.06 }}
              >
                <Link to={l.to} style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(32px, 8vw, 44px)',
                  fontWeight: 400,
                  color: location.pathname === l.to ? C.gold : C.cream,
                  textDecoration: 'none',
                  letterSpacing: '0.04em',
                  transition: 'color 0.2s',
                  opacity: location.pathname === l.to ? 1 : 0.8,
                }}>{l.label}</Link>
              </motion.div>
            ))}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              style={{ marginTop: 16 }}>
              <Link to="/contacto" style={{
                fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: C.dark, background: C.gold,
                padding: '14px 36px', textDecoration: 'none', display: 'inline-block',
              }}>
                RESERVAR MESA
              </Link>
            </motion.div>

            <div style={{ position: 'absolute', bottom: 40, display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ width: 28, height: 1, background: 'rgba(243,239,231,0.25)' }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.3em', color: 'rgba(243,239,231,0.4)', textTransform: 'uppercase' }}>Palermo · Buenos Aires</span>
              <div style={{ width: 28, height: 1, background: 'rgba(243,239,231,0.25)' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: block !important; }
        }
      `}</style>
    </>
  )
}
