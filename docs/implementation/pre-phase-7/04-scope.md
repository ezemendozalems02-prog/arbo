# ARBO OS — PRE-PHASE 7 CHECKPOINT
## 04. ALCANCE DETALLADO (SCOPE) DE FASE 7

---

## 1. COMPONENTES A IMPLEMENTAR EN FASE 7

### A. Módulo Fiscal Hexagonal
1. **Puerto Fiscal (`FiscalPort`)**: Interfaz abstracta para solicitud de emisión, anulación y consulta de estado tributario.
2. **Adaptador Mock Fiscal (`MockFiscalAdapter`)**: Generador determinista de CAE, número de comprobante y QR simulados para testing unitario, CI/CD y desarrollo local.
3. **Adaptador AFIP / ARCA WSFE (`AfipWsfeAdapter`)**:
   - Integración con Web Service de Autenticación y Autorización (WSAA) mediante certificado digital (`.crt`) y clave privada (`.key`).
   - Integración con Web Service de Facturación Electrónica (`WSFEv1`).
   - Métodos: `FECompUltimoAutorizado` (para sincronizar correlatividad) y `FECAESolicitar` (para obtención de CAE).
4. **Discriminador de Impuestos**:
   - Desglose de IVA según condición tributaria del cliente:
     - Factura A: IVA discriminado (Neto gravado + IVA 21% / 10.5%).
     - Factura B: IVA incluido a Consumidor Final.
     - Factura C: Sin discriminación de IVA (Régimen Simplificado / Monotributo).
     - Comprobante X: Documento no fiscal para auditoría de cobro y comandas.
5. **Generador de Código QR Fiscal Oficial**:
   - Estructura exigida por AFIP (URL con parámetros JSON base64: CUIT emisor, tipo comprobante, punto de venta, número, importe, fecha, CUIT/DNI receptor, CAE).

### B. Protocolo de Resiliencia & Contingencia Fiscal
1. **Tabla `fiscal_contingency_queue`**: Encolamiento automático de comprobantes pendientes cuando AFIP experimenta timeout o error 500/503.
2. **Worker Asíncrono de Reintento**: Reintento periódico que obtiene el CAE una vez restablecido el servicio de AFIP sin requerir intervención del cajero.

### C. Pipeline de Automatizaciones Operativas
1. **Tablas `automation_rules` & `automation_executions`**:
   - Disparadores basados en eventos (ej. `customer.created` $\rightarrow$ bienvenida ARBO Club) o tiempo (cron diario de cumpleaños).
   - Clave de idempotencia anti-spam para evitar envíos duplicados.
