import { COLORS, FONTS } from '../../styles/theme'
import { MOCK_NOW } from '../../mock/config'
import { EmptyState } from './Panel'
import { timeAgo } from '../utils/format'

const DOT_COLOR = { order: COLORS.green, reservation: COLORS.accent }

export default function ActivityFeed({ events }) {
  if (!events.length) return <EmptyState label="Sin actividad reciente." />
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {events.map(e => (
        <div key={e.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: DOT_COLOR[e.type], marginTop: 5, flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLight }}>{e.message}</p>
            <p style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.onLightFaint, marginTop: 2 }}>{timeAgo(e.timestamp, MOCK_NOW)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
