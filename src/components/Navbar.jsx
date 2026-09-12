import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { COLORS, FONTS } from '../styles/theme'
import { SITE } from '../data/site'
import { useCartContext } from '../context/CartContext'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'
import { CartIcon, MenuIcon, CloseIcon, InstagramIcon } from './ui/icons'
import Button from './ui/Button'
import Portal from './ui/Portal'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { itemCount, setDrawerOpen } = useCartContext()

  // Cierra el menú fullscreen al cambiar de ruta — ajustado durante el
  // render (patrón "adjusting state when props change") en vez de en un
  // efecto, para evitar un render en cascada innecesario.
  const [prevPathname, setPrevPathname] = useState(location.pathname)
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname)
    setOpen(false)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useLockBodyScroll(open)

  return (
    <>
      <header
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 900,
          transition: 'background 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease, height 0.35s ease',
          background: scrolled ? 'rgba(31,64,47,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(14px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
          borderBottom: `1px solid ${scrolled ? 'rgba(244,240,228,0.14)' : 'transparent'}`,
        }}
      >
        <div style={{
          maxWidth: 1440, margin: '0 auto', padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: scrolled ? 68 : 84, transition: 'height 0.35s ease',
        }}>
          <Link to="/" style={{ textDecoration: 'none' }} aria-label="Arbo Patagonia — inicio">
            <div style={{ fontFamily: FONTS.serif, lineHeight: 1.05 }}>
              <div style={{ color: COLORS.cream, fontSize: 21, fontWeight: 600, letterSpacing: '0.24em' }}>ARBO</div>
              <div style={{ color: COLORS.accent, fontSize: 8.5, letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: 3, opacity: 0.9 }}>
                Wine &amp; Café
              </div>
            </div>
          </Link>

          <nav aria-label="Navegación principal" className="arbo-desktop-nav" style={{ display: 'flex', gap: 30, alignItems: 'center' }}>
            {SITE.nav.map(l => {
              const active = location.pathname === l.to
              return (
                <Link key={l.to} to={l.to}
                  style={{
                    fontFamily: FONTS.sans, fontSize: 11, fontWeight: 500,
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: active ? COLORS.accent : COLORS.cream,
                    textDecoration: 'none', paddingBottom: 3,
                    borderBottom: active ? `1.5px solid ${COLORS.accent}` : '1.5px solid transparent',
                    opacity: active ? 1 : 0.86, transition: 'opacity 0.2s, border-color 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = active ? '1' : '0.86' }}
                >
                  {l.label}
                </Link>
              )
            })}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <button onClick={() => setDrawerOpen(true)} aria-label="Ver carrito"
              style={{ position: 'relative', background: 'none', border: 'none', color: COLORS.cream, cursor: 'pointer', padding: 10, display: 'flex' }}>
              <CartIcon />
              {itemCount > 0 && (
                <span style={{
                  position: 'absolute', top: -2, right: -2, background: COLORS.accent, color: COLORS.black,
                  fontFamily: FONTS.sans, fontSize: 10, fontWeight: 700, borderRadius: '50%',
                  width: 17, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{itemCount}</span>
              )}
            </button>

            <span className="arbo-desktop-nav">
              <Button to="/reservas" variant="solid-dark" size="sm">Reservar</Button>
            </span>

            <button onClick={() => setOpen(v => !v)} aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open}
              className="arbo-hamburger" style={{ display: 'none', background: 'none', border: 'none', color: COLORS.cream, cursor: 'pointer', padding: 10 }}>
              {open ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      <Portal>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 950, background: 'rgba(12,16,20,0.98)',
              backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 28, padding: 24,
              overflowY: 'auto',
            }}
          >
            <div style={{ position: 'absolute', top: 26, left: 24, fontFamily: FONTS.serif, color: COLORS.cream, fontSize: 20, letterSpacing: '0.22em' }}>ARBO</div>

            {SITE.nav.map((l, i) => (
              <motion.div key={l.to}
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 + i * 0.05 }}
              >
                <Link to={l.to} style={{
                  fontFamily: FONTS.serif, fontSize: 'clamp(28px, 8vw, 40px)', fontWeight: 400,
                  color: location.pathname === l.to ? COLORS.accent : COLORS.cream,
                  textDecoration: 'none', letterSpacing: '0.02em',
                }}>
                  {l.label}
                </Link>
              </motion.div>
            ))}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} style={{ marginTop: 12 }}>
              <Button to="/reservas" variant="solid-dark">Reservar</Button>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
              style={{ position: 'absolute', bottom: 36, display: 'flex', gap: 20, alignItems: 'center' }}>
              <a href={SITE.contact.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram de Arbo Patagonia"
                style={{ color: COLORS.onDarkMuted }}>
                <InstagramIcon />
              </a>
              <a href={`https://wa.me/${SITE.contact.whatsapp}`} target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.onDarkMuted, textDecoration: 'none' }}>
                WhatsApp
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </Portal>

      <style>{`
        @media (max-width: 900px) {
          .arbo-desktop-nav { display: none !important; }
          .arbo-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  )
}
