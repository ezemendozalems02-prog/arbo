import { DoorOpen, MoveHorizontal } from 'lucide-react'
import { ENTRANCE, FIXTURES, FLOOR_HEIGHT, FLOOR_WIDTH, TABLE_LAYOUT, ZONES } from '../../config/floorPlan'
import { tableSize } from './tableStyles'
import TableTile from './TableTile'

const pctX = (v) => `${(v / FLOOR_WIDTH) * 100}%`
const pctY = (v) => `${(v / FLOOR_HEIGHT) * 100}%`

const label = {
  position: 'absolute', fontSize: 'clamp(9px, 0.95cqw, 12px)', fontWeight: 800, letterSpacing: '0.14em',
  textTransform: 'uppercase', color: 'var(--os-ink-3)', pointerEvents: 'none',
}

// Plano del salón: las mesas se ubican según config/floorPlan.js. Una mesa
// sin ubicación definida no se pierde: aparece en la franja "Sin ubicar".
export default function FloorMap({ tables, activeZone, now, getOrderInfo, onSelect }) {
  const placed = tables.filter(t => TABLE_LAYOUT[t.number])
  const unplaced = tables.filter(t => !TABLE_LAYOUT[t.number])

  const renderTile = (table, layout) => {
    const info = getOrderInfo(table)
    return (
      <TableTile table={table} layout={layout} order={info.order} total={info.total} kitchenReady={info.kitchenReady}
        dimmed={activeZone !== 'all' && table.zone !== activeZone} now={now} onClick={() => onSelect(table)} />
    )
  }

  return (
    <div>
    <p className="os-floor-hint" aria-hidden="true" style={{ display: 'none', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--os-ink-3)', marginBottom: 8 }}>
      <MoveHorizontal size={14} /> Deslizá para ver todo el salón
    </p>
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', margin: '0 -4px', padding: '0 4px 4px' }}>
      <div role="group" aria-label="Plano del salón" style={{
        position: 'relative', minWidth: 620, aspectRatio: `${FLOOR_WIDTH} / ${FLOOR_HEIGHT}`, containerType: 'inline-size',
        background: 'var(--os-surface)', borderRadius: 'var(--os-radius-lg)', border: '1px solid var(--os-line-strong)',
        boxShadow: 'var(--os-shadow-card)', overflow: 'hidden',
        backgroundImage: 'radial-gradient(rgba(23,58,44,0.07) 1px, transparent 1px)', backgroundSize: '2.2cqw 2.2cqw',
      }}>
        {/* Zonas */}
        {ZONES.map(z => {
          const active = activeZone === 'all' || activeZone === z.key
          const terrace = z.key === 'exterior'
          return (
            <div key={z.key} aria-hidden="true" style={{
              position: 'absolute', left: pctX(z.area.x), top: pctY(z.area.y), width: pctX(z.area.w), height: pctY(z.area.h),
              borderRadius: 'clamp(8px, 1.2cqw, 16px)',
              background: terrace ? 'rgba(82,122,99,0.07)' : z.key === 'ventana' ? 'rgba(46,94,122,0.05)' : 'transparent',
              border: terrace ? '1.5px dashed rgba(82,122,99,0.35)' : 'none',
              borderTop: z.key === 'ventana' ? '4px double rgba(46,94,122,0.35)' : undefined,
              opacity: active ? 1 : 0.55, transition: 'opacity 200ms ease',
            }}>
              <span style={{ ...label, left: '1.2cqw', top: z.key === 'ventana' ? '0.7cqw' : '0.6cqw' }}>{z.label}</span>
            </div>
          )
        })}

        {/* Separador salón / terraza */}
        <div aria-hidden="true" style={{ position: 'absolute', left: pctX(3), right: pctX(3), top: pctY(54), height: 2, background: 'var(--os-line-strong)' }} />

        {/* Barra, cocina */}
        {FIXTURES.map(f => (
          <div key={f.key} aria-hidden="true" style={{
            position: 'absolute', left: pctX(f.x), top: pctY(f.y), width: pctX(f.w), height: pctY(f.h),
            borderRadius: 'clamp(8px, 1cqw, 14px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: f.muted ? 'repeating-linear-gradient(135deg, var(--os-surface-3) 0 6px, transparent 6px 12px)' : 'var(--os-sand)',
            border: `1px solid ${f.muted ? 'var(--os-line)' : 'rgba(185,154,98,0.45)'}`,
          }}>
            <span style={{ ...label, position: 'static', color: f.muted ? 'var(--os-ink-3)' : '#7A6233' }}>{f.label}</span>
          </div>
        ))}

        {/* Entrada */}
        <div aria-hidden="true" style={{ position: 'absolute', left: 0, top: pctY(ENTRANCE.y - 3), height: pctY(6), width: 6, background: 'var(--os-gold)', borderRadius: '0 4px 4px 0' }} />
        <span aria-hidden="true" style={{ ...label, left: '1.4cqw', top: pctY(ENTRANCE.y + 3.5), display: 'flex', alignItems: 'center', gap: 4, color: '#7A6233' }}>
          <DoorOpen size={12} /> {ENTRANCE.label}
        </span>

        {/* Mesas */}
        {placed.map(table => {
          const layout = TABLE_LAYOUT[table.number]
          const { w, h } = tableSize(layout.shape, table.capacity)
          return (
            <div key={table.id} style={{
              position: 'absolute', left: pctX(layout.x - w / 2), top: pctY(layout.y - h / 2), width: pctX(w), height: pctY(h),
            }}>
              {renderTile(table, layout)}
            </div>
          )
        })}
      </div>

      {unplaced.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--os-ink-3)', marginBottom: 8 }}>Sin ubicar en el plano</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, containerType: 'inline-size' }}>
            {unplaced.map(table => (
              <div key={table.id} style={{ position: 'relative', width: 84, height: 84 }}>
                {renderTile(table, { shape: 'square' })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    <style>{`@media (max-width: 700px) { .os-floor-hint { display: flex !important; } }`}</style>
    </div>
  )
}
