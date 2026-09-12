import { SITE } from '../data/site'
import { COLORS } from '../styles/theme'

const WhatsAppIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.35a9.9 9.9 0 0 0 4.62 1.14h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.03c-.24.68-1.4 1.3-1.93 1.37-.5.07-1.12.1-1.8-.11-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.79-4.15-4.94-4.34-.14-.2-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.27-.29.58-.36.77-.36.2 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.14.11.31.02.5-.09.19-.14.31-.27.48-.13.16-.28.36-.4.48-.13.13-.27.28-.11.55.16.27.7 1.16 1.51 1.87 1.04.93 1.91 1.22 2.18 1.36.27.14.43.11.58-.07.16-.18.68-.79.86-1.06.18-.27.36-.22.6-.13.24.09 1.53.72 1.79.85.27.13.44.2.51.31.07.11.07.63-.17 1.31Z"/>
  </svg>
)

export default function WhatsAppButton({ lifted = false }) {
  const url = `https://wa.me/${SITE.contact.whatsapp}?text=${encodeURIComponent(SITE.whatsappMessage)}`
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
      className="arbo-whatsapp-btn"
      style={{
        position: 'fixed',
        right: 20,
        bottom: lifted ? 92 : 20,
        zIndex: 350,
        width: 52,
        height: 52,
        borderRadius: '50%',
        background: COLORS.greenDark,
        color: COLORS.cream,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 10px 30px rgba(12,16,20,0.35)',
        transition: 'transform 0.2s ease, background 0.2s ease, bottom 0.25s ease',
        textDecoration: 'none',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.background = COLORS.green }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = COLORS.greenDark }}
    >
      <WhatsAppIcon />
    </a>
  )
}
