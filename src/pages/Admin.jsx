import { useState, useCallback } from 'react'
import { useSite } from '../context/SiteContext'
import { motion, AnimatePresence } from 'framer-motion'

const PASS = 'lacan2025'

// ─── Tokens ───────────────────────────────────────────────
const C = {
  bg:     '#111110',
  card:   '#1a1a18',
  input:  '#0f0f0e',
  border: 'rgba(196,163,90,0.15)',
  gold:   '#C4A35A',
  cream:  '#F2EBD9',
  muted:  '#6b7280',
  subtle: '#9ca3af',
  verde:  '#2D4A3E',
  danger: '#ef4444',
}
const f = { serif: "'Cormorant Garamond', serif", sans: "'Inter', sans-serif" }

const base = {
  width: '100%', background: C.input, border: `1px solid ${C.border}`,
  color: C.cream, padding: '11px 14px', fontFamily: f.sans, fontSize: 14,
  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
  borderRadius: 0,
}

// ─── Primitives ───────────────────────────────────────────
function Inp({ label, hint, type = 'text', value, onChange, placeholder, mono }) {
  const [fo, setFo] = useState(false)
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <label style={{ display: 'block', fontFamily: f.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: fo ? C.gold : C.muted, marginBottom: 7, transition: 'color 0.2s' }}>{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        onFocus={e => { setFo(true); e.target.style.borderColor = C.gold }}
        onBlur={e => { setFo(false); e.target.style.borderColor = C.border }}
        style={{ ...base, fontFamily: mono ? 'monospace' : f.sans }} />
      {hint && <p style={{ fontFamily: f.sans, fontSize: 11, color: C.muted, marginTop: 5 }}>{hint}</p>}
    </div>
  )
}

function Txt({ label, value, onChange, rows = 3, placeholder }) {
  const [fo, setFo] = useState(false)
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <label style={{ display: 'block', fontFamily: f.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: fo ? C.gold : C.muted, marginBottom: 7, transition: 'color 0.2s' }}>{label}</label>}
      <textarea value={value} onChange={onChange} rows={rows} placeholder={placeholder}
        onFocus={e => { setFo(true); e.target.style.borderColor = C.gold }}
        onBlur={e => { setFo(false); e.target.style.borderColor = C.border }}
        style={{ ...base, resize: 'vertical' }} />
    </div>
  )
}

function Sel({ label, value, onChange, options }) {
  const [fo, setFo] = useState(false)
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <label style={{ display: 'block', fontFamily: f.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: fo ? C.gold : C.muted, marginBottom: 7, transition: 'color 0.2s' }}>{label}</label>}
      <select value={value} onChange={onChange}
        onFocus={e => { setFo(true); e.target.style.borderColor = C.gold }}
        onBlur={e => { setFo(false); e.target.style.borderColor = C.border }}
        style={{ ...base, cursor: 'pointer', appearance: 'none', background: '#0f0f0e' }}>
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o} style={{ background: '#111' }}>{o.label ?? o}</option>)}
      </select>
    </div>
  )
}

const BADGE_OPTS = [
  { value: '', label: 'Sin badge' },
  { value: 'Estrella', label: 'Estrella' },
  { value: 'Signature', label: 'Signature' },
  { value: 'Para 2',   label: 'Para 2' },
  { value: 'Popular',  label: 'Popular' },
  { value: 'Nuevo',    label: 'Nuevo' },
  { value: 'Veggie',   label: 'Veggie' },
]

function Btn({ children, onClick, variant = 'gold', type = 'button', full, small, style: ex = {} }) {
  const v = {
    gold:    { background: C.gold,   color: '#111', border: 'none' },
    outline: { background: 'transparent', color: C.gold, border: `1px solid ${C.border}` },
    verde:   { background: C.verde,  color: C.cream, border: 'none' },
    danger:  { background: 'rgba(239,68,68,0.1)', color: C.danger, border: '1px solid rgba(239,68,68,0.2)' },
    ghost:   { background: 'transparent', color: C.muted, border: `1px solid rgba(255,255,255,0.07)` },
    dashed:  { background: 'transparent', color: C.gold, border: `1px dashed rgba(196,163,90,0.28)` },
  }
  return (
    <button type={type} onClick={onClick} style={{ fontFamily: f.sans, fontSize: small ? 11 : 12, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', padding: small ? '7px 12px' : '10px 22px', cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap', width: full ? '100%' : 'auto', ...v[variant], ...ex }}
      onMouseEnter={e => { if (variant === 'gold') e.currentTarget.style.background = '#d4b36a' }}
      onMouseLeave={e => { e.currentTarget.style.background = v[variant].background }}>
      {children}
    </button>
  )
}

