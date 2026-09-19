# ARBO OS — PRE-PHASE 9 CHECKPOINT
## 11. FRONTERAS TRANSACCIONALES (ACID vs. EVENTUAL)

### 1. Clasificación de Operaciones en Fase 9
| Operación | Nivel de Garantía | Mecanismo |
| :--- | :--- | :--- |
| **Generación de Orden de Compra desde Sugerencia** | **ATOMIC (ACID)** | Bloque transaccional: pasa sugerencia a `ORDERED` y crea `purchases` con sus líneas |
| **Descarte de Sugerencia** | **ATOMIC** | `UPDATE purchase_suggestions SET status = 'DISMISSED'` |
| **Cálculo de Matriz Kasavana-Smith** | **READ MODEL (OLAP)** | Agregación periódica / bajo demanda sobre historial de ventas pasadas |
| **Detección de Food Cost Crítico** | **ASYNC / EVENTUAL** | Disparado tras mutación de costo de insumo o precio de plato sin retrasar la compra |
| **Generación de Reportes Analíticos** | **READ MODEL** | Consultas agregadas con paginación sobre réplica/índices de lectura |
