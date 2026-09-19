// ARBO OS — DOMAIN SERVICE: MOCK FISCAL ADAPTER
// Adaptador de pruebas y desarrollo local para simulación determinista de AFIP/ARCA WSFE.

import { FiscalPort } from './fiscalPort.js'

export class MockFiscalAdapter extends FiscalPort {
  /**
   * @param {Object} options Configuración de comportamiento del mock
   * @param {'SUCCESS'|'REJECTION'|'TIMEOUT'|'UNAVAILABLE'} options.mode Modo de simulación
   * @param {number} options.simulatedLatencyMs Latencia simulada en milisegundos
   * @param {string} options.rejectionErrorCode Código de error para modo REJECTION
   * @param {string} options.rejectionErrorMessage Mensaje para modo REJECTION
   */
  constructor(options = {}) {
    super()
    this.mode = options.mode || 'SUCCESS'
    this.simulatedLatencyMs = options.simulatedLatencyMs || 0
    this.rejectionErrorCode = options.rejectionErrorCode || '10014'
    this.rejectionErrorMessage = options.rejectionErrorMessage || 'CUIT del receptor no registrado o inválido en padrón AFIP.'
    this.caeSequence = 10000000000000 // Base de 14 dígitos sintética
  }

  setMode(mode) {
    this.mode = mode
  }

  setLatency(ms) {
    this.simulatedLatencyMs = ms
  }

  async authorizeInvoice(invoiceRequest) {
    if (this.simulatedLatencyMs > 0) {
      await new Promise(res => setTimeout(res, this.simulatedLatencyMs))
    }

    if (this.mode === 'TIMEOUT') {
      const error = new Error('FISCAL_TIMEOUT: Tiempo de espera agotado comunicando con AFIP WSFE (>3.5s).')
      error.code = 'FISCAL_TIMEOUT'
      throw error
    }

    if (this.mode === 'UNAVAILABLE') {
      const error = new Error('AFIP_SERVICE_UNAVAILABLE: Servicio WSFE de AFIP no disponible (HTTP 503 / Servidores en mantenimiento).')
      error.code = 'AFIP_SERVICE_UNAVAILABLE'
      throw error
    }

    if (this.mode === 'REJECTION') {
      return {
        success: false,
        cae: null,
        caeExpiresAt: null,
        status: 'REJECTED',
        errorCode: this.rejectionErrorCode,
        errorMessage: this.rejectionErrorMessage,
        rawResponse: {
          FeCabResp: { Resultado: 'R' },
          Errors: [{ Code: this.rejectionErrorCode, Msg: this.rejectionErrorMessage }],
        },
      }
    }

    // Modo SUCCESS: Generar CAE determinista
    const sequentialNum = invoiceRequest.invoice_number || 1
    const syntheticCae = `7428${String(this.caeSequence + sequentialNum).slice(-10)}`
    
    // Vencimiento estándar de CAE: +10 días corridos a partir de la emisión
    const expiresDate = new Date()
    expiresDate.setDate(expiresDate.getDate() + 10)
    const caeExpiresAt = expiresDate.toISOString().split('T')[0]

    return {
      success: true,
      cae: syntheticCae,
      caeExpiresAt,
      status: 'AUTHORIZED',
      rawResponse: {
        FeCabResp: { Resultado: 'A', Cae: syntheticCae, FchVto: caeExpiresAt.replace(/-/g, '') },
      },
    }
  }

  async cancelInvoice(cancelRequest) {
    return this.authorizeInvoice({ ...cancelRequest, isCreditNote: true })
  }

  async getProviderStatus() {
    return {
      isAlive: this.mode !== 'UNAVAILABLE',
      mode: `MOCK_${this.mode}`,
      responseTimeMs: this.simulatedLatencyMs,
    }
  }
}
