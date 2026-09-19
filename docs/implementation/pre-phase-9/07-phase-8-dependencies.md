# ARBO OS — PRE-PHASE 9 CHECKPOINT
## 07. DEPENDENCIAS DE FASE 8 SOBRE FASE 9

### 1. Auditoría de Requisitos
La Fase 9 se apoya en los cimientos construidos en la Fase 8:

| Componente Fase 8 | Rol en Fase 9 | Clasificación |
| :--- | :--- | :---: |
| **`warehouses` y `branch_id`** | Sugerencia de compras y cálculo de déficit por depósito físico específico | **REQUIRED** |
| **`stock_transfers` (en tránsito)** | El cálculo de reposición resta insumos que ya vienen en camino (`Stock Actual + En Tránsito`) para no pedir de más | **REQUIRED** |
| **`inventory_movements.warehouse_id`** | Fuente de verdad para evaluar stock mínimo por depósito | **REQUIRED** |
| **Catálogo Maestro & Overrides** | Costeo de recetas con precios base y precios locales por sucursal | **REQUIRED** |
| **`getExecutiveConsolidatedMetrics`** | Base analítica para los reportes de rendimiento de la carta y ventas | **REQUIRED** |
| **RLS Multi-Tenant** | Asegura que las analíticas y compras sugeridas no mezclen datos entre cadenas | **REQUIRED** |
| **`audit_logs`** | Registro de generación de sugerencias y modificaciones de umbrales | **REQUIRED** |
