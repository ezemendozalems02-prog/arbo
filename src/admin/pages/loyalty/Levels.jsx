import { useEffect, useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { useCRM } from '../../../context/CRMContext'
import { useToast } from '../../context/ToastContext'
import { formatNumber } from '../../utils/format'
import Panel from '../../components/Panel'
import Button from '../../../components/ui/Button'
import LevelFormModal from '../../components/crm/LevelFormModal'

export default function Levels() {
  useEffect(() => { document.title = 'Niveles ARBO Club | ARBO OS' }, [])
  const { showToast } = useToast()
  const { levels, customers, createLevel, updateLevel } = useCRM()
  const [formOpen, setFormOpen] = useState(false)
  const [editingLevel, setEditingLevel] = useState(null)

  const sorted = [...levels].sort((a, b) => a.order - b.order)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
        <Button size="sm" onClick={() => { setEditingLevel(null); setFormOpen(true) }}>Nuevo nivel</Button>
      </div>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {sorted.map(l => {
          const memberCount = customers.filter(c => c.tier?.key === l.key).length
          return (
            <Panel key={l.id} title={l.name}
              action={<button onClick={() => { setEditingLevel(l); setFormOpen(true) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONTS.sans, fontSize: 11, color: COLORS.green }}>Editar</button>}>
              <div style={{ width: 32, height: 4, background: l.color, marginBottom: 12 }} />
              <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightMuted, marginBottom: 10 }}>{l.subtitle}</p>
              <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLight, marginBottom: 10 }}>Desde {formatNumber(l.pointsRequired)} puntos · {formatNumber(memberCount)} socios</p>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {l.benefits.map((b, i) => (
                  <li key={i} style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightMuted, marginBottom: 4 }}>{b}</li>
                ))}
              </ul>
            </Panel>
          )
        })}
      </div>

      <LevelFormModal open={formOpen} onClose={() => setFormOpen(false)} editingLevel={editingLevel} nextOrder={levels.length + 1}
        onSubmit={(data) => {
          if (editingLevel) { updateLevel(editingLevel.id, data); showToast('Nivel actualizado') }
          else { createLevel(data); showToast(`Nivel "${data.name}" creado`) }
        }} />
    </div>
  )
}
