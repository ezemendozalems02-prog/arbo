import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, CornerDownLeft, ExternalLink, Plus, Search } from 'lucide-react'
import Portal from '../../components/ui/Portal'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { NAV_ENTRIES } from '../nav.config'
import { OS } from '../styles/tokens'

const normalize = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Acciones rápidas: llevan al flujo correspondiente.
const ACTIONS = [
  { id: 'a-venta', label: 'Nueva venta', hint: 'POS', to: '/admin/pos', icon: Plus, keywords: 'cobrar vender ticket' },
  { id: 'a-mesa', label: 'Abrir una mesa', hint: 'Mesas', to: '/admin/mesas', icon: Plus, keywords: 'salon mesa ocupar' },
  { id: 'a-caja', label: 'Abrir o cerrar caja', hint: 'Caja', to: '/admin/caja', icon: Plus, keywords: 'turno efectivo arqueo' },
  { id: 'a-compra', label: 'Nueva compra', hint: 'Compras', to: '/admin/compras', icon: Plus, keywords: 'proveedor pedido' },
  { id: 'a-merma', label: 'Registrar merma', hint: 'Mermas', to: '/admin/mermas', icon: Plus, keywords: 'perdida desperdicio' },
  { id: 'a-campana', label: 'Nueva campaña', hint: 'Marketing', to: '/admin/marketing/campanas', icon: Plus, keywords: 'mail whatsapp mensaje' },
  { id: 'a-sitio', label: 'Ver sitio público', hint: 'Abre en otra pestaña', href: '/', icon: ExternalLink, keywords: 'web pagina' },
]

const PAGES = NAV_ENTRIES.map(e => ({
  id: `p-${e.path}`, label: e.label, hint: e.parent ? `${e.group} · ${e.parent.label}` : e.group,
  to: e.path, icon: e.icon, keywords: e.description ?? '',
}))

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  useLockBodyScroll(open)

  const results = useMemo(() => {
    const q = normalize(query.trim())
    const match = (item) => !q || normalize(`${item.label} ${item.hint} ${item.keywords}`).includes(q)
    return [
      { title: 'Acciones', items: ACTIONS.filter(match) },
      { title: 'Ir a', items: PAGES.filter(match) },
    ].filter(g => g.items.length)
  }, [query])
  const flat = results.flatMap(g => g.items)

  // Al abrir: campo limpio y foco en el input.
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) { setQuery(''); setActive(0) }
  }
  useEffect(() => { if (open) requestAnimationFrame(() => inputRef.current?.focus()) }, [open])

  const run = (item) => {
    onClose()
    if (item.href) window.open(item.href, '_blank', 'noopener')
    else navigate(item.to)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => Math.min(i + 1, flat.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && flat[active]) { e.preventDefault(); run(flat[active]) }
    else if (e.key === 'Escape') { e.preventDefault(); onClose() }
  }

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div className="arbo-os" style={{ background: 'transparent' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
              onClick={onClose}
              style={{ position: 'fixed', inset: 0, zIndex: 1100, background: OS.color.overlay, backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} />
            <motion.div role="dialog" aria-modal="true" aria-label="Buscar en ARBO OS"
              initial={{ opacity: 0, y: -12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
              style={{
                position: 'fixed', zIndex: 1101, top: 'min(14vh, 120px)', left: 0, right: 0, margin: '0 auto',
                width: 'min(600px, calc(100vw - 24px))', background: OS.color.surface, borderRadius: OS.radius.xl,
                boxShadow: OS.shadow.floating, border: `1px solid ${OS.color.line}`, overflow: 'hidden',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 18px', height: 58, borderBottom: `1px solid ${OS.color.line}` }}>
                <Search size={18} color="var(--os-ink-3)" aria-hidden="true" />
                <input ref={inputRef} className="os-bare-input" value={query} onChange={e => { setQuery(e.target.value); setActive(0) }} onKeyDown={onKeyDown}
                  placeholder="Buscá una sección o acción…" aria-label="Buscar" role="combobox" aria-expanded="true"
                  aria-controls="os-palette-list" aria-activedescendant={flat[active] ? `os-cmd-${flat[active].id}` : undefined}
                  style={{ flex: 1, border: 0, outline: 'none', background: 'transparent', fontSize: 15, color: OS.color.ink, height: '100%', boxShadow: 'none' }} />
                <span className="os-kbd">Esc</span>
              </div>

              <div id="os-palette-list" role="listbox" style={{ maxHeight: 'min(56vh, 420px)', overflowY: 'auto', padding: 8 }}>
                {flat.length === 0 && (
                  <p style={{ padding: '28px 12px', textAlign: 'center', fontSize: 13, color: OS.color.ink3 }}>
                    No encontramos nada con "{query}".
                  </p>
                )}
                {results.map(group => (
                  <div key={group.title} style={{ marginBottom: 6 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: OS.color.ink3, padding: '8px 10px 6px' }}>{group.title}</p>
                    {group.items.map(item => {
                      const i = flat.indexOf(item)
                      const Icon = item.icon ?? ArrowRight
                      return (
                        <div key={item.id} id={`os-cmd-${item.id}`} role="option" aria-selected={i === active}
                          className="os-menu-item" data-active={i === active}
                          onMouseMove={() => setActive(i)} onClick={() => run(item)} style={{ cursor: 'pointer' }}>
                          <Icon aria-hidden="true" />
                          <span style={{ flex: 1, fontWeight: 600 }}>{item.label}</span>
                          <span style={{ fontSize: 12, color: OS.color.ink3 }}>{item.hint}</span>
                          {i === active && <CornerDownLeft size={14} color="var(--os-ink-3)" aria-hidden="true" />}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 16, padding: '10px 16px', borderTop: `1px solid ${OS.color.line}`, background: OS.color.surface2, fontSize: 12, color: OS.color.ink3 }}>
                <span><span className="os-kbd">↑</span> <span className="os-kbd">↓</span> navegar</span>
                <span><span className="os-kbd">↵</span> abrir</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  )
}
