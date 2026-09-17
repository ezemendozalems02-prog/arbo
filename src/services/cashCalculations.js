// Cálculos de caja — separados de salesCalculations.js porque operan sobre
// movimientos de caja (ventas + ingresos/egresos manuales), no sobre una
// venta individual.
import { PAYMENT_METHODS } from '../mock/orders'

export function sumByType(movements, type) {
  return movements.filter(m => m.type === type).reduce((sum, m) => sum + m.amount, 0)
}

export function calcCashSummary(cash) {
  const ventas = sumByType(cash.movements, 'venta')
  const ingresos = sumByType(cash.movements, 'ingreso')
  const egresos = sumByType(cash.movements, 'egreso')

  // Solo las ventas cobradas en efectivo (+ ingresos/egresos manuales, que
  // por definición son movimientos de efectivo) afectan el cajón físico.
  const ventasEfectivo = cash.movements
    .filter(m => m.type === 'venta' && m.method === 'efectivo')
    .reduce((sum, m) => sum + m.amount, 0)
  const expectedCash = cash.initialAmount + ventasEfectivo + ingresos - egresos

  const byMethod = Object.fromEntries(PAYMENT_METHODS.map(method => [
    method,
    cash.movements
      .filter(m => m.type === 'venta' && m.method === method)
      .reduce((sum, m) => sum + m.amount, 0),
  ]))

  return { ventas, ingresos, egresos, expectedCash, byMethod }
}

export function calcCashDifference(expectedCash, declaredCash) {
  return declaredCash - expectedCash
}
