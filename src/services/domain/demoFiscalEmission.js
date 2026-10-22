// ARBO OS — EMISIÓN FISCAL DEMO (HOMOLOGACIÓN SIMULADA · SIN VALIDEZ FISCAL)
//
// Genera un comprobante SIMULADO para poder VER el estado de facturación de una
// venta en el POS y en la pantalla Fiscal. NO se conecta a AFIP/ARCA, NO tiene
// validez fiscal y el CAE es sintético. Todo lo que produce queda marcado como
// demo (`demo: true`, `fiscal_validity: 'SIN_VALIDEZ_FISCAL'`) para que ninguna
// pantalla pueda presentarlo como un comprobante real autorizado.
//
// La emisión REAL de homologación (CAE verdadero del entorno de prueba de AFIP)
// necesita, aparte: certificado digital + CUIT de homologación generados por el
// contribuyente, y un servicio de SERVIDOR que firme el WSAA y llame al WSFE.
// Eso NO está acá y no se puede hacer desde el navegador.

import { getNextInvoiceNumber } from './fiscalManager.js'
import { calculateInvoiceTaxes } from './taxEngine.js'
import { generateAfipQrUrl } from './qrGenerator.js'

export const DEMO_FISCAL_CONFIG = {
  enabled: true,
  environment: 'HOMOLOGACION_SIMULADA',
  posNumber: 1,
  invoiceType: 'FACTURA_B',
  // CUIT de ejemplo para el QR demo. NO es un CUIT real habilitado.
  emisorCuit: '30712345678',
}

// CAE sintético de 14 dígitos, determinista y claramente de demo. SIN VALIDEZ.
function syntheticCae(seed) {
  const base = 70000000000000
  return String(base + (Math.abs(Number(seed) || 1) % 9000000)).slice(0, 14)
}

/**
 * Construye un comprobante fiscal DEMO para una venta ya confirmada.
 * Reutiliza la correlatividad, el motor de impuestos y el generador de QR reales.
 * @returns comprobante simulado (nunca un comprobante válido ante ARCA)
 */
export function buildDemoFiscalInvoice({ sale, fiscalInvoices = [], organizationId = 'demo-org' }) {
  const invoiceType = DEMO_FISCAL_CONFIG.invoiceType
  const posNumber = DEMO_FISCAL_CONFIG.posNumber

  const invoiceNumber = getNextInvoiceNumber({ fiscalInvoices, organizationId, posNumber, invoiceType })
  const taxes = calculateInvoiceTaxes([{ subtotal: Number(sale.total) || 0 }], invoiceType)

  const issueDate = new Date().toISOString()
  const cae = syntheticCae((Number(sale.number) || 1) * 7 + invoiceNumber)

  const expires = new Date()
  expires.setDate(expires.getDate() + 10) // Vencimiento estándar de CAE: +10 días
  const caeExpiresAt = expires.toISOString().slice(0, 10)

  const afipQrUrl = generateAfipQrUrl({
    emisorCuit: DEMO_FISCAL_CONFIG.emisorCuit,
    posNumber,
    invoiceType,
    invoiceNumber,
    totalAmount: taxes.totalAmount,
    issueDate,
    cae,
  })

  return {
    id: `fdemo_${sale.id}`,
    organization_id: organizationId,
    sale_id: sale.id,
    sale_number: sale.number,
    invoice_type: invoiceType,
    pos_number: posNumber,
    invoice_number: invoiceNumber,
    net_amount: taxes.netAmount,
    vat_amount: taxes.vatAmount,
    total_amount: taxes.totalAmount,
    status: 'AUTHORIZED', // autorizado en la SIMULACIÓN, no ante ARCA
    cae,
    cae_expires_at: caeExpiresAt,
    afip_qr_url: afipQrUrl,
    issued_at: issueDate,
    // Sello de demo imposible de confundir con un comprobante real.
    demo: true,
    environment: DEMO_FISCAL_CONFIG.environment,
    fiscal_validity: 'SIN_VALIDEZ_FISCAL',
  }
}

const INVOICE_TYPE_LABELS = {
  FACTURA_A: 'Factura A', FACTURA_B: 'Factura B', FACTURA_C: 'Factura C',
}

/** "Factura B 0001-00000001" */
export function formatInvoiceLabel(inv) {
  const t = INVOICE_TYPE_LABELS[inv.invoice_type] || inv.invoice_type
  return `${t} ${String(inv.pos_number).padStart(4, '0')}-${String(inv.invoice_number).padStart(8, '0')}`
}
