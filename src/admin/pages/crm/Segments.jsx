import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, FONTS } from '../../../styles/theme'
import { useCRM } from '../../../context/CRMContext'
import { useToast } from '../../context/ToastContext'
import { getSegmentCount } from '../../../services/segmentService'
import { formatNumber } from '../../utils/format'
import { EmptyState } from '../../components/Panel'
import Button from '../../../components/ui/Button'
import NewSegmentModal from '../../components/crm/NewSegmentModal'

export default function Segments() {
  useEffect(() => { document.title = 'Segmentos | ARBO OS' }, [])
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { customers, segments, createSegment, getRedemptionsForCustomer } = useCRM()
  const [formOpen, setFormOpen] = useState(false)

  const now = new Date()
  const deps = { now, getRedemptionsForCustomer }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
        <Button size="sm" onClick={() => setFormOpen(true)}>Nuevo segmento</Button>
      </div>

      {segments.length === 0 ? <EmptyState label="Sin segmentos." /> : (
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {segments.map(s => (
            <button key={s.id} onClick={() => navigate(`/admin/clientes?segmento=${s.id}`)}
              style={{
                textAlign: 'left', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`, padding: '18px 20px',
                cursor: 'pointer', borderRight: 'none', borderBottom: 'none', borderLeft: 'none', borderTop: `1px solid ${COLORS.lineGreen}`,
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <p style={{ fontFamily: FONTS.serif, fontSize: 17, color: COLORS.greenDark }}>{s.name}</p>
                <span style={{ fontFamily: FONTS.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: s.kind === 'sistema' ? COLORS.green : '#8A6A2E' }}>
                  {s.kind}
                </span>
              </div>
              <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightFaint, marginBottom: 10 }}>{s.description}</p>
              <p style={{ fontFamily: FONTS.sans, fontSize: 20, fontWeight: 700, color: COLORS.greenDark }}>
                {formatNumber(getSegmentCount(s, customers, deps))} <span style={{ fontSize: 12, fontWeight: 400, color: COLORS.onLightMuted }}>clientes</span>
              </p>
            </button>
          ))}
        </div>
      )}

      <NewSegmentModal open={formOpen} onClose={() => setFormOpen(false)}
        onCreate={(data) => { createSegment(data); showToast(`Segmento "${data.name}" creado`) }} />
    </div>
  )
}
