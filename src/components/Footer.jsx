import { Link } from 'react-router-dom'
import { COLORS, FONTS } from '../styles/theme'
import { SITE } from '../data/site'
import { InstagramIcon, LeafIcon } from './ui/icons'

export default function Footer() {
  return (
    <footer style={{ background: COLORS.black, borderTop: `1px solid ${COLORS.lineOnDark}` }}>
      <div style={{
        maxWidth: 1360, margin: '0 auto', padding: '84px 28px 56px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 52,
      }}>
        <div>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: FONTS.serif, color: COLORS.cream, fontSize: 22, fontWeight: 600, letterSpacing: '0.22em' }}>ARBO</div>
            <div style={{ fontFamily: FONTS.sans, color: COLORS.accent, fontSize: 9, letterSpacing: '0.26em', textTransform: 'uppercase', marginTop: 6, opacity: 0.9 }}>
              Wine &amp; Café
            </div>
          </Link>
          <p style={{ fontFamily: FONTS.serif, fontSize: 17, color: COLORS.accent, fontStyle: 'italic', marginTop: 24, lineHeight: 1.55 }}>
            "Entre café, vino<br />y montaña."
          </p>
          <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onDarkMuted, marginTop: 16, letterSpacing: '0.04em' }}>
            Trevelin · Patagonia Argentina
          </p>
          <div style={{ display: 'flex', gap: 16, marginTop: 22 }}>
            <a href={SITE.contact.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram de Arbo Patagonia"
              style={{ color: COLORS.cream, opacity: 0.5, transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}>
              <InstagramIcon />
            </a>
          </div>
        </div>

        <div>
          <h4 style={{ fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.3em', color: COLORS.accent, textTransform: 'uppercase', marginBottom: 22 }}>Navegación</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SITE.footerLinks.map(l => (
              <Link key={l.to} to={l.to} style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.onDarkMuted, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = COLORS.cream}
                onMouseLeave={e => e.currentTarget.style.color = COLORS.onDarkMuted}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{ fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.3em', color: COLORS.accent, textTransform: 'uppercase', marginBottom: 22 }}>Ubicación</h4>
          <p style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.onDarkMuted, lineHeight: 2.1 }}>
            {SITE.location.addressLine}<br />{SITE.location.city}, {SITE.location.province}<br />{SITE.location.country}
          </p>
          <h4 style={{ fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.3em', color: COLORS.accent, textTransform: 'uppercase', margin: '22px 0 12px' }}>Horarios</h4>
          {SITE.hours.map(h => (
            <p key={h.days} style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onDarkMuted, lineHeight: 1.9 }}>
              {h.days}: <span style={{ color: COLORS.cream }}>{h.time}</span>
            </p>
          ))}
        </div>

        <div>
          <h4 style={{ fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.3em', color: COLORS.accent, textTransform: 'uppercase', marginBottom: 22 }}>Contacto</h4>
          <a href={`tel:${SITE.contact.phoneDisplay.replace(/\s/g, '')}`}
            style={{ display: 'block', fontFamily: FONTS.sans, fontSize: 14, color: COLORS.onDarkMuted, marginBottom: 14, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = COLORS.accent}
            onMouseLeave={e => e.currentTarget.style.color = COLORS.onDarkMuted}>
            {SITE.contact.phoneDisplay}
          </a>
          <a href={`https://wa.me/${SITE.contact.whatsapp}`} target="_blank" rel="noopener noreferrer"
            style={{
              fontFamily: FONTS.sans, fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase',
              color: COLORS.black, background: COLORS.accent, padding: '12px 24px', textDecoration: 'none',
              transition: 'background 0.25s', display: 'inline-block', marginTop: 6,
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#a6c1ab'}
            onMouseLeave={e => e.currentTarget.style.background = COLORS.accent}>
            WhatsApp
          </a>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${COLORS.lineOnDark}`, padding: '26px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: FONTS.serif, fontSize: 15, color: COLORS.accent, fontStyle: 'italic', letterSpacing: '0.04em', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <LeafIcon width={13} height={13} /> Arbo no es solo donde tomás un café. <LeafIcon width={13} height={13} />
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
          <p style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.onDarkFaint, letterSpacing: '0.04em' }}>
            © 2026 Arbo Patagonia
          </p>
          <Link to="/privacidad" style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.onDarkFaint, textDecoration: 'none' }}>Privacidad</Link>
          <Link to="/terminos" style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.onDarkFaint, textDecoration: 'none' }}>Términos</Link>
        </div>
      </div>
    </footer>
  )
}
