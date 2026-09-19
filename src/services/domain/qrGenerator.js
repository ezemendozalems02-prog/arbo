// ARBO OS — DOMAIN SERVICE: AFIP QR GENERATOR (RESOLUCIÓN GENERAL 4892/2020)
// Genera el payload JSON oficial y la URL Base64 para comprobantes fiscales electrónicos.

import { AFIP_CBTE_TYPES, AFIP_DOC_TYPES } from './afipWsfeAdapter.js'

/**
 * Genera el payload JSON formal exigido por la RG 4892/2020 de AFIP.
 */
export function buildAfipQrPayload({
  emisorCuit,
  posNumber,
  invoiceType,
  invoiceNumber,
  totalAmount,
  issueDate,
  customerTaxId,
  customerTaxCondition,
  customerDocType,
  cae,
}) {
  const cleanCuit = Number(String(emisorCuit || '30712345678').replace(/\D/g, ''))
  const cleanPtoVta = Number(posNumber || 1)
  const cleanNroCmp = Number(invoiceNumber || 1)
  const cleanImporte = Number(Number(totalAmount || 0).toFixed(2))
  const cleanFecha = issueDate ? issueDate.slice(0, 10) : new Date().toISOString().slice(0, 10)
  const cleanCae = Number(String(cae || 0).replace(/\D/g, ''))

  const tipoCmp = AFIP_CBTE_TYPES[invoiceType] || 6 // Por defecto 6 (Factura B)
  
  let tipoDocRec = AFIP_DOC_TYPES.SIN_IDENTIFICAR
  let nroDocRec = 0

  if (customerTaxCondition === 'RESPONSABLE_INSCRIPTO' || customerDocType === 'CUIT') {
    tipoDocRec = AFIP_DOC_TYPES.CUIT
    nroDocRec = customerTaxId ? Number(String(customerTaxId).replace(/\D/g, '')) : 0
  } else if (customerTaxId && customerDocType === 'DNI') {
    tipoDocRec = AFIP_DOC_TYPES.DNI
    nroDocRec = Number(String(customerTaxId).replace(/\D/g, ''))
  }

  return {
    ver: 1,
    fecha: cleanFecha,
    cuit: cleanCuit,
    ptoVta: cleanPtoVta,
    tipoCmp,
    nroCmp: cleanNroCmp,
    importe: cleanImporte,
    moneda: 'PES',
    ctz: 1,
    tipoDocRec,
    nroDocRec,
    tipoCodAut: 'E',
    codAut: cleanCae,
  }
}

/**
 * Convierte el payload en Base64 compatible con navegador y Node.js.
 */
export function encodePayloadToBase64(payload) {
  const jsonString = JSON.stringify(payload)
  if (typeof btoa === 'function') {
    return btoa(jsonString)
  }
  return Buffer.from(jsonString, 'utf-8').toString('base64')
}

/**
 * Decodifica un payload Base64 para validaciones y pruebas.
 */
export function decodeBase64ToPayload(base64String) {
  let jsonString
  if (typeof atob === 'function') {
    jsonString = atob(base64String)
  } else {
    jsonString = Buffer.from(base64String, 'base64').toString('utf-8')
  }
  return JSON.parse(jsonString)
}

/**
 * Genera la URL pública oficial de validación AFIP.
 */
export function generateAfipQrUrl(params) {
  const payload = buildAfipQrPayload(params)
  const base64 = encodePayloadToBase64(payload)
  return `https://www.afip.gob.ar/fe/qr/?p=${base64}`
}
