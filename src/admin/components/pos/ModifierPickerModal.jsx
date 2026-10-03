import { useEffect, useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { getModifierGroup } from '../../../mock/modifiers'
import AdminModal from '../AdminModal'
import Button from '../../ui/Button'
import { formatMoney } from '../../utils/format'

export default function ModifierPickerModal({ product, open, onClose, onConfirm }) {
  const groups = (product?.modifierGroups ?? []).map(getModifierGroup).filter(Boolean)
  const [selected, setSelected] = useState({})

  useEffect(() => {
    if (!open) return
    // Preselecciona la primera opción de cada grupo requerido (ej. "Leche: Entera").
    const initial = {}
    for (const g of groups) if (g.required) initial[g.key] = [g.options[0].key]
    setSelected(initial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product?.id])

  if (!product) return null

  const toggleOption = (group, optionKey) => {
    setSelected(prev => {
      const current = prev[group.key] ?? []
      if (group.max === 1) return { ...prev, [group.key]: [optionKey] }
      const has = current.includes(optionKey)
      if (has) return { ...prev, [group.key]: current.filter(k => k !== optionKey) }
      if (current.length >= group.max) return prev
      return { ...prev, [group.key]: [...current, optionKey] }
    })
  }

  const missingRequired = groups.some(g => g.required && (selected[g.key]?.length ?? 0) < g.min)

  const buildModifiers = () => groups.flatMap(g =>
    (selected[g.key] ?? []).map(optionKey => {
      const option = g.options.find(o => o.key === optionKey)
      return { groupKey: g.key, groupName: g.name, optionKey: option.key, optionName: option.name, priceDelta: option.priceDelta }
    })
  )

  const delta = buildModifiers().reduce((sum, m) => sum + m.priceDelta, 0)

  return (
    <AdminModal open={open} onClose={onClose} title={product.name} width={420}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginBottom: 24 }}>
        {groups.map(group => (
          <div key={group.key}>
            <p style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onLightMuted, marginBottom: 10 }}>
              {group.name} {group.required && <span style={{ color: COLORS.green }}>*</span>}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {group.options.map(option => {
                const isSelected = (selected[group.key] ?? []).includes(option.key)
                return (
                  <button key={option.key} onClick={() => toggleOption(group, option.key)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px',
                      border: `1.5px solid ${isSelected ? COLORS.green : COLORS.lineGreen}`,
                      background: isSelected ? 'rgba(48,77,59,0.08)' : 'transparent',
                      cursor: 'pointer', fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLight, textAlign: 'left',
                    }}>
                    <span>{option.name}</span>
                    <span style={{ color: COLORS.onLightMuted }}>{option.priceDelta > 0 ? `+${formatMoney(option.priceDelta)}` : '—'}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20, fontFamily: FONTS.sans }}>
        <span style={{ fontSize: 12, color: COLORS.onLightMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total</span>
        <span style={{ fontFamily: FONTS.serif, fontSize: 24, color: COLORS.greenDark, fontWeight: 600 }}>{formatMoney(product.price + delta)}</span>
      </div>

      <Button full disabled={missingRequired} onClick={() => onConfirm(buildModifiers())}>Agregar</Button>
    </AdminModal>
  )
}
