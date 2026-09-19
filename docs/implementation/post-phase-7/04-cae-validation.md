# ARBO OS — POST-PHASE 7 CHECKPOINT
## 04. AUDITORÍA DEL CICLO DE VIDA DE CAE & CÓDIGO QR

---

## 1. INTEGRIDAD DEL CAE
- **Formato**: Validado con expresión regular estricta `/^\d{14}$/`. No se admiten strings arbitrarios o truncados.
- **Asignación Condicional**: El campo `cae` permanece `null` en comprobantes en estado `PENDING_CONTINGENCY` o `REJECTED`. Solo se completa cuando el proveedor emite autorización en firme.
- **Vencimiento**: Se almacena inmutablemente en `cae_expires_at` con formato ISO date.
- **Mock Determinista**: El adaptador Mock utiliza prefijo sintético `7428...` claramente distinguible de un CAE productivo real.

## 2. GENERACIÓN DEL CÓDIGO QR AFIP (RG 4892/2020)
- El generador `qrGenerator.js` construye el JSON con los 12 atributos exigidos por AFIP (`ver`, `fecha`, `cuit`, `ptoVta`, `tipoCmp`, `nroCmp`, `importe`, `moneda`, `ctz`, `tipoDocRec`, `nroDocRec`, `tipoCodAut`, `codAut`).
- Se verificó la codificación y decodificación simétrica en Base64 (`encodePayloadToBase64` y `decodeBase64ToPayload`).
- URL oficial resultante: `https://www.afip.gob.ar/fe/qr/?p={BASE64_VALIDADO}`.
