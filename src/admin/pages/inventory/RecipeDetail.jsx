import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { COLORS, FONTS } from '../../../styles/theme'
import { useInventory } from '../../../context/InventoryContext'
import { useToast } from '../../context/ToastContext'
import { PRODUCTS } from '../../../mock/products'
import { UNIT_SHORT } from '../../../mock/units'
import { calcIngredientCost, calcRecipeSummary } from '../../../services/recipeCostService'
import { formatMoney, formatQty } from '../../utils/format'
import Panel, { EmptyState } from '../../components/Panel'
import Button from '../../ui/Button'
import RecipeFormModal from '../../components/inventory/RecipeFormModal'

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted }}>
    <span>{label}</span><span style={{ color: COLORS.onLight, fontWeight: 600 }}>{value}</span>
  </div>
)

export default function RecipeDetail() {
  const { recipeId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { items, recipes, getRecipeById, getItemById, updateRecipe } = useInventory()
  const recipe = getRecipeById(recipeId)
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => { document.title = recipe ? `${recipe.name} | ARBO OS` : 'Receta | ARBO OS' }, [recipe])

  if (!recipe) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.onLightMuted, marginBottom: 20 }}>No encontramos esa receta.</p>
        <Button onClick={() => navigate('/admin/recetas')}>Volver a Recetas</Button>
      </div>
    )
  }

  const product = PRODUCTS.find(p => p.id === recipe.productId)
  const getInsumo = (id) => getItemById(id)
  const getRecipe = (id) => getRecipeById(id)
  const summary = calcRecipeSummary(recipe, product?.price ?? 0, { getInsumo, getRecipe })

  const label = (ing) => ing.kind === 'insumo' ? getItemById(ing.refId)?.name : getRecipeById(ing.refId)?.name

  return (
    <div style={{ maxWidth: 640 }}>
      <button onClick={() => navigate('/admin/recetas')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONTS.sans, fontSize: 12, color: COLORS.green, marginBottom: 18, padding: 0 }}>
        ← Volver a Recetas
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontFamily: FONTS.serif, fontSize: 26, color: COLORS.greenDark }}>{recipe.name}</p>
          <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightFaint, marginTop: 4 }}>
            {product?.name ?? 'Preparado'} · Rinde {recipe.yield.qty} {UNIT_SHORT[recipe.yield.unit]}
          </p>
        </div>
        <Button variant="outline-light" size="sm" onClick={() => setEditOpen(true)}>Editar</Button>
      </div>

      <Panel title="Ingredientes">
        {recipe.ingredients.length === 0 ? <EmptyState label="Esta receta todavía no tiene ingredientes." /> : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recipe.ingredients.map((ing, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', fontFamily: FONTS.sans, fontSize: 13 }}>
                <span style={{ color: COLORS.onLight }}>{formatQty(ing.quantity, ing.unit, UNIT_SHORT)} — {label(ing)}{ing.kind === 'recipe' ? ' (preparado)' : ''}</span>
                <span style={{ color: COLORS.onLightMuted }}>{formatMoney(calcIngredientCost(ing, { getInsumo, getRecipe }))}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <div style={{ height: 20 }} />

      <Panel title="Costeo">
        <Row label="Costo de ingredientes" value={formatMoney(summary.ingredientsCost)} />
        <Row label="Costo por porción" value={formatMoney(summary.cost)} />
        {product && (
          <>
            <Row label="Precio de venta" value={formatMoney(summary.price)} />
            <Row label="Margen bruto" value={formatMoney(summary.margin)} />
            <Row label="Food cost %" value={`${summary.foodCostPct.toFixed(1)}%`} />
          </>
        )}
      </Panel>

      <RecipeFormModal open={editOpen} onClose={() => setEditOpen(false)} items={items} recipes={recipes} initialRecipe={recipe}
        onSave={(data) => { updateRecipe(recipe.id, data); showToast('Receta actualizada'); setEditOpen(false) }} />
    </div>
  )
}
