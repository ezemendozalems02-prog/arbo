// ARBO OS — DOMAIN SERVICE: FISCAL MANAGER
// Orquesta la emisión fiscal, cálculo de correlatividad, contingencia asíncrona e idempotencia.
// Regla Crítica: Una caída o timeout de AFIP NUNCA aborta ni revierte una venta confirmada.

import { calculateInvoiceTaxes } from './taxEngine.js'
import { generateAfipQrUrl } from './qrGenerator.js'

/**
 * Determina el siguiente número correlativo estricto por Punto de Venta y Tipo de Comprobante.
 */
export function getNextInvoiceNumber({ fiscalInvoices = [], organizationId, posNumber, invoiceType }) {
  const matchingInvoices = fiscalInvoices.filter(
    inv => inv.organization_id === organizationId &&
           Number(inv.pos_number) === Number(posNumber) &&
           inv.invoice_type === invoiceType
  )

  if (matchingInvoices.length === 0) {
    return 1
  }

  const maxNumber = Math.max(...matchingInvoices.map(inv => Number(inv.invoice_number) || 0))
  return maxNumber + 1
}

/**
 * Emite un comprobante fiscal para una venta completada.
 */
export async function issueFiscalInvoiceForSale({
  state,
  saleId,
  invoiceType = 'FACTURA_B',
  posNumber = 1,
  customerData = {},
  fiscalAdapter,
}) {
  const {
    organizations = [],
    branches = [],
    sales = [],
    saleItems = [],
    fiscalInvoices = [],
    contingencyQueue = [],
  } = state

  // 1. Validar existencia de la venta
  const sale = sales.find(s => s.id === saleId)
  if (!sale) {
    throw new Error(`SALE_NOT_FOUND: No se encontró la venta ${saleId} para emisión fiscal.`)
  }

  // 2. Validar idempotencia estricta: No duplicar comprobante para la misma venta y tipo
  const existingInvoice = fiscalInvoices.find(
    inv => inv.sale_id === saleId && inv.invoice_type === invoiceType
  )
  if (existingInvoice) {
    return {
      success: true,
      alreadyIssued: true,
      updatedState: state,
      invoice: existingInvoice,
      status: existingInvoice.status,
    }
  }

  const org = organizations.find(o => o.id === sale.organization_id) || {
    id: sale.organization_id,
    cuit: '30712345678',
    tax_condition: 'RESPONSABLE_INSCRIPTO',
    legal_name: 'ARBO S.R.L.',
  }

  const branch = branches.find(b => b.id === sale.branch_id) || {
    id: sale.branch_id,
    fiscal_pos_number: posNumber,
  }

  const activePos = posNumber || branch.fiscal_pos_number || 1

  // 3. Obtener ítems y calcular impuestos
  const items = saleItems.filter(si => si.sale_id === saleId)
  const taxSummary = calculateInvoiceTaxes(items, invoiceType, { taxCondition: org.tax_condition })

  // 4. Obtener correlativo
  const invoiceNumber = getNextInvoiceNumber({
    fiscalInvoices,
    organizationId: sale.organization_id,
    posNumber: activePos,
    invoiceType,
  })

  const invoiceId = `finv_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  const issueDate = new Date().toISOString()

  const fiscalRequest = {
    invoice_id: invoiceId,
    invoice_type: invoiceType,
    pos_number: activePos,
    invoice_number: invoiceNumber,
    net_amount: taxSummary.netAmount,
    vat_amount: taxSummary.vatAmount,
    total_amount: taxSummary.totalAmount,
    customer_tax_id: customerData.taxId || null,
    customer_name: customerData.name || 'Consumidor Final',
    customer_tax_condition: customerData.taxCondition || 'CONSUMIDOR_FINAL',
    customer_doc_type: customerData.docType || 'DNI',
    issue_date: issueDate,
  }

  let authResult = null
  let isContingency = false

  try {
    authResult = await fiscalAdapter.authorizeInvoice(fiscalRequest)
  } catch (adapterError) {
    // Timeout o servidor caído de AFIP: Activar contingencia asíncrona sin abortar la venta
    isContingency = true
    authResult = {
      success: false,
      cae: null,
      caeExpiresAt: null,
      status: 'PENDING_CONTINGENCY',
      errorMessage: adapterError.message,
    }
  }

  if (isContingency || authResult.status === 'PENDING_CONTINGENCY') {
    // Registrar comprobante en contingencia
    const pendingInvoice = {
      id: invoiceId,
      organization_id: sale.organization_id,
      branch_id: sale.branch_id,
      sale_id: saleId,
      invoice_type: invoiceType,
      pos_number: activePos,
      invoice_number: invoiceNumber,
      cae: null,
      cae_expires_at: null,
      afip_qr_url: null,
      net_amount: taxSummary.netAmount,
      vat_amount: taxSummary.vatAmount,
      total_amount: taxSummary.totalAmount,
      customer_tax_id: fiscalRequest.customer_tax_id,
      customer_name: fiscalRequest.customer_name,
      customer_tax_condition: fiscalRequest.customer_tax_condition,
      status: 'PENDING_CONTINGENCY',
      created_at: issueDate,
    }

    const contingencyItem = {
      id: `cq_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      organization_id: sale.organization_id,
      branch_id: sale.branch_id,
      sale_id: saleId,
      fiscal_invoice_id: invoiceId,
      payload: fiscalRequest,
      retry_count: 0,
      max_retries: 5,
      next_attempt_at: issueDate,
      last_error: authResult.errorMessage || 'Encolado por indisponibilidad de proveedor fiscal',
      status: 'PENDING',
      created_at: issueDate,
      updated_at: issueDate,
    }

    return {
      success: true,
      isContingency: true,
      updatedState: {
        ...state,
        fiscalInvoices: [...fiscalInvoices, pendingInvoice],
        contingencyQueue: [...contingencyQueue, contingencyItem],
        sales: sales.map(s => s.id === saleId ? { ...s, fiscal_invoice_id: invoiceId } : s),
      },
      invoice: pendingInvoice,
      contingencyItem,
      status: 'PENDING_CONTINGENCY',
    }
  }

  if (authResult.status === 'REJECTED') {
    const rejectedInvoice = {
      id: invoiceId,
      organization_id: sale.organization_id,
      branch_id: sale.branch_id,
      sale_id: saleId,
      invoice_type: invoiceType,
      pos_number: activePos,
      invoice_number: invoiceNumber,
      cae: null,
      cae_expires_at: null,
      afip_qr_url: null,
      net_amount: taxSummary.netAmount,
      vat_amount: taxSummary.vatAmount,
      total_amount: taxSummary.totalAmount,
      customer_tax_id: fiscalRequest.customer_tax_id,
      customer_name: fiscalRequest.customer_name,
      customer_tax_condition: fiscalRequest.customer_tax_condition,
      status: 'REJECTED',
      created_at: issueDate,
      rejection_error: authResult.errorMessage,
    }

    return {
      success: false,
      updatedState: {
        ...state,
        fiscalInvoices: [...fiscalInvoices, rejectedInvoice],
      },
      invoice: rejectedInvoice,
      status: 'REJECTED',
      error: authResult.errorMessage,
    }
  }

  // Emisión exitosa (AUTHORIZED)
  const qrUrl = invoiceType !== 'COMPROBANTE_X' ? generateAfipQrUrl({
    emisorCuit: org.cuit,
    posNumber: activePos,
    invoiceType,
    invoiceNumber,
    totalAmount: taxSummary.totalAmount,
    issueDate,
    customerTaxId: fiscalRequest.customer_tax_id,
    customerTaxCondition: fiscalRequest.customer_tax_condition,
    customerDocType: fiscalRequest.customer_doc_type,
    cae: authResult.cae,
  }) : null

  const authorizedInvoice = {
    id: invoiceId,
    organization_id: sale.organization_id,
    branch_id: sale.branch_id,
    sale_id: saleId,
    invoice_type: invoiceType,
    pos_number: activePos,
    invoice_number: invoiceNumber,
    cae: authResult.cae,
    cae_expires_at: authResult.caeExpiresAt,
    afip_qr_url: qrUrl,
    net_amount: taxSummary.netAmount,
    vat_amount: taxSummary.vatAmount,
    total_amount: taxSummary.totalAmount,
    customer_tax_id: fiscalRequest.customer_tax_id,
    customer_name: fiscalRequest.customer_name,
    customer_tax_condition: fiscalRequest.customer_tax_condition,
    status: 'AUTHORIZED',
    created_at: issueDate,
  }

  return {
    success: true,
    isContingency: false,
    updatedState: {
      ...state,
      fiscalInvoices: [...fiscalInvoices, authorizedInvoice],
      sales: sales.map(s => s.id === saleId ? { ...s, fiscal_invoice_id: invoiceId } : s),
    },
    invoice: authorizedInvoice,
    status: 'AUTHORIZED',
  }
}

