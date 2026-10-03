import { Suspense, useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useIsMobile, usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import Portal from '../../components/ui/Portal'
import { getPageMeta } from '../nav.config'
import { OS, TYPE } from '../styles/tokens'
import { DashboardSkeleton, PageSkeleton } from '../ui/Skeleton'
import AdminSidebar from './AdminSidebar'
import Topbar from './Topbar'
import CommandPalette from './CommandPalette'

const COLLAPSE_KEY = 'arbo_os_sidebar_collapsed'
const readCollapsed = () => { try { return localStorage.getItem(COLLAPSE_KEY) === '1' } catch { return false } }

// Pantallas que manejan su propio encabezado/lienzo.
const FULL_BLEED = ['/admin/cocina']
const OWN_HEADER = ['/admin', '/admin/cocina']

export default function AdminLayout({ children }) {
  const { pathname } = useLocation()
  const isMobile = useIsMobile()
  const reduced = usePrefersReducedMotion()
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const meta = getPageMeta(pathname)

  useEffect(() => { document.title = `${meta.title} | ARBO OS` }, [meta.title])

  const toggleCollapsed = useCallback(() => {
    setCollapsed(c => {
      try { localStorage.setItem(COLLAPSE_KEY, c ? '0' : '1') } catch { /* sin storage */ }
      return !c
    })
  }, [])

  // Al navegar se cierran el drawer mobile y la paleta.
  const [prevPath, setPrevPath] = useState(pathname)
  if (pathname !== prevPath) {
    setPrevPath(pathname)
    setDrawerOpen(false)
  }

  useLockBodyScroll(isMobile && drawerOpen)

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(o => !o)
      } else if (e.key === 'Escape' && drawerOpen) {
        setDrawerOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  const sidebarW = collapsed ? 'var(--os-sidebar-w-collapsed)' : 'var(--os-sidebar-w)'
  const fullBleed = FULL_BLEED.includes(pathname)
  const showHeader = !OWN_HEADER.includes(pathname)

  return (
    <div className="arbo-os" style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <aside style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width: sidebarW, zIndex: 40,
          transition: 'width var(--os-dur) var(--os-ease)',
        }}>
          <AdminSidebar collapsed={collapsed} onToggleCollapse={toggleCollapsed} />
        </aside>
      )}

      {isMobile && (
        <Portal>
          <AnimatePresence>
            {drawerOpen && (
              <div className="arbo-os" style={{ background: 'transparent' }}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawerOpen(false)}
                  style={{ position: 'fixed', inset: 0, background: OS.color.overlay, zIndex: 650 }} />
                <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                  transition={{ type: 'tween', duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
                  style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 'min(300px, 86vw)', zIndex: 651, boxShadow: OS.shadow.floating }}>
                  <AdminSidebar mobile onNavigate={() => setDrawerOpen(false)} />
                </motion.aside>
              </div>
            )}
          </AnimatePresence>
        </Portal>
      )}

      <div style={{
        marginLeft: isMobile ? 0 : sidebarW, minWidth: 0, minHeight: '100vh', display: 'flex', flexDirection: 'column',
        transition: 'margin-left var(--os-dur) var(--os-ease)',
      }}>
        <Topbar meta={meta} isMobile={isMobile} onOpenMenu={() => setDrawerOpen(true)} onOpenSearch={() => setPaletteOpen(true)} />

        <main id="os-main" style={{
          flex: 1, width: '100%', boxSizing: 'border-box',
          ...(fullBleed ? {} : { maxWidth: 'var(--os-content-max)', margin: '0 auto', padding: isMobile ? '20px 16px 72px' : '28px 32px 80px' }),
        }}>
          {/* Solo fade-in al entrar: un exit animado mostraría la página nueva
              desvaneciéndose, porque <Routes> ya resolvió la ruta destino. */}
          <motion.div key={pathname}
              initial={reduced ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }}>
              {showHeader && !fullBleed && (
                <header style={{ marginBottom: 24 }}>
                  <h1 style={{ ...TYPE.title, fontSize: isMobile ? 26 : 30 }}>{meta.title}</h1>
                  {meta.description && <p style={{ ...TYPE.body, marginTop: 4, color: OS.color.ink3 }}>{meta.description}</p>}
                </header>
              )}
              <Suspense fallback={pathname === '/admin' ? <DashboardSkeleton /> : <PageSkeleton />}>
                {children}
              </Suspense>
          </motion.div>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}
