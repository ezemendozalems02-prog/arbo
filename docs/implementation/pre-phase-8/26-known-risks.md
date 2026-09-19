# ARBO OS — PRE-PHASE 8 CHECKPOINT
## 26. MATRIZ CONSOLIDADA DE RIESGOS PARA FASE 8

---

## 1. REGISTRO FORMAL DE RIESGOS

| Riesgo | Impacto | Probabilidad | Estrategia de Mitigación | Estado |
| :--- | :---: | :---: | :--- | :---: |
| **Doble Recepción Concurrente** | CRÍTICO | BAJA | Actualización condicional `WHERE status = 'DISPATCHED'` y verificación de `ROW_COUNT`. | MITIGACIÓN DISEÑADA |
| **Descuento de Stock en Sucursal Equivocada** | ALTO | BAJA | `executeSaleCheckoutAtomic` filtra estrictamente por `branch_id` y `warehouse_id`. | MITIGACIÓN DISEÑADA |
| **Inconsistencia de PPP en Destino** | MEDIO | BAJA | Reutilización estricta de la función auditada `calculateWeightedAverageCost`. | MITIGACIÓN DISEÑADA |
| **Degradación de Rendimiento por Consultas Consolidadas** | MEDIO | MEDIA | Plan de índices compuestos sobre `stock_transfers` y filtros temporales acotados. | PLANIFICADO |
| **Scope Creep hacia Logística Compleja** | ALTO | MEDIA | Delimitación taxativa en Non-Scope (sin aduanas, sin flotas vehiculares externas). | CONTROLADO |

---

## 2. VEREDICTO DE RIESGO
El nivel de riesgo general para la implementación de la Fase 8 es **BAJO / CONTROLADO**, ya que el sistema cuenta con cimientos sólidos y probados.
