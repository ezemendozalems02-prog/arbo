import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronsLeft, ChevronsRight, ExternalLink, LogOut } from 'lucide-react'
import { ADMIN_NAV, isItemActive, itemHref } from '../nav.config'
import { useCurrentStaff } from '../hooks/useCurrentStaff'
import { OS } from '../styles/tokens'
import Tooltip from '../ui/Tooltip'
import Avatar from '../ui/Avatar'
import { BranchLines } from '../ui/ArboSprout'

function Brand({ collapsed }) {
  return (
    <Link to="/admin" aria-label="ARBO OS — inicio" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', minWidth: 0 }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, flexShrink: 0,
        borderRadius: 11, background: 'rgba(185,154,98,0.14)', border: '1px solid rgba(185,154,98,0.3)',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--os-gold)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 21v-9" /><path d="M12 15c-3.5 0-6-2.5-6-6 3.5 0 6 2.5 6 6Z" /><path d="M12 12c0-3.5 2.5-6 6-6 0 3.5-2.5 6-6 6Z" />
        </svg>
      </span>
      {!collapsed && (
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: OS.font.display, fontSize: 22, fontWeight: 600, letterSpacing: '0.14em', color: OS.color.inkInverse }}>ARBO</span>
          <span style={{
            fontFamily: OS.font.ui, fontSize: 9, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase',
            color: OS.color.gold, border: '1px solid rgba(185,154,98,0.4)', borderRadius: 5, padding: '2px 5px 1px',
            position: 'relative', top: -3,
          }}>OS</span>
        </span>
      )}
    </Link>
  )
}

function NavItem({ item, collapsed, pathname, onNavigate }) {
  const active = isItemActive(item, pathname)
  const [manualOpen, setManualOpen] = useState(null)
  const hasChildren = Boolean(item.children?.length)
  const open = hasChildren && !collapsed && (manualOpen ?? active)
  const Icon = item.icon
  const href = itemHref(item)

  const link = (
    <NavLink to={href} end={item.path === '/admin'} onClick={onNavigate}
      className={`os-nav-link${active ? ' is-active' : ''}`}
      aria-current={active && pathname === href ? 'page' : undefined}
      aria-label={collapsed ? item.label : undefined}
      style={collapsed ? { justifyContent: 'center', padding: 0 } : { paddingRight: hasChildren ? 36 : 12 }}>
      <Icon aria-hidden="true" />
      {!collapsed && <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>}
    </NavLink>
  )

  return (
    <li style={{ position: 'relative' }}>
      <Tooltip label={item.label} disabled={!collapsed}>{link}</Tooltip>
      {hasChildren && !collapsed && (
        <button type="button" onClick={() => setManualOpen(!open)} aria-expanded={open}
          aria-label={`${open ? 'Ocultar' : 'Mostrar'} secciones de ${item.label}`}
          style={{
            position: 'absolute', right: 4, top: 4, width: 30, height: 30, borderRadius: 8, border: 0,
            background: 'transparent', color: OS.color.inkInverse3, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
          <ChevronDown size={15} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms var(--os-ease)' }} />
        </button>
      )}
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
            style={{ listStyle: 'none', margin: 0, padding: '2px 0 4px', overflow: 'hidden' }}>
            {[...(item.path ? [{ path: item.path, label: item.overviewLabel ?? item.label }] : []), ...item.children].map(child => (
              <li key={child.path}>
                <NavLink to={child.path} end onClick={onNavigate} className="os-nav-sublink">{child.label}</NavLink>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  )
}

export default function AdminSidebar({ collapsed = false, onToggleCollapse, onNavigate, mobile }) {
  const { pathname } = useLocation()
  const { name: staffName, role, branchName, signOut } = useCurrentStaff()

  return (
    <nav aria-label="Navegación de ARBO OS" data-tour="sidebar" style={{
      position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      background: `linear-gradient(180deg, ${OS.color.forest} 0%, ${OS.color.deep} 100%)`, color: OS.color.inkInverse,
    }}>
      <BranchLines color="var(--os-gold)" opacity={0.08}
        style={{ position: 'absolute', left: -40, bottom: -10, width: 360, pointerEvents: 'none' }} />

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', gap: 8,
        height: 'var(--os-topbar-h)', padding: collapsed ? '0 12px' : '0 14px 0 20px', flexShrink: 0,
      }}>
        <Brand collapsed={collapsed} />
        {!mobile && !collapsed && (
          <button type="button" onClick={onToggleCollapse} className="os-icon-btn" aria-label="Colapsar menú"
            style={{ color: OS.color.inkInverse3, width: 32, height: 32 }}>
            <ChevronsLeft />
          </button>
        )}
      </div>

      <div style={{ position: 'relative', flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: collapsed ? '8px 12px 16px' : '8px 12px 16px 12px' }}>
        {ADMIN_NAV.map(group => (
          <div key={group.group} style={{ marginBottom: collapsed ? 8 : 18 }}>
            {collapsed
              ? <div style={{ height: 1, background: OS.color.lineInverse, margin: '8px 10px 10px' }} />
              : <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: OS.color.inkInverse3, padding: '6px 12px 8px' }}>{group.group}</p>}
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {group.items.map(item => (
                <NavItem key={item.label} item={item} collapsed={collapsed} pathname={pathname} onNavigate={onNavigate} />
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={{ position: 'relative', flexShrink: 0, borderTop: `1px solid ${OS.color.lineInverse}`, padding: collapsed ? '12px' : '12px 14px' }}>
        {collapsed ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Tooltip label="Expandir menú">
              <button type="button" onClick={onToggleCollapse} className="os-icon-btn" aria-label="Expandir menú" style={{ color: OS.color.inkInverse2 }}>
                <ChevronsRight />
              </button>
            </Tooltip>
            <Tooltip label={`${staffName} · ${role}`}><span tabIndex={0} style={{ display: 'inline-flex', borderRadius: '50%' }}><Avatar name={staffName} size={32} /></span></Tooltip>
            <Tooltip label="Cerrar sesión">
              <button type="button" onClick={signOut} className="os-icon-btn" aria-label="Cerrar sesión" style={{ color: OS.color.inkInverse3 }}>
                <LogOut />
              </button>
            </Tooltip>
          </div>
        ) : (
          <>
            <a href="/" target="_blank" rel="noopener noreferrer" className="os-nav-link" style={{ height: 34 }}>
              <ExternalLink aria-hidden="true" />
              <span>Ver sitio público</span>
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px 2px' }}>
              <Avatar name={staffName} size={32} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: OS.color.inkInverse, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{staffName}</p>
                <p style={{ fontSize: 11, color: OS.color.inkInverse3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{role} · {branchName}</p>
              </div>
              <Tooltip label="Cerrar sesión" side="top" inline>
                <button type="button" onClick={signOut} className="os-icon-btn" aria-label="Cerrar sesión" style={{ color: OS.color.inkInverse3, width: 32, height: 32 }}>
                  <LogOut />
                </button>
              </Tooltip>
            </div>
          </>
        )}
      </div>
    </nav>
  )
}
