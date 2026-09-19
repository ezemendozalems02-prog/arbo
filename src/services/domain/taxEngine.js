// ARBO OS — DOMAIN SERVICE: TAX ENGINE (MOTOR IMPOSITIVO ARGENTINO)
// Desacoplado de la UI. Calcula alícuotas de IVA (21%, 10.5%, Exento),
// discriminación de neto gravado y desglose según tipo de comprobante (Factura A, B, C, X).

export const TAX_RATES = {
  IVA_21: 0.21,
  IVA_10_5: 0.105,
  EXENTO: 0.0,
}

/**
 * Redondea un valor numérico a exactamente 2 decimales evitando imprecisiones de punto flotante.
 */
export function roundToTwoDecimals(num) {
  return Math.round((Number(num) + Number.EPSILON) * 100) / 100
}

/**
 * Calcula la discriminación fiscal de una línea de producto con precio final con IVA incluido.
 * @param {number} finalPrice Precio con IVA incluido
 * @param {number} [taxRate=0.21] Alícuota impositiva (ej. 0.21, 0.105, 0.0)
 * @returns {{ netAmount: number, vatAmount: number, totalAmount: number, taxRate: number }}
 */
export function calculateLineTax(finalPrice, taxRate = TAX_RATES.IVA_21) {
  const price = Number(finalPrice)
  if (isNaN(price) || price < 0) {
    throw new Error(`INVALID_PRICE: El precio para cálculo fiscal debe ser un número no negativo: ${finalPrice}`)
  }

  if (taxRate === 0) {
    const total = roundToTwoDecimals(price)
    return {
      netAmount: total,
      vatAmount: 0.00,
      totalAmount: total,
      taxRate: 0.0,
    }
  }

  const divisor = 1 + taxRate
  const netAmount = roundToTwoDecimals(price / divisor)
  const vatAmount = roundToTwoDecimals(price - netAmount)
  const totalAmount = roundToTwoDecimals(netAmount + vatAmount)

  return {
    netAmount,
    vatAmount,
    totalAmount,
    taxRate,
  }
}

/**
 * Calcula los totales fiscales de un carrito o venta según el tipo de comprobante.
 * @param {Array<{ subtotal: number, tax_rate?: number }>} items Líneas de la venta
 * @param {string} invoiceType 'FACTURA_A'|'FACTURA_B'|'FACTURA_C'|'COMPROBANTE_X'|'NOTA_CREDITO_A'|...
 * @param {Object} [orgOptions] Opciones de la organización emisora
 * @param {'RESPONSABLE_INSCRIPTO'|'MONOTRIBUTO'} [orgOptions.taxCondition='RESPONSABLE_INSCRIPTO']
 */
export function calculateInvoiceTaxes(items = [], invoiceType = 'FACTURA_B', orgOptions = {}) {
  const { taxCondition = 'RESPONSABLE_INSCRIPTO' } = orgOptions

  let totalGross = 0.00
  let totalNet = 0.00
  let totalVat = 0.00
  const breakdownByRate = {}

  for (const item of items) {
    const itemTotal = Number(item.subtotal || item.total || 0)
    const rate = item.tax_rate !== undefined ? Number(item.tax_rate) : TAX_RATES.IVA_21

    totalGross += itemTotal

    if (invoiceType === 'FACTURA_C' || taxCondition === 'MONOTRIBUTO') {
      // Monotributo no genera débito fiscal de IVA
      totalNet += itemTotal
    } else if (invoiceType === 'COMPROBANTE_X') {
      // Documento no fiscal de control interno
      totalNet += itemTotal
    } else {
      // Responsable Inscripto (Factura A, Factura B, Notas de Crédito)
      const lineTax = calculateLineTax(itemTotal, rate)
      totalNet += lineTax.netAmount
      totalVat += lineTax.vatAmount

      const rateKey = `${(rate * 100).toFixed(1)}%`
      if (!breakdownByRate[rateKey]) {
        breakdownByRate[rateKey] = { base: 0.00, vat: 0.00 }
      }
      breakdownByRate[rateKey].base = roundToTwoDecimals(breakdownByRate[rateKey].base + lineTax.netAmount)
      breakdownByRate[rateKey].vat = roundToTwoDecimals(breakdownByRate[rateKey].vat + lineTax.vatAmount)
    }
  }

  totalGross = roundToTwoDecimals(totalGross)
  totalNet = roundToTwoDecimals(totalNet)
  totalVat = roundToTwoDecimals(totalVat)

  // Ajuste de centavos por redondeo de sumatoria si corresponde
  if (invoiceType === 'FACTURA_A' && roundToTwoDecimals(totalNet + totalVat) !== totalGross) {
    totalVat = roundToTwoDecimals(totalGross - totalNet)
  }

  return {
    invoiceType,
    netAmount: totalNet,
    vatAmount: totalVat,
    totalAmount: totalGross,
    breakdownByRate,
    isFiscal: invoiceType !== 'COMPROBANTE_X',
  }
}
