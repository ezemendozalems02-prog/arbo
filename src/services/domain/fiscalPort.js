// ARBO OS — DOMAIN SERVICE: FISCAL PORT (HEXAGONAL ARCHITECTURE)
// Abstracción desacoplada para la capa fiscal argentina (AFIP / ARCA).
// Garantiza que el dominio de Ventas nunca dependa de un SDK o protocolo específico.

/**
 * Puerto abstracto para proveedores fiscales.
 * Define el contrato inmutable que cualquier adaptador (Mock o Real) debe implementar.
 */
export class FiscalPort {
  /**
   * Solicita la autorización de un comprobante electrónico (CAE).
   * @param {Object} invoiceRequest Datos fiscales del comprobante (tipo, número, importes, receptor)
   * @returns {Promise<{
   *   success: boolean,
   *   cae: string|null,
   *   caeExpiresAt: string|null,
   *   status: 'AUTHORIZED'|'REJECTED'|'PENDING_CONTINGENCY',
   *   errorCode?: string,
   *   errorMessage?: string,
   *   rawResponse?: any
   * }>}
   */
  async authorizeInvoice(invoiceRequest) {
    throw new Error('NOT_IMPLEMENTED: FiscalPort.authorizeInvoice debe ser implementado por un adaptador.')
  }

  /**
   * Solicita la anulación o nota de crédito de un comprobante.
   */
  async cancelInvoice(cancelRequest) {
    throw new Error('NOT_IMPLEMENTED: FiscalPort.cancelInvoice debe ser implementado por un adaptador.')
  }

  /**
   * Consulta el estado operativo del servicio fiscal externo.
   * @returns {Promise<{ isAlive: boolean, mode: string, responseTimeMs: number }>}
   */
  async getProviderStatus() {
    throw new Error('NOT_IMPLEMENTED: FiscalPort.getProviderStatus debe ser implementado por un adaptador.')
  }
}
