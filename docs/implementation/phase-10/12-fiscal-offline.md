# ARBO OS — FASE 10: FISCALIZACIÓN EN CONTINGENCIA
## Separación Estricta entre Venta y Factura AFIP

### 1. Principio Legal y Normativo
En la República Argentina (normativa AFIP/ARCA), la emisión de comprobantes electrónicos con Código de Autorización Electrónico (CAE) requiere validación criptográfica en servidores oficiales.
**ARBO OS jamás genera CAEs ficticios ni simula facturación fiscal en modo offline.**

### 2. Régimen de Contingencia (Fase 7)
- Toda venta realizada sin conexión genera comprobante no fiscal o ticket de comanda.
- La solicitud fiscal se encola en la cola de contingencia (`fiscal_contingency_queue`) con estado `CONTINGENCY_PENDING`.
- Al volver internet, el motor fiscal reintenta la emisión del comprobante oficial dentro de las 72 horas reglamentarias.
