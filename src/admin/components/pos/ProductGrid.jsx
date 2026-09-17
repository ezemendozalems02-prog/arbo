import { COLORS, FONTS } from '../../../styles/theme'
import { PRODUCTS } from '../../../mock/products'
import { formatMoney } from '../../utils/format'
import { EmptyState } from '../Panel'

export default function ProductGrid({ category, onSelect }) {
  const products = PRODUCTS.filter(p => p.active && (category === 'todos' || p.cat === category))

  if (!products.length) return <EmptyState label="No hay productos en esta categoría." />

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
      {products.map(product => (
        <button key={product.id} onClick={() => onSelect(product)}
          style={{
            textAlign: 'left', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
            padding: '14px 14px 12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6,
            transition: 'border-color 0.15s, background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.green; e.currentTarget.style.background = '#EFE7D2' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.lineGreen; e.currentTarget.style.background = COLORS.warmWhite }}>
          <span style={{ fontFamily: FONTS.serif, fontSize: 16, color: COLORS.greenDark, lineHeight: 1.25 }}>{product.name}</span>
          <span style={{ fontFamily: FONTS.sans, fontSize: 14, fontWeight: 700, color: COLORS.green }}>{formatMoney(product.price)}</span>
          {product.modifierGroups.length > 0 && (
            <span style={{ fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: COLORS.onLightFaint }}>
              Con opciones
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
