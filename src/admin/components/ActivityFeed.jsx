import { CalendarDays, Receipt } from 'lucide-react'
import { MOCK_NOW } from '../../mock/config'
import { EmptyState } from './Panel'
import { timeAgo } from '../utils/format'
import { OS } from '../styles/tokens'

const TYPE = {
  order: { Icon: Receipt, color: OS.color.leaf },
  reservation: { Icon: CalendarDays, color: OS.color.gold },
}

// Timeline vertical: ícono por tipo de evento + línea que los une.
export default function ActivityFeed({ events }) {
  if (!events.length) return <EmptyState label="Sin actividad reciente." />
  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {events.map((e, i) => {
        const t = TYPE[e.type] ?? TYPE.order
        return (
          <li key={e.id} style={{ display: 'flex', gap: 12, position: 'relative', paddingBottom: i < events.length - 1 ? 14 : 0 }}>
            {i < events.length - 1 && (
              <span aria-hidden="true" style={{ position: 'absolute', left: 13, top: 28, bottom: 0, width: 1, background: OS.color.line }} />
            )}
            <span style={{
              display: 'inline-flex', width: 27, height: 27, borderRadius: '50%', alignItems: 'center', justifyContent: 'center',
              background: OS.color.surface3, color: t.color, flexShrink: 0,
            }}>
              <t.Icon size={13} aria-hidden="true" />
            </span>
            <div style={{ minWidth: 0, paddingTop: 3 }}>
              <p style={{ fontSize: 13, color: OS.color.ink, lineHeight: 1.4 }}>{e.message}</p>
              <p style={{ fontSize: 11, color: OS.color.ink3, marginTop: 2 }}>{timeAgo(e.timestamp, MOCK_NOW)}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
