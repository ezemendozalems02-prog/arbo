# ARBO OS — PRE-PHASE 7 CHECKPOINT
## 17. ESTRATEGIA DE PRUEBAS OBLIGATORIAS PARA FASE 7

---

## 1. SUITES DE PRUEBA REQUERIDAS

Para certificar la Fase 7, se diseñará la suite `scripts/validate_phase7_fiscal_automation.js`, cubriendo al menos las siguientes categorías de prueba:

1. **Discriminación de IVA**:
   - Factura A: Cálculo exacto de neto gravado + 21% IVA.
   - Factura B: Total consumidor final con desglose interno.
   - Factura C: Sin discriminación de IVA.
   - Comprobante X: Documento no fiscal de control interno.
2. **Generación de QR Oficial AFIP**:
   - Validación de la estructura Base64 conforme RG 4892.
3. **Correlatividad e Idempotencia**:
   - Verificación de secuencia estricta continua por Punto de Venta.
   - Prevención de duplicación ante reintentos con la misma venta.
4. **Protocolo de Contingencia**:
   - Simulación de timeout o error 500 de AFIP.
   - Confirmación de que la venta NO aborta y la orden se encola en `fiscal_contingency_queue`.
   - Resolución en background y asignación de CAE diferido.
5. **Aislamiento Multi-Tenant & RLS**:
   - La Organización A no puede leer ni emitir comprobantes con el CUIT de la Organización B.
6. **Pipeline de Automatizaciones**:
   - Verificación de disparadores por evento y prevención de spam mediante `execution_key` única.
7. **Regresión Completa**:
   - Continuidad del 100% de las pruebas de las Fases 1 a 6 (190 pruebas existentes intactas).
