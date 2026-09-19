# ARBO OS — PRE-PHASE 7 CHECKPOINT
## 18. CRITERIOS DE ACEPTACIÓN OBJETIVOS (SUCCESS CRITERIA)

---

## 1. CRITERIOS DE ÉXITO DE LA FASE 7

La Fase 7 se considerará aprobada única y exclusivamente si se cumplen todos los siguientes puntos:

- [ ] Modelo de comprobantes fiscales `fiscal_invoices` versionado con RLS.
- [ ] Adaptador fiscal desacoplado (`FiscalPort`) con implementación `MockFiscalAdapter` determinista.
- [ ] Emisión de Factura A con cálculo de Neto Gravado + 21% IVA validado.
- [ ] Emisión de Factura B / C a Consumidor Final validada.
- [ ] Emisión de Comprobante Interno X validada.
- [ ] Generación de cadena y código QR oficial conforme reglamentación de AFIP.
- [ ] Desacople transaccional: La venta en salón no se bloquea ante fallas o timeouts de AFIP.
- [ ] Cola de contingencia (`fiscal_contingency_queue`) que almacena solicitudes demoradas.
- [ ] Procesamiento diferido y obtención asíncrona de CAE.
- [ ] Correlatividad estricta sin saltos numéricos por Punto de Venta.
- [ ] Idempotencia: Una venta no puede emitir dos comprobantes fiscales idénticos.
- [ ] Aislamiento multi-tenant validado: CUIT y facturación aisladas por organización.
- [ ] Pipeline de automatizaciones con clave de idempotencia anti-spam.
- [ ] 190 pruebas existentes de Fases 1 a 6 continuando con resultado 100% aprobado.
- [ ] Nuevas pruebas de Fase 7 aprobadas al 100%.
- [ ] Compilación de producción limpia (`npm run build`).