/**
 * Procesa reintentos sobre la cola de contingencia fiscal.
 */
export async function processContingencyQueue({ state, fiscalAdapter }) {
  const { contingencyQueue = [], fiscalInvoices = [], organizations = [] } = state

  const pendingItems = contingencyQueue.filter(item => item.status === 'PENDING')
  if (pendingItems.length === 0) {
    return { success: true, processedCount: 0, updatedState: state }
  }

  let updatedQueue = [...contingencyQueue]
  let updatedInvoices = [...fiscalInvoices]

  for (const item of pendingItems) {
    try {
      const authResult = await fiscalAdapter.authorizeInvoice(item.payload)

      if (authResult.success && authResult.cae) {
        // Éxito: Resolver contingencia y actualizar factura con CAE
        const org = organizations.find(o => o.id === item.organization_id) || { cuit: '30712345678' }
        const qrUrl = generateAfipQrUrl({
          emisorCuit: org.cuit,
          posNumber: item.payload.pos_number,
          invoiceType: item.payload.invoice_type,
          invoiceNumber: item.payload.invoice_number,
          totalAmount: item.payload.total_amount,
          issueDate: item.payload.issue_date,
          customerTaxId: item.payload.customer_tax_id,
          customerTaxCondition: item.payload.customer_tax_condition,
          customerDocType: item.payload.customer_doc_type,
          cae: authResult.cae,
        })

        updatedInvoices = updatedInvoices.map(inv => {
          if (inv.id === item.fiscal_invoice_id) {
            return {
              ...inv,
              cae: authResult.cae,
              cae_expires_at: authResult.caeExpiresAt,
              afip_qr_url: qrUrl,
              status: 'AUTHORIZED',
              resolved_from_contingency_at: new Date().toISOString(),
            }
          }
          return inv
        })

        updatedQueue = updatedQueue.map(q => {
          if (q.id === item.id) {
            return {
              ...q,
              status: 'RESOLVED',
              updated_at: new Date().toISOString(),
            }
          }
          return q
        })
      } else {
        // Falló de nuevo
        const nextRetry = item.retry_count + 1
        const isPermanent = nextRetry >= item.max_retries
        updatedQueue = updatedQueue.map(q => {
          if (q.id === item.id) {
            return {
              ...q,
              retry_count: nextRetry,
              status: isPermanent ? 'FAILED_PERMANENT' : 'PENDING',
              last_error: authResult.errorMessage || 'Error en reintento',
              updated_at: new Date().toISOString(),
            }
          }
          return q
        })
      }
    } catch (err) {
      const nextRetry = item.retry_count + 1
      const isPermanent = nextRetry >= item.max_retries
      updatedQueue = updatedQueue.map(q => {
        if (q.id === item.id) {
          return {
            ...q,
            retry_count: nextRetry,
            status: isPermanent ? 'FAILED_PERMANENT' : 'PENDING',
            last_error: err.message,
            updated_at: new Date().toISOString(),
          }
        }
        return q
      })
    }
  }

  return {
    success: true,
    processedCount: pendingItems.length,
    updatedState: {
      ...state,
      contingencyQueue: updatedQueue,
      fiscalInvoices: updatedInvoices,
    },
  }
}
