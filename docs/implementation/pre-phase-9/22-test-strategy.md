# ARBO OS — PRE-PHASE 9 CHECKPOINT
## 22. ESTRATEGIA DE PRUEBAS (TEST STRATEGY)

### 1. Suites Previas
- Baseline actual: **266 pruebas pasadas / 0 falladas** (Fases 1 a 8).
- Cero tolerancia a regresiones.

### 2. Plan de Pruebas Fase 9
Se implementará `scripts/validate_phase9_intelligence_analytics.js` cubriendo:
- Cálculo determinístico de compras sugeridas con factor de empaque.
- Resta de mercadería en tránsito en el cálculo de compras.
- Agrupación por proveedor de las sugerencias generadas.
- Conversión atómica de sugerencia a orden de compra.
- Disparo de alerta de Food Cost Crítico (>35%).
- Cálculo exacto de precio sugerido para restablecer el 30% de costo.
- Clasificación Kasavana-Smith en los 4 cuadrantes.
- Consistencia de reportes de ventas sin duplicar cobros.
- Paginación y filtrado temporal en reportes.
- Aislamiento multi-tenant en reportes y sugerencias.
- Regresión total (266 + N).
- Verificación de compilación de producción.
