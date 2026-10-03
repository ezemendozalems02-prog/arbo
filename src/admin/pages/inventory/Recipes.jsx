import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, FONTS } from '../../../styles/theme'
import { useInventory } from '../../../context/InventoryContext'
import { useToast } from '../../context/ToastContext'
import { PRODUCTS } from '../../../mock/products'
import { calcRecipeSummary } from '../../../services/recipeCostService'
import { formatMoney } from '../../utils/format'
import Panel, { EmptyState } from '../../components/Panel'
import Button from '../../ui/Button'
import RecipeFormModal from '../../components/inventory/RecipeFormModal'

const inputStyle = {
  padding: '10px 12px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 13, outline: 'none',
}

export default function Recipes() {
  useEffect(() => { document.title = 'Recetas | ARBO OS' }, [])
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { items, recipes, createRecipe, getItemById, getRecipeById } = useInventory()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [formOpen, setFormOpen] = useState(false)

  const getInsumo = (id) => getItemById(id)
  const getRecipe = (id) => getRecipeById(id)

  const rows = recipes.map(recipe => {
    const product = PRODUCTS.find(p => p.id === recipe.productId)
    const summary = calcRecipeSummary(recipe, product?.price ?? 0, { getInsumo, getRecipe })
    return { recipe, product, ...summary }
  })

  const filtered = rows
    .filter(r => statusFilter === 'todos' || r.recipe.status === statusFilter)
    .filter(r => !query.trim() || r.recipe.name.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => a.recipe.name.localeCompare(b.recipe.name))

  return (
    <div>
      <Panel title="Recetas" action={<Button size="sm" onClick={() => setFormOpen(true)}>Nueva receta</Button>}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <input style={{ ...inputStyle, flex: 1, minWidth: 180 }} value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar receta..." />
          <select style={inputStyle} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="todos">Todos los estados</option>
            <option value="activa">Activas</option>
            <option value="inactiva">Inactivas</option>
          </select>
        </div>

        {filtered.length === 0 ? <EmptyState label="Sin resultados." /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONTS.sans, fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.onLightMuted }}>
                  <th style={{ padding: '8px 10px' }}>Nombre</th>
                  <th style={{ padding: '8px 10px' }}>Producto</th>
                  <th style={{ padding: '8px 10px' }}>Costo</th>
                  <th style={{ padding: '8px 10px' }}>Precio</th>
                  <th style={{ padding: '8px 10px' }}>Margen</th>
                  <th style={{ padding: '8px 10px' }}>Food cost</th>
                  <th style={{ padding: '8px 10px' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(({ recipe, product, cost, price, margin, foodCostPct }) => (
                  <tr key={recipe.id} style={{ borderTop: `1px solid ${COLORS.lineGreen}`, cursor: 'pointer' }} onClick={() => navigate(`/admin/recetas/${recipe.id}`)}>
                    <td style={{ padding: '10px', color: COLORS.greenDark, fontWeight: 600 }}>{recipe.name}</td>
                    <td style={{ padding: '10px', color: COLORS.onLightMuted }}>{product?.name ?? 'Preparado'}</td>
                    <td style={{ padding: '10px' }}>{formatMoney(cost)}</td>
                    <td style={{ padding: '10px' }}>{product ? formatMoney(price) : '—'}</td>
                    <td style={{ padding: '10px', color: product ? (margin >= 0 ? COLORS.green : '#8A4536') : COLORS.onLightFaint }}>{product ? formatMoney(margin) : '—'}</td>
                    <td style={{ padding: '10px', fontWeight: 700, color: foodCostPct > 35 ? '#8A4536' : COLORS.greenDark }}>{product ? `${foodCostPct.toFixed(1)}%` : '—'}</td>
                    <td style={{ padding: '10px', textTransform: 'capitalize', color: COLORS.onLightMuted }}>{recipe.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <RecipeFormModal open={formOpen} onClose={() => setFormOpen(false)} items={items} recipes={recipes}
        onSave={(data) => {
          createRecipe(data)
          showToast(`Receta "${data.name}" creada`)
          setFormOpen(false)
        }} />
    </div>
  )
}
