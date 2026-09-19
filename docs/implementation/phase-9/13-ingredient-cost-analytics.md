# ARBO OS — FASE 9: ANALÍTICA DE COSTOS DE INGREDIENTES
## Detección de Insumos Críticos y Variación PPP

### 1. Detección del Insumo de Mayor Costo en Recetas
Cada análisis de receta examina el aporte monetario ponderado de cada ingrediente:
- `costo_aporte = cantidad_en_unidad_base * costo_unitario_ppp`.
- Se identifica el insumo líder: aquel con mayor `costo_aporte` y su proporción porcentual sobre el costo total por porción.

### 2. Trazabilidad de Costos
Permite al administrador identificar instantáneamente cuál es el insumo responsable de una suba en el Food Cost general o de un producto específico, facilitando la renegociación con proveedores o el ajuste focalizado de porciones.
