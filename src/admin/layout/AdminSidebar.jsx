import { NavLink } from 'react-router-dom'
import { COLORS, FONTS } from '../../styles/theme'
import { ADMIN_NAV } from '../nav.config'
import { LeafIcon } from '../../components/ui/icons'
import { useAuth } from '../../context/AuthContext'

export default function AdminSidebar({ onNavigate }) {
  const { user, profile, currentOrg, currentBranch, userRole, signOut } = useAuth()

  const displayName = profile 
    ? `${profile.first_name} ${profile.last_name}`.trim() 
    : user?.email?.split('@')[0] || 'Operador'

  const orgName = currentOrg?.name || 'ARBO OS'
  const branchName = currentBranch?.name || 'Sucursal Principal'
  const roleLabel = userRole || 'USUARIO'

  return (
    <nav style={{ height: '100%', display: 'flex', flexDirection: 'column', background: COLORS.greenDark }}>
      {/* Header con información de la Organización */}
      <div style={{ padding: '22px 20px', borderBottom: `1px solid ${COLORS.lineOnDark}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LeafIcon width={22} height={22} style={{ color: COLORS.accent }} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: FONTS.serif, fontSize: 19, color: COLORS.cream, lineHeight: 1.1, margin: 0, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {orgName}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              <p style={{ fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.onDarkMuted, margin: 0 }}>
                {branchName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación de Módulos */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px 18px' }}>
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
                    padding: '9px 12px', fontFamily: FONTS.sans, fontSize: 13, fontWeight: 500,
                    textDecoration: 'none',
                    color: isActive ? COLORS.cream : COLORS.onDarkMuted,
                    background: isActive ? 'rgba(244,240,228,0.08)' : 'transparent',
                    borderLeft: `2px solid ${isActive ? COLORS.accent : 'transparent'}`,
                    borderRadius: '0 4px 4px 0',
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

      {/* Footer del Sidebar con Usuario Activo y Logout */}
      <div style={{
        padding: '14px 16px',
        borderTop: `1px solid ${COLORS.lineOnDark}`,
        background: 'rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <p style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600, color: COLORS.cream, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </p>
            <span style={{
              fontSize: 9,
              fontWeight: 700,
              padding: '1px 5px',
              borderRadius: 3,
              background: COLORS.accent,
              color: COLORS.greenDark,
              letterSpacing: '0.05em',
            }}>
              {roleLabel}
            </span>
          </div>
          <p style={{ fontFamily: FONTS.sans, fontSize: 10, color: COLORS.onDarkFaint, margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email || 'Conectado'}
          </p>
        </div>

        <button
          type="button"
          onClick={signOut}
          title="Cerrar sesión segura"
          style={{
            background: 'transparent',
            border: `1px solid ${COLORS.lineOnDark}`,
            borderRadius: 6,
            padding: '6px 8px',
            color: COLORS.onDarkMuted,
            fontSize: 11,
            cursor: 'pointer',
            fontFamily: FONTS.sans,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            transition: 'color 0.15s, border-color 0.15s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#F87171'; e.currentTarget.style.borderColor = '#F87171' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.onDarkMuted; e.currentTarget.style.borderColor = COLORS.lineOnDark }}
        >
          Salir
        </button>
      </div>
    </nav>
  )
}
