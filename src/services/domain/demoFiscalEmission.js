// ARBO OS — EMISIÓN FISCAL DEMO (HOMOLOGACIÓN SIMULADA · SIN VALIDEZ FISCAL)
//
// Genera comprobantes SIMULADOS para poder VER y PROBAR el flujo de facturación
// completo (autorizado, rechazado, contingencia con reintento) en el POS y en la
// pantalla Fiscal. NO se conecta a AFIP/ARCA, NO tiene validez fiscal y el CAE es
// sintético. Todo queda marcado como demo (`demo: true`,
// `fiscal_validity: 'SIN_VALIDEZ_FISCAL'`) para que ninguna pantalla pueda
// presentarlo como un comprobante real autorizado.
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

// Datos del contribuyente para la DEMO (NO son datos fiscales reales).
export const DEMO_TAXPAYER = [
  ['Razón social', 'Arbo Patagonia S.R.L. (DEMO)'],
  ['CUIT emisor', '30-71234567-8 (demo)'],
  ['Condición frente al IVA', 'Responsable Inscripto'],
  ['Punto de venta', '0001'],
  ['Certificado digital', 'Homologación · simulado'],
  ['Conexión con ARCA', 'Homologación simulada · activa'],
]

// Modos de respuesta de AFIP que se pueden simular desde la pantalla Fiscal.
export const DEMO_FISCAL_MODES = [
  { id: 'SUCCESS', label: 'Autorizado' },
  { id: 'REJECTION', label: 'Rechazado' },
  { id: 'CONTINGENCY', label: 'AFIP caído (contingencia)' },
]

export const STATUS_LABELS = {
  AUTHORIZED: 'Autorizado',
  REJECTED: 'Rechazado',
  PENDING_CONTINGENCY: 'En contingencia',
}

const DEMO_REJECTION = {
  errorCode: '10016',
  errorMessage: 'Rechazo simulado de AFIP: CondicionIVAReceptorId requerido (RG 5616).',
}

const INVOICE_TYPE_LABELS = { FACTURA_A: 'Factura A', FACTURA_B: 'Factura B', FACTURA_C: 'Factura C' }

// CAE sintético de 14 dígitos, determinista y claramente de demo. SIN VALIDEZ.
function syntheticCae(seed) {
  const base = 70000000000000
  return String(base + (Math.abs(Number(seed) || 1) % 9000000)).slice(0, 14)
}

function caeVto() {
  const d = new Date()
  d.setDate(d.getDate() + 10) // Vencimiento estándar de CAE: +10 días
  return d.toISOString().slice(0, 10)
}

function qrFor({ invoiceNumber, totalAmount, issueDate, cae }) {
  return generateAfipQrUrl({
    emisorCuit: DEMO_FISCAL_CONFIG.emisorCuit,
    posNumber: DEMO_FISCAL_CONFIG.posNumber,
    invoiceType: DEMO_FISCAL_CONFIG.invoiceType,
    invoiceNumber,
    totalAmount,
    issueDate,
    cae,
  })
}

/**
 * Construye un comprobante fiscal DEMO para una venta confirmada.
 * `mode`: 'SUCCESS' (autorizado) | 'REJECTION' (rechazado) | 'CONTINGENCY'.
 * Reutiliza la correlatividad, el motor de impuestos y el generador de QR reales.
 * Nunca devuelve un comprobante válido ante ARCA.
 */
export function buildDemoFiscalInvoice({ sale, fiscalInvoices = [], mode = 'SUCCESS', organizationId = 'demo-org' }) {
  const invoiceType = DEMO_FISCAL_CONFIG.invoiceType
  const posNumber = DEMO_FISCAL_CONFIG.posNumber
  const invoiceNumber = getNextInvoiceNumber({ fiscalInvoices, organizationId, posNumber, invoiceType })
  const taxes = calculateInvoiceTaxes([{ subtotal: Number(sale.total) || 0 }], invoiceType)
  const issueDate = new Date().toISOString()

  const base = {
    id: `fdemo_${sale.id}`,
    organization_id: organizationId,
    sale_id: sale.id,
    sale_number: sale.number,
    customer_name: sale.customerName || 'Consumidor Final',
    invoice_type: invoiceType,
    pos_number: posNumber,
    invoice_number: invoiceNumber,
    net_amount: taxes.netAmount,
    vat_amount: taxes.vatAmount,
    total_amount: taxes.totalAmount,
    issued_at: issueDate,
    cae: null,
    cae_expires_at: null,
    afip_qr_url: null,
    error_code: null,
    error_message: null,
    // Sello de demo imposible de confundir con un comprobante real.
    demo: true,
    environment: DEMO_FISCAL_CONFIG.environment,
    fiscal_validity: 'SIN_VALIDEZ_FISCAL',
    status: 'AUTHORIZED',
  }

  if (mode === 'REJECTION') {
    return { ...base, status: 'REJECTED', error_code: DEMO_REJECTION.errorCode, error_message: DEMO_REJECTION.errorMessage }
  }
  if (mode === 'CONTINGENCY') {
    return { ...base, status: 'PENDING_CONTINGENCY', error_message: 'AFIP no disponible (simulado): comprobante encolado en contingencia.' }
  }

  // SUCCESS (autorizado)
  const cae = syntheticCae((Number(sale.number) || 1) * 7 + invoiceNumber)
  return {
    ...base,
    status: 'AUTHORIZED',
    cae,
    cae_expires_at: caeVto(),
    afip_qr_url: qrFor({ invoiceNumber, totalAmount: taxes.totalAmount, issueDate, cae }),
  }
}

/**
 * Reintenta (demo) un comprobante en contingencia: lo pasa a AUTORIZADO con CAE.
 */
export function authorizeContingencyInvoice(inv) {
  const cae = syntheticCae((Number(inv.sale_number) || 1) * 7 + Number(inv.invoice_number) + 3)
  return {
    ...inv,
    status: 'AUTHORIZED',
    cae,
    cae_expires_at: caeVto(),
    afip_qr_url: qrFor({ invoiceNumber: inv.invoice_number, totalAmount: inv.total_amount, issueDate: inv.issued_at, cae }),
    error_message: null,
  }
}

/** "Factura B 0001-00000001" */
export function formatInvoiceLabel(inv) {
  const t = INVOICE_TYPE_LABELS[inv.invoice_type] || inv.invoice_type
  return `${t} ${String(inv.pos_number).padStart(4, '0')}-${String(inv.invoice_number).padStart(8, '0')}`
}
