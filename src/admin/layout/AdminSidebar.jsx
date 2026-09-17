import { NavLink } from 'react-router-dom'
import { COLORS, FONTS } from '../../styles/theme'
import { ADMIN_NAV } from '../nav.config'
import { LeafIcon } from '../../components/ui/icons'

export default function AdminSidebar({ onNavigate }) {
  return (
    <nav style={{ height: '100%', display: 'flex', flexDirection: 'column', background: COLORS.greenDark }}>
      <div style={{ padding: '26px 24px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${COLORS.lineOnDark}` }}>
        <LeafIcon width={20} height={20} style={{ color: COLORS.accent }} />
        <div>
          <p style={{ fontFamily: FONTS.serif, fontSize: 20, color: COLORS.cream, lineHeight: 1 }}>ARBO OS</p>
          <p style={{ fontFamily: FONTS.sans, fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', color: COLORS.onDarkFaint, marginTop: 4 }}>Panel administrativo</p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 12px 24px' }}>
        {ADMIN_NAV.map((group, i) => (
          <div key={group.group ?? `g${i}`} style={{ marginBottom: 18 }}>
            {group.group && (
              <p style={{ fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: COLORS.onDarkFaint, padding: '0 12px', marginBottom: 8 }}>
                {group.group}
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {group.items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin'}
                  onClick={onNavigate}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                    padding: '10px 12px', fontFamily: FONTS.sans, fontSize: 13, fontWeight: 500,
                    textDecoration: 'none',
                    color: isActive ? COLORS.cream : COLORS.onDarkMuted,
                    background: isActive ? 'rgba(244,240,228,0.08)' : 'transparent',
                    borderLeft: `2px solid ${isActive ? COLORS.accent : 'transparent'}`,
                    transition: 'background 0.15s ease, color 0.15s ease',
                  })}>
                  <span>{item.label}</span>
                  {!item.available && (
                    <span style={{ fontFamily: FONTS.sans, fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onDarkFaint, border: `1px solid ${COLORS.lineOnDark}`, borderRadius: 2, padding: '2px 6px' }}>
                      Pronto
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  )
}