function Card({ children, accent, style: ex = {} }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${accent ? 'rgba(196,163,90,0.3)' : C.border}`, borderTop: accent ? `2px solid ${C.gold}` : undefined, padding: '26px 28px', ...ex }}>
      {children}
    </div>
  )
}

function SectionHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div style={{ marginBottom: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 14 }}>
      <div>
        {eyebrow && <p style={{ fontFamily: f.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: C.gold, marginBottom: 8 }}>{eyebrow}</p>}
        <h2 style={{ fontFamily: f.serif, fontSize: 34, color: C.cream, lineHeight: 1.1, marginBottom: subtitle ? 8 : 0 }}>{title}</h2>
        {subtitle && <p style={{ fontFamily: f.sans, fontSize: 13, color: C.muted, lineHeight: 1.6, maxWidth: 520 }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

function Divider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '28px 0 20px' }}>
      <div style={{ flex: 1, height: 1, background: C.border }} />
      {label && <span style={{ fontFamily: f.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.muted, whiteSpace: 'nowrap' }}>{label}</span>}
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  )
}

function Toast({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div initial={{ opacity: 0, y: 14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 14 }}
          style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 9999, background: C.gold, color: '#111', padding: '13px 26px', fontFamily: f.sans, fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', boxShadow: '0 16px 50px rgba(0,0,0,0.5)' }}>
          ✓ &nbsp; Cambios guardados
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ImgInput({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <label style={{ display: 'block', fontFamily: f.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.muted, marginBottom: 7 }}>{label}</label>
      {value && <img src={value} alt={label} onError={e => e.target.style.display = 'none'} style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block', border: `1px solid ${C.border}`, borderBottom: 'none' }} />}
      <input value={value} onChange={e => onChange(e.target.value)} placeholder="https://..."
        onFocus={e => e.target.style.borderColor = C.gold} onBlur={e => e.target.style.borderColor = C.border}
        style={{ ...base, fontSize: 12, fontFamily: 'monospace' }} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// SECTIONS
// ═══════════════════════════════════════════════════════════

// ── DASHBOARD ─────────────────────────────────────────────
function Dashboard({ data, setSection }) {
  const totalItems = Object.values(data.menu).reduce((a, c) => a + c.items.length, 0)
  const visibleMenu = Object.values(data.menu).reduce((a, c) => a + c.items.filter(i => i.visible !== false).length, 0)
  const visibleGallery = data.gallery.filter(p => p.visible !== false).length
  const stats = [
    { label: 'Platos en carta',   value: totalItems,       sub: `${visibleMenu} visibles`,               icon: '🍽️', section: 'menu' },
    { label: 'Fotos en galería',  value: data.gallery.length, sub: `${visibleGallery} visibles`,          icon: '📸', section: 'galeria' },
    { label: 'Promos activas',    value: data.promos.filter(p => p.visible).length, sub: 'en portada',   icon: '🏷️', section: 'promos' },
    { label: 'Imágenes del sitio',value: Object.keys(data.images).length, sub: 'hero, about, música…',   icon: '🖼️', section: 'imagenes' },
  ]
  const actions = [
    { icon: '🍽️', label: 'Editar precios del menú',   sub: 'Actualizá precios, descripciones y badges',   section: 'menu' },
    { icon: '🏷️', label: 'Gestionar promos',           sub: 'Editá las promos que aparecen en la home',    section: 'promos' },
    { icon: '📸', label: 'Gestionar galería',           sub: 'Agregá, ocultá o eliminá fotos',              section: 'galeria' },
    { icon: '🖼️', label: 'Cambiar imágenes',           sub: 'Hero, about, música, nosotros, barrio',       section: 'imagenes' },
    { icon: 'ℹ️', label: 'Información del local',      sub: 'Teléfono, horarios, redes sociales',          section: 'info' },
  ]
  return (
    <div>
      <SectionHeader eyebrow="Panel de control" title="Bienvenido" subtitle="Editá todo el contenido del sitio en tiempo real. Los cambios se guardan en el navegador y se aplican al instante." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 44 }}>
        {stats.map((s, i) => (
          <motion.button key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            onClick={() => setSection(s.section)}
            style={{ background: C.card, border: `1px solid ${C.border}`, borderTop: `2px solid ${C.gold}`, padding: '22px 18px', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'border-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.gold}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.borderTop = `2px solid ${C.gold}` }}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>{s.icon}</div>
            <div style={{ fontFamily: f.serif, fontSize: 38, color: C.gold, lineHeight: 1, marginBottom: 6 }}>{s.value}</div>
            <div style={{ fontFamily: f.sans, fontSize: 12, color: C.cream, marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontFamily: f.sans, fontSize: 11, color: C.muted }}>{s.sub}</div>
          </motion.button>
        ))}
      </div>
      <p style={{ fontFamily: f.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.muted, marginBottom: 14 }}>Accesos rápidos</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 10, marginBottom: 36 }}>
        {actions.map((a, i) => (
          <motion.button key={a.section} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 + i * 0.06 }}
            onClick={() => setSection(a.section)}
            style={{ background: C.card, border: `1px solid ${C.border}`, padding: '18px 20px', cursor: 'pointer', textAlign: 'left', width: '100%', display: 'flex', alignItems: 'flex-start', gap: 14, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.background = 'rgba(196,163,90,0.04)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card }}>
            <span style={{ fontSize: 20, marginTop: 1 }}>{a.icon}</span>
            <div>
              <div style={{ fontFamily: f.sans, fontSize: 13, fontWeight: 600, color: C.cream, marginBottom: 3 }}>{a.label}</div>
              <div style={{ fontFamily: f.sans, fontSize: 12, color: C.muted }}>{a.sub}</div>
            </div>
          </motion.button>
        ))}
      </div>
      <div style={{ background: 'rgba(196,163,90,0.04)', border: `1px solid rgba(196,163,90,0.18)`, borderLeft: `3px solid ${C.gold}`, padding: '16px 20px' }}>
        <p style={{ fontFamily: f.sans, fontSize: 13, color: C.subtle, lineHeight: 1.7 }}>
          <strong style={{ color: C.gold }}>Tip:</strong> Los cambios se guardan en localStorage y se reflejan instantáneamente en el sitio. Presioná <strong style={{ color: C.cream }}>💾 Guardar</strong> en cada sección para confirmar.
        </p>
      </div>
    </div>
  )
}

// ── MENÚ EDITOR ───────────────────────────────────────────
function MenuEditor() {
  const { data, updateMenu } = useSite()
  const [menu, setMenu] = useState(() => JSON.parse(JSON.stringify(data.menu)))
  const [cat, setCat] = useState(Object.keys(data.menu)[0])
  const [adding, setAdding] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', badge: '' })

  const set = (c, i, field, val) => {
    const m = JSON.parse(JSON.stringify(menu))
    m[c].items[i][field] = val
    setMenu(m)
  }
  const del = (c, i) => { const m = JSON.parse(JSON.stringify(menu)); m[c].items.splice(i, 1); setMenu(m) }
  const tog = (c, i) => { const m = JSON.parse(JSON.stringify(menu)); m[c].items[i].visible = !m[c].items[i].visible; setMenu(m) }
  const add = () => {
    if (!newItem.name.trim()) return
    const m = JSON.parse(JSON.stringify(menu))
    m[cat].items.push({ ...newItem, id: `n_${Date.now()}`, visible: true })
    setMenu(m); setNewItem({ name: '', description: '', price: '', badge: '' }); setAdding(false)
  }

  const items = menu[cat]?.items || []
  return (
    <div>
      <SectionHeader eyebrow="Contenido" title="Editor de Carta" subtitle="Editá precios, nombres y descripciones. Ocultá temporalmente un plato sin borrarlo."
        action={<Btn onClick={() => updateMenu(menu)}>💾 Guardar carta</Btn>} />

      {/* Category tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, marginBottom: 28, overflowX: 'auto' }}>
        {Object.keys(menu).map(k => (
          <button key={k} onClick={() => setCat(k)} style={{ fontFamily: f.sans, fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: cat === k ? C.gold : C.muted, background: 'none', border: 'none', borderBottom: cat === k ? `2px solid ${C.gold}` : '2px solid transparent', padding: '13px 18px', cursor: 'pointer', whiteSpace: 'nowrap', marginBottom: -1, transition: 'color 0.2s' }}>
            {menu[k].label}
          </button>
        ))}
      </div>

      <p style={{ fontFamily: f.sans, fontSize: 12, color: C.muted, marginBottom: 20 }}>
        <span style={{ color: C.cream, fontWeight: 600 }}>{items.length}</span> platos &nbsp;·&nbsp;
        <span style={{ color: C.gold, fontWeight: 600 }}>{items.filter(i => i.visible !== false).length}</span> visibles
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((item, idx) => (
          <div key={item.id || idx} style={{ background: item.visible !== false ? C.card : 'rgba(17,17,16,0.5)', border: `1px solid ${item.visible !== false ? C.border : 'rgba(255,255,255,0.04)'}`, borderLeft: `3px solid ${item.visible !== false ? C.gold : 'rgba(255,255,255,0.06)'}`, padding: '18px 20px', opacity: item.visible !== false ? 1 : 0.45, transition: 'all 0.2s' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 96px auto auto', gap: 10, alignItems: 'center', marginBottom: 10 }}>
              <input value={item.name} onChange={e => set(cat, idx, 'name', e.target.value)}
                onFocus={e => e.target.style.borderColor = C.gold} onBlur={e => e.target.style.borderColor = C.border}
                style={{ ...base, fontFamily: f.serif, fontSize: 15, fontWeight: 600, padding: '9px 12px' }} />
              <input value={item.price} onChange={e => set(cat, idx, 'price', e.target.value)}
                onFocus={e => e.target.style.borderColor = C.gold} onBlur={e => e.target.style.borderColor = C.border}
                placeholder="0000" style={{ ...base, fontFamily: f.serif, fontSize: 16, color: C.gold, textAlign: 'center', padding: '9px 10px' }} />
              <button onClick={() => tog(cat, idx)} style={{ fontFamily: f.sans, fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 12px', border: 'none', cursor: 'pointer', background: item.visible !== false ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)', color: item.visible !== false ? '#4ade80' : '#ef4444', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
                {item.visible !== false ? '● Vis.' : '○ Oct.'}
              </button>
              <button onClick={() => del(cat, idx)} style={{ background: 'none', border: 'none', color: '#374151', cursor: 'pointer', fontSize: 20, padding: '4px 6px', lineHeight: 1, transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = C.danger}
                onMouseLeave={e => e.currentTarget.style.color = '#374151'}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px', gap: 10, alignItems: 'flex-start' }}>
              <textarea value={item.description} rows={2} onChange={e => set(cat, idx, 'description', e.target.value)}
                onFocus={e => e.target.style.borderColor = C.gold} onBlur={e => e.target.style.borderColor = C.border}
                style={{ ...base, resize: 'none', fontSize: 12, color: C.muted }} />
              <select value={item.badge || ''} onChange={e => set(cat, idx, 'badge', e.target.value)}
                onFocus={e => e.target.style.borderColor = C.gold} onBlur={e => e.target.style.borderColor = C.border}
                style={{ ...base, fontSize: 11, padding: '8px 10px', cursor: 'pointer', background: '#0f0f0e' }}>
                {BADGE_OPTS.map(o => <option key={o.value} value={o.value} style={{ background: '#111' }}>{o.label}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Add new */}
      <div style={{ marginTop: 10 }}>
        <AnimatePresence>
          {adding ? (
            <motion.div key="form" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: C.card, border: `1px solid ${C.gold}`, borderTop: `2px solid ${C.gold}`, padding: '24px 20px', marginBottom: 10 }}>
              <p style={{ fontFamily: f.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.gold, marginBottom: 18 }}>Nuevo plato — {menu[cat]?.label}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Inp label="Nombre" value={newItem.name} onChange={e => setNewItem(v => ({ ...v, name: e.target.value }))} placeholder="Ej: Provoleta a la parrilla" />
                <Inp label="Precio (sin $)" value={newItem.price} onChange={e => setNewItem(v => ({ ...v, price: e.target.value }))} placeholder="3500" />
              </div>
              <Txt label="Descripción" value={newItem.description} onChange={e => setNewItem(v => ({ ...v, description: e.target.value }))} rows={2} />
              <Sel label="Badge" value={newItem.badge} onChange={e => setNewItem(v => ({ ...v, badge: e.target.value }))} options={BADGE_OPTS} />
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn onClick={add}>✓ Agregar plato</Btn>
                <Btn variant="ghost" onClick={() => setAdding(false)}>Cancelar</Btn>
              </div>
            </motion.div>
          ) : (
            <button onClick={() => setAdding(true)} style={{ width: '100%', background: 'transparent', border: `1px dashed rgba(196,163,90,0.22)`, color: C.gold, padding: '14px', fontFamily: f.sans, fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s', marginTop: 4 }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(196,163,90,0.05)'; e.currentTarget.style.borderColor = C.gold }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(196,163,90,0.22)' }}>
              + Agregar plato a {menu[cat]?.label}
            </button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── PROMOS EDITOR ─────────────────────────────────────────
function PromosEditor() {
  const { data, updatePromos } = useSite()
  const [promos, setPromos] = useState(() => JSON.parse(JSON.stringify(data.promos)))

  const set = (i, field, val) => { const p = [...promos]; p[i] = { ...p[i], [field]: val }; setPromos(p) }
  const del = (i) => setPromos(promos.filter((_, j) => j !== i))
  const add = () => setPromos([...promos, { id: `pr_${Date.now()}`, label: '', price: '', visible: true }])

  return (
    <div>
      <SectionHeader eyebrow="Home" title="Promos del Día" subtitle="Estas promos aparecen en la sección de la home. Podés editarlas, ocultarlas o agregar nuevas."
        action={<Btn onClick={() => updatePromos(promos)}>💾 Guardar promos</Btn>} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {promos.map((p, i) => (
          <div key={p.id} style={{ background: C.card, border: `1px solid ${p.visible ? C.border : 'rgba(255,255,255,0.04)'}`, borderLeft: `3px solid ${p.visible ? C.gold : 'rgba(255,255,255,0.06)'}`, padding: '16px 18px', opacity: p.visible ? 1 : 0.45, transition: 'all 0.2s' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px auto auto', gap: 10, alignItems: 'center' }}>
              <input value={p.label} onChange={e => set(i, 'label', e.target.value)} placeholder="Nombre de la promo"
                onFocus={e => e.target.style.borderColor = C.gold} onBlur={e => e.target.style.borderColor = C.border}
                style={{ ...base, fontFamily: f.serif, fontSize: 15, padding: '9px 12px' }} />
              <input value={p.price} onChange={e => set(i, 'price', e.target.value)} placeholder="0000"
                onFocus={e => e.target.style.borderColor = C.gold} onBlur={e => e.target.style.borderColor = C.border}
                style={{ ...base, fontFamily: f.serif, fontSize: 16, color: C.gold, textAlign: 'center', padding: '9px 10px' }} />
              <button onClick={() => set(i, 'visible', !p.visible)} style={{ fontFamily: f.sans, fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 12px', border: 'none', cursor: 'pointer', background: p.visible ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)', color: p.visible ? '#4ade80' : '#ef4444', whiteSpace: 'nowrap' }}>
                {p.visible ? '● Vis.' : '○ Oct.'}
              </button>
              <button onClick={() => del(i)} style={{ background: 'none', border: 'none', color: '#374151', cursor: 'pointer', fontSize: 20, padding: '4px 6px', lineHeight: 1, transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = C.danger}
                onMouseLeave={e => e.currentTarget.style.color = '#374151'}>×</button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={add} style={{ width: '100%', background: 'transparent', border: `1px dashed rgba(196,163,90,0.22)`, color: C.gold, padding: '14px', fontFamily: f.sans, fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', marginTop: 8, transition: 'all 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(196,163,90,0.05)'; e.currentTarget.style.borderColor = C.gold }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(196,163,90,0.22)' }}>
        + Nueva promo
      </button>
    </div>
  )
}

// ── GALERÍA EDITOR ────────────────────────────────────────
const GALLERY_CATS = ['Ambiente', 'Café', 'Comida', 'Música', 'Barrio', 'Bar', 'Pastelería']

function GaleriaEditor() {
  const { data, updateGallery } = useSite()
  const [gallery, setGallery] = useState(() => JSON.parse(JSON.stringify(data.gallery)))
  const [adding, setAdding] = useState(false)
  const [newPhoto, setNewPhoto] = useState({ src: '', title: '', cat: 'Ambiente' })

  const tog = (i) => { const g = [...gallery]; g[i] = { ...g[i], visible: !g[i].visible }; setGallery(g) }
  const del = (i) => setGallery(gallery.filter((_, j) => j !== i))
  const upd = (i, field, val) => { const g = [...gallery]; g[i] = { ...g[i], [field]: val }; setGallery(g) }
  const add = () => {
    if (!newPhoto.src.trim()) return
    setGallery([...gallery, { ...newPhoto, id: `g_${Date.now()}`, visible: true }])
    setNewPhoto({ src: '', title: '', cat: 'Ambiente' }); setAdding(false)
  }

  return (
    <div>
      <SectionHeader eyebrow="Galería" title="Gestión de Fotos" subtitle="Agregá, ocultá o eliminá fotos. Las fotos marcadas como visibles aparecen en la galería pública."
        action={<Btn onClick={() => updateGallery(gallery)}>💾 Guardar galería</Btn>} />

      <p style={{ fontFamily: f.sans, fontSize: 12, color: C.muted, marginBottom: 24 }}>
        <span style={{ color: C.cream, fontWeight: 600 }}>{gallery.length}</span> fotos totales &nbsp;·&nbsp;
        <span style={{ color: C.gold, fontWeight: 600 }}>{gallery.filter(p => p.visible !== false).length}</span> visibles
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {gallery.map((photo, i) => (
          <motion.div key={photo.id} layout style={{ background: C.card, border: `1px solid ${photo.visible !== false ? C.border : 'rgba(255,255,255,0.04)'}`, overflow: 'hidden', opacity: photo.visible !== false ? 1 : 0.45, transition: 'all 0.25s' }}>
            <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
              <img src={photo.src} alt={photo.title} onError={e => e.target.style.display = 'none'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
                <button onClick={() => tog(i)} style={{ fontFamily: f.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '5px 10px', border: 'none', cursor: 'pointer', background: photo.visible !== false ? 'rgba(74,222,128,0.85)' : 'rgba(239,68,68,0.85)', color: '#fff' }}>
                  {photo.visible !== false ? '● Vis' : '○ Oct'}
                </button>
                <button onClick={() => del(i)} style={{ background: 'rgba(239,68,68,0.85)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16, padding: '5px 9px', lineHeight: 1 }}>×</button>
              </div>
            </div>
            <div style={{ padding: '12px 14px' }}>
              <input value={photo.title} onChange={e => upd(i, 'title', e.target.value)} placeholder="Título de la foto"
                onFocus={e => e.target.style.borderColor = C.gold} onBlur={e => e.target.style.borderColor = C.border}
                style={{ ...base, fontSize: 12, marginBottom: 8 }} />
              <select value={photo.cat} onChange={e => upd(i, 'cat', e.target.value)}
                onFocus={e => e.target.style.borderColor = C.gold} onBlur={e => e.target.style.borderColor = C.border}
                style={{ ...base, fontSize: 11, padding: '7px 10px', cursor: 'pointer', background: '#0f0f0e' }}>
                {GALLERY_CATS.map(c => <option key={c} value={c} style={{ background: '#111' }}>{c}</option>)}
              </select>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <AnimatePresence>
          {adding ? (
            <motion.div key="form" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: C.card, border: `1px solid ${C.gold}`, borderTop: `2px solid ${C.gold}`, padding: '24px 20px' }}>
              <p style={{ fontFamily: f.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.gold, marginBottom: 18 }}>Nueva foto</p>
              <ImgInput label="URL de la imagen" value={newPhoto.src} onChange={v => setNewPhoto(p => ({ ...p, src: v }))} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Inp label="Título" value={newPhoto.title} onChange={e => setNewPhoto(p => ({ ...p, title: e.target.value }))} placeholder="Ej: Picada de la casa" />
                <Sel label="Categoría" value={newPhoto.cat} onChange={e => setNewPhoto(p => ({ ...p, cat: e.target.value }))} options={GALLERY_CATS.map(c => ({ value: c, label: c }))} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn onClick={add}>✓ Agregar foto</Btn>
                <Btn variant="ghost" onClick={() => setAdding(false)}>Cancelar</Btn>
              </div>
            </motion.div>
          ) : (
            <button onClick={() => setAdding(true)} style={{ width: '100%', background: 'transparent', border: `1px dashed rgba(196,163,90,0.22)`, color: C.gold, padding: '14px', fontFamily: f.sans, fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(196,163,90,0.05)'; e.currentTarget.style.borderColor = C.gold }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(196,163,90,0.22)' }}>
              + Agregar foto a la galería
            </button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── IMÁGENES DEL SITIO ─────────────────────────────────────
function ImagenesEditor() {
  const { data, updateImages } = useSite()
  const [imgs, setImgs] = useState({ ...data.images })
  const set = (k, v) => setImgs(i => ({ ...i, [k]: v }))
  const labels = {
    hero: 'Hero (portada principal)', about: 'About (sección nosotros, home)',
    music: 'Música en vivo (fondo sección)', nosotros: 'Hero página Nosotros', barrio: 'Foto barrio (página Nosotros)',
  }
  return (
    <div>
      <SectionHeader eyebrow="Imágenes" title="Imágenes del Sitio" subtitle="Cambiá las imágenes principales pegando la URL. Podés usar Unsplash u otras fuentes."
        action={<Btn onClick={() => updateImages(imgs)}>💾 Guardar imágenes</Btn>} />
      {Object.entries(labels).map(([k, l]) => (
        <ImgInput key={k} label={l} value={imgs[k] || ''} onChange={v => set(k, v)} />
      ))}
    </div>
  )
}

// ── INFO DEL LOCAL ─────────────────────────────────────────
function InfoEditor() {
  const { data, updateInfo } = useSite()
  const [info, setInfo] = useState({ ...data.info, hours: JSON.parse(JSON.stringify(data.info.hours)) })
  const set = (k, v) => setInfo(i => ({ ...i, [k]: v }))
  const setHour = (i, field, v) => { const h = [...info.hours]; h[i] = { ...h[i], [field]: v }; setInfo(s => ({ ...s, hours: h })) }
  const addHour = () => setInfo(s => ({ ...s, hours: [...s.hours, { day: '', time: '' }] }))
  const delHour = (i) => setInfo(s => ({ ...s, hours: s.hours.filter((_, j) => j !== i) }))

  return (
    <div>
      <SectionHeader eyebrow="Información" title="Datos del Local" subtitle="Esta info aparece en el footer, página de contacto y botones de WhatsApp."
        action={<Btn onClick={() => updateInfo(info)}>💾 Guardar info</Btn>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
        <Card>
          <p style={{ fontFamily: f.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.gold, marginBottom: 18 }}>Datos de contacto</p>
          <Inp label="Dirección" value={info.address} onChange={e => set('address', e.target.value)} />
          <Inp label="Teléfono (display)" value={info.phone} onChange={e => set('phone', e.target.value)} placeholder="11 3123-1586" />
          <Inp label="WhatsApp (solo números, con código de país)" value={info.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="541131231586" />
          <Inp label="Link Google Maps" value={info.mapsUrl} onChange={e => set('mapsUrl', e.target.value)} mono />
        </Card>
        <Card>
          <p style={{ fontFamily: f.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.gold, marginBottom: 18 }}>Redes sociales</p>
          <Inp label="Instagram (solo el usuario, sin @)" value={info.instagram} onChange={e => set('instagram', e.target.value)} placeholder="jesuislacan" />
          <Inp label="Facebook (URL completa)" value={info.facebook} onChange={e => set('facebook', e.target.value)} placeholder="https://facebook.com/..." />
        </Card>
      </div>

      <Divider label="Horarios" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {info.hours.map((h, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'center' }}>
            <input value={h.day} onChange={e => setHour(i, 'day', e.target.value)} placeholder="Ej: Martes a Domingo"
              onFocus={e => e.target.style.borderColor = C.gold} onBlur={e => e.target.style.borderColor = C.border}
              style={{ ...base }} />
            <input value={h.time} onChange={e => setHour(i, 'time', e.target.value)} placeholder="10:00 — 23:45"
              onFocus={e => e.target.style.borderColor = C.gold} onBlur={e => e.target.style.borderColor = C.border}
              style={{ ...base }} />
            <button onClick={() => delHour(i)} style={{ background: 'none', border: 'none', color: '#374151', cursor: 'pointer', fontSize: 20, padding: '6px', lineHeight: 1, transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = C.danger}
              onMouseLeave={e => e.currentTarget.style.color = '#374151'}>×</button>
          </div>
        ))}
      </div>
      <Btn variant="dashed" onClick={addHour}>+ Agregar horario</Btn>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// MAIN ADMIN
// ═══════════════════════════════════════════════════════════

const NAV = [
  { id: 'dashboard', label: 'Dashboard',    icon: '⌂' },
  { id: 'menu',      label: 'Carta',        icon: '🍽️' },
  { id: 'promos',    label: 'Promos',       icon: '🏷️' },
  { id: 'galeria',   label: 'Galería',      icon: '📸' },
  { id: 'imagenes',  label: 'Imágenes',     icon: '🖼️' },
  { id: 'info',      label: 'Información',  icon: 'ℹ️' },
]

function AdminPanel() {
  const { data, toastVisible, resetAll } = useSite()
  const [section, setSection] = useState('dashboard')
  const [sideOpen, setSideOpen] = useState(false)

  const SECTIONS = {
    dashboard: <Dashboard data={data} setSection={setSection} />,
    menu:      <MenuEditor />,
    promos:    <PromosEditor />,
    galeria:   <GaleriaEditor />,
    imagenes:  <ImagenesEditor />,
    info:      <InfoEditor />,
  }

  const Sidebar = () => (
    <div style={{ width: 220, flexShrink: 0, background: C.bg, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Brand */}
      <div style={{ padding: '28px 20px 20px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontFamily: f.serif, fontSize: 16, color: C.cream, letterSpacing: '0.1em', lineHeight: 1.2 }}>JE SUIS LACAN</div>
        <div style={{ fontFamily: f.sans, fontSize: 10, color: C.gold, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 4 }}>Panel Admin</div>
      </div>
      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 0' }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => { setSection(n.id); setSideOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '11px 20px', background: section === n.id ? 'rgba(196,163,90,0.08)' : 'transparent', border: 'none', borderLeft: `3px solid ${section === n.id ? C.gold : 'transparent'}`, color: section === n.id ? C.gold : C.muted, fontFamily: f.sans, fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
            onMouseEnter={e => { if (section !== n.id) { e.currentTarget.style.color = C.cream; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' } }}
            onMouseLeave={e => { if (section !== n.id) { e.currentTarget.style.color = C.muted; e.currentTarget.style.background = 'transparent' } }}>
            <span style={{ fontSize: 16 }}>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>
      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: `1px solid ${C.border}` }}>
        <a href="/" target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontFamily: f.sans, fontSize: 11, color: C.muted, textDecoration: 'none', marginBottom: 10, transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = C.cream}
          onMouseLeave={e => e.currentTarget.style.color = C.muted}>
          ↗ Ver sitio público
        </a>
        <button onClick={() => { if (confirm('¿Restaurar todos los datos al estado original?')) resetAll() }} style={{ fontFamily: f.sans, fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0, letterSpacing: '0.05em' }}>
          ↺ Restaurar datos
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: f.sans }}>
      {/* Desktop sidebar */}
      <div className="admin-sidebar"><Sidebar /></div>

      {/* Mobile overlay sidebar */}
      <AnimatePresence>
        {sideOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSideOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000 }} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.25 }} style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 1001 }}>
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <div style={{ background: C.bg, borderBottom: `1px solid ${C.border}`, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => setSideOpen(true)} className="admin-hamburger" style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 20, padding: '4px 6px', display: 'none' }}>☰</button>
            <span style={{ fontFamily: f.sans, fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted }}>
              {NAV.find(n => n.id === section)?.label ?? 'Dashboard'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} />
            <span style={{ fontFamily: f.sans, fontSize: 11, color: C.muted }}>En línea</span>
          </div>
        </div>

        {/* Section content */}
        <div style={{ flex: 1, padding: '40px 32px', overflowY: 'auto', maxWidth: 1100 }}>
          <AnimatePresence mode="wait">
            <motion.div key={section} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
              {SECTIONS[section]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <Toast visible={toastVisible} />

      <style>{`
        @media (min-width: 769px) { .admin-sidebar { display: block; } .admin-hamburger { display: none !important; } }
        @media (max-width: 768px)  { .admin-sidebar { display: none; } .admin-hamburger { display: block !important; } }
      `}</style>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════
export default function Admin() {
  const [pass, setPass]       = useState('')
  const [auth, setAuth]       = useState(() => sessionStorage.getItem('jsl_admin') === '1')
  const [err, setErr]         = useState(false)
  const [show, setShow]       = useState(false)

  const login = (e) => {
    e.preventDefault()
    if (pass === PASS) { sessionStorage.setItem('jsl_admin', '1'); setAuth(true) }
    else { setErr(true); setPass(''); setTimeout(() => setErr(false), 2200) }
  }

  if (auth) return <AdminPanel />

  return (
    <div style={{ minHeight: '100vh', background: '#111110', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontFamily: f.sans, fontSize: 10, letterSpacing: '0.4em', color: C.gold, textTransform: 'uppercase', marginBottom: 12 }}>Panel de administración</p>
          <h1 style={{ fontFamily: f.serif, fontSize: 38, color: C.cream, fontWeight: 500, lineHeight: 1 }}>Je Suis Lacan</h1>
        </div>

        <Card accent>
          <form onSubmit={login}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontFamily: f.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.muted, marginBottom: 8 }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input type={show ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••••"
                  onFocus={e => e.target.style.borderColor = C.gold} onBlur={e => e.target.style.borderColor = err ? '#ef4444' : C.border}
                  style={{ ...base, borderColor: err ? '#ef4444' : C.border, paddingRight: 44 }} autoFocus />
                <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 14 }}>
                  {show ? '🙈' : '👁'}
                </button>
              </div>
              <AnimatePresence>
                {err && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ fontFamily: f.sans, fontSize: 12, color: '#ef4444', marginTop: 8 }}>
                    Contraseña incorrecta
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <Btn type="submit" variant="gold" full>Ingresar al panel</Btn>
          </form>
        </Card>

        <p style={{ fontFamily: f.sans, fontSize: 11, color: C.muted, textAlign: 'center', marginTop: 20 }}>
          Je Suis Lacan · San Telmo, Buenos Aires
        </p>
      </motion.div>
    </div>
  )
}
