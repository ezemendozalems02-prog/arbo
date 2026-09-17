// Todos los cálculos de una venta viven acá — nada de `price * qty` repetido
// en componentes. Funciones puras: mismo input, mismo output, sin estado.
// Esto es lo que va a importar cuando el total lo calcule Supabase/una
// función de base de datos en vez de JS del cliente.

export function calcModifiersDelta(modifiers = []) {
  return modifiers.reduce((sum, m) => sum + m.priceDelta, 0)
}

export function calcLineUnitPrice(item) {
  return item.unitPrice + calcModifiersDelta(item.modifiers)
}

export function calcLineTotal(item) {
  return calcLineUnitPrice(item) * item.quantity
}

export function calcSubtotal(items = []) {
  return items.reduce((sum, item) => sum + calcLineTotal(item), 0)
}

export function calcDiscountAmount(subtotal, discount) {
  if (!discount || subtotal <= 0) return 0
  const raw = discount.type === 'percent' ? subtotal * (discount.value / 100) : discount.value
  return Math.min(Math.max(Math.round(raw), 0), subtotal)
}

export function calcTotal(items, discount) {
  const subtotal = calcSubtotal(items)
  const discountAmount = calcDiscountAmount(subtotal, discount)
  return Math.max(subtotal - discountAmount, 0)
}

export function calcOrderTotals(order) {
  const subtotal = calcSubtotal(order.items)
  const discountAmount = calcDiscountAmount(subtotal, order.discount)
  const total = Math.max(subtotal - discountAmount, 0)
  return { subtotal, discountAmount, total }
}

export function calcChange(total, received) {
  return Math.max(Math.round(received - total), 0)
}

export function calcSplitEqual(total, parts) {
  const n = Math.max(1, Math.floor(parts))
  return { parts: n, amountPerPart: Math.ceil(total / n) }
}

// Firma de una selección de modificadores: dos líneas con el mismo producto
// y la misma selección deben fusionarse (sumar cantidad) en vez de duplicarse.
export function modifiersSignature(modifiers = []) {
  return [...modifiers].map(m => `${m.groupKey}:${m.optionKey}`).sort().join('|')
}
