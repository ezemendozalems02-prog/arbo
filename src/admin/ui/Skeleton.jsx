// Skeletons adaptados a la forma de cada pantalla (nunca un "Cargando…").

export function Skeleton({ width = '100%', height = 14, radius, style }) {
  return <div className="os-skeleton" aria-hidden="true" style={{ width, height, borderRadius: radius, ...style }} />
}

function CardShell({ children, height }) {
  return <div className="os-card" style={{ padding: 20, minHeight: height }}>{children}</div>
}

export function MetricSkeleton() {
  return (
    <CardShell>
      <Skeleton width="45%" height={10} />
      <Skeleton width="65%" height={26} style={{ marginTop: 18 }} />
      <Skeleton width="38%" height={10} style={{ marginTop: 12 }} />
    </CardShell>
  )
}

export function TableSkeleton({ rows = 6 }) {
  return (
    <CardShell>
      <Skeleton width="30%" height={14} />
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 0.6fr', gap: 16 }}>
            <Skeleton height={12} /><Skeleton height={12} /><Skeleton height={12} /><Skeleton height={12} />
          </div>
        ))}
      </div>
    </CardShell>
  )
}

export function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} role="status" aria-label="Cargando tablero">
      <Skeleton height={168} radius="var(--os-radius-2xl)" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16 }}>
        {Array.from({ length: 6 }, (_, i) => <MetricSkeleton key={i} />)}
      </div>
      <CardShell height={300}><Skeleton width="25%" /><Skeleton height={220} style={{ marginTop: 24 }} /></CardShell>
    </div>
  )
}

// Fallback genérico mientras carga el código de un módulo.
export function PageSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} role="status" aria-label="Cargando">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16 }}>
        {Array.from({ length: 4 }, (_, i) => <MetricSkeleton key={i} />)}
      </div>
      <TableSkeleton />
    </div>
  )
}
