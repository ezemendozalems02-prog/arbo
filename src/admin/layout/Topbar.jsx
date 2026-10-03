import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Bell, ChevronRight, ClipboardList, ExternalLink, LogOut, Menu, PackageX, Search } from 'lucide-react'
import { useInventory } from '../../context/InventoryContext'
import { getStockStatus } from '../../services/inventoryCostService'
import { getDashboardPendingOrders } from '../../services/dashboardService'
import { useCurrentStaff } from '../hooks/useCurrentStaff'
import ConnectivityBanner from '../components/ConnectivityBanner'
import { MOCK_NOW } from '../../mock/config'
import { getBranchStatus } from '../utils/branch'
import { OS } from '../styles/tokens'
import Dropdown from '../ui/Dropdown'
import Avatar from '../ui/Avatar'
import EmptyState from '../ui/EmptyState'

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

function Breadcrumb({ crumbs, compact }) {
  const shown = compact ? crumbs.slice(-1) : crumbs
  return (
    <nav aria-label="Ubicación" style={{ minWidth: 0 }}>
      <ol style={{ display: 'flex', alignItems: 'center', gap: 6, listStyle: 'none', margin: 0, padding: 0, minWidth: 0 }}>
        {shown.map((c, i) => {
          const last = i === shown.length - 1
          return (
            <li key={`${c.label}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              {c.to && !last
                ? <Link to={c.to} style={{ fontSize: 13, color: OS.color.ink3, textDecoration: 'none' }}>{c.label}</Link>
                : <span aria-current={last ? 'page' : undefined} style={{
                    fontSize: last && compact ? 15 : 13, fontWeight: last ? 700 : 500,
                    color: last ? OS.color.ink : OS.color.ink3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{c.label}</span>}
              {!last && <ChevronRight size={14} color="var(--os-ink-3)" aria-hidden="true" style={{ flexShrink: 0 }} />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function Notifications() {
  const { items } = useInventory()
  const stockAlerts = useMemo(() => items
    .map(item => ({ item, status: getStockStatus(item) }))
    .filter(a => a.status !== 'NORMAL')
    .sort((a, b) => (a.status === 'AGOTADO' ? -1 : 1) - (b.status === 'AGOTADO' ? -1 : 1)), [items])
  const pendingCount = useMemo(() => getDashboardPendingOrders(999).length, [])
  const total = stockAlerts.length + (pendingCount ? 1 : 0)

  return (
    <Dropdown width={340} label="Notificaciones" trigger={(p) => (
      <button type="button" className="os-icon-btn" onClick={p.toggle} aria-expanded={p['aria-expanded']}
        aria-label={total ? `Notificaciones: ${total} pendientes` : 'Notificaciones'}>
        <Bell />
        {total > 0 && (
          <span aria-hidden="true" style={{
            position: 'absolute', top: 6, right: 6, minWidth: 16, height: 16, padding: '0 4px', borderRadius: 999,
            background: OS.color.danger, color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 0 2px var(--os-bg)',
          }}>{total}</span>
        )}
      </button>
    )}>
      <p style={{ fontSize: 13, fontWeight: 700, padding: '8px 10px 6px' }}>Notificaciones</p>
      {total === 0 ? (
        <EmptyState compact title="Todo en orden" description="No hay alertas de stock ni pedidos esperando." />
      ) : (
        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
          {pendingCount > 0 && (
            <Link to="/admin" data-close-dropdown className="os-menu-item">
              <ClipboardList aria-hidden="true" style={{ color: 'var(--os-info)' }} />
              <span style={{ flex: 1 }}><strong>{pendingCount} pedidos</strong> esperando ser preparados o entregados</span>
            </Link>
          )}
          {stockAlerts.map(({ item, status }) => {
            const Icon = status === 'AGOTADO' ? PackageX : AlertTriangle
            return (
              <Link key={item.id} to={`/admin/inventario/${item.id}`} data-close-dropdown className="os-menu-item">
                <Icon aria-hidden="true" style={{ color: status === 'AGOTADO' ? 'var(--os-danger)' : 'var(--os-warning)' }} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <strong>{item.name}</strong>
                  <span style={{ display: 'block', fontSize: 12, color: OS.color.ink3 }}>{status === 'AGOTADO' ? 'Sin stock' : 'Stock por debajo del mínimo'}</span>
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </Dropdown>
  )
}

function ProfileMenu({ extraItems }) {
  const { name, role, email, branchName, signOut } = useCurrentStaff()
  return (
    <Dropdown width={250} label="Perfil" trigger={(p) => (
      <button type="button" onClick={p.toggle} aria-expanded={p['aria-expanded']} aria-label="Menú de perfil"
        style={{ display: 'inline-flex', border: 0, background: 'none', padding: 2, borderRadius: '50%', cursor: 'pointer' }}>
        <Avatar name={name} size={34} />
      </button>
    )}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px 12px', borderBottom: `1px solid ${OS.color.line}`, marginBottom: 6 }}>
        <Avatar name={name} size={38} />
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700 }}>{name}</p>
          <p style={{ fontSize: 12, color: OS.color.ink3 }}>{role} · {branchName}</p>
          {email && <p style={{ fontSize: 11, color: OS.color.ink3, overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</p>}
        </div>
      </div>
      {extraItems}
      <a href="/" target="_blank" rel="noopener noreferrer" className="os-menu-item" data-close-dropdown>
        <ExternalLink aria-hidden="true" /> Ver sitio público
      </a>
      <div style={{ height: 1, background: OS.color.line, margin: '6px 4px' }} />
      <button type="button" className="os-menu-item" data-close-dropdown onClick={signOut}>
        <LogOut aria-hidden="true" /> Cerrar sesión
      </button>
    </Dropdown>
  )
}

export default function Topbar({ meta, isMobile, onOpenMenu, onOpenSearch, profileItems }) {
  const { branchName } = useCurrentStaff()
  const branch = { ...getBranchStatus(MOCK_NOW), name: branchName }

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50, height: 'var(--os-topbar-h)', boxSizing: 'border-box',
      display: 'flex', alignItems: 'center', gap: 12, padding: isMobile ? '0 12px' : '0 28px',
      background: 'rgba(247,244,238,0.86)', backdropFilter: 'saturate(140%) blur(14px)', WebkitBackdropFilter: 'saturate(140%) blur(14px)',
      borderBottom: `1px solid ${OS.color.line}`,
    }}>
      {isMobile && (
        <button type="button" className="os-icon-btn" onClick={onOpenMenu} aria-label="Abrir menú">
          <Menu />
        </button>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <Breadcrumb crumbs={meta.crumbs} compact={isMobile} />
      </div>

      {isMobile ? (
        <button type="button" className="os-icon-btn" onClick={onOpenSearch} aria-label="Buscar">
          <Search />
        </button>
      ) : (
        <button type="button" onClick={onOpenSearch} data-tour="search"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10, height: 38, width: 260, padding: '0 8px 0 12px',
            border: `1px solid ${OS.color.line}`, borderRadius: 11, background: OS.color.surface, cursor: 'pointer',
            color: OS.color.ink3, fontSize: 13, boxShadow: OS.shadow.sm,
          }}>
          <Search size={16} aria-hidden="true" />
          <span style={{ flex: 1, textAlign: 'left' }}>Buscar o ir a…</span>
          <span className="os-kbd">{isMac ? '⌘' : 'Ctrl'}</span><span className="os-kbd">K</span>
        </button>
      )}

      {!isMobile && (
        <span title={`Sucursal ${branch.name}`} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, height: 32, padding: '0 12px', borderRadius: 999,
          background: OS.color.surface3, fontSize: 12, fontWeight: 600, color: OS.color.ink2, whiteSpace: 'nowrap',
        }}>
          <span aria-hidden="true" style={{
            width: 7, height: 7, borderRadius: '50%',
            background: branch.open ? 'var(--os-success)' : 'var(--os-ink-3)',
            boxShadow: branch.open ? '0 0 0 3px rgba(47,107,74,0.15)' : 'none',
          }} />
          {branch.name} · {branch.open ? 'Abierto' : 'Cerrado'}
        </span>
      )}

      <ConnectivityBanner />
      <Notifications />
      <ProfileMenu extraItems={profileItems} />
    </header>
  )
}
