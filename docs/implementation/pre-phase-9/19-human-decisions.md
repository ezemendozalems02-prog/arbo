# ARBO OS — PRE-PHASE 9 CHECKPOINT
## 19. DECISIONES HUMANAS PENDIENTES (HUMAN DECISIONS)

### DEC-09-01: Umbral Crítico de Food Cost %
- **Decisión**: Definir el porcentaje exacto a partir del cual un plato se cataloga como `FOOD_COST_CRITICAL`.
- **Opciones**:
  - Opción A: 35% fijo universal (estándar propuesto en `14-intelligence.md`).
  - Opción B: Configurable por categoría (ej. Bebidas 20%, Pastelería 28%, Platos de Cocina 35%).
- **Impacto**: Afecta el etiquetado y sugerencias automáticas de precios en el menú.
- **Recomendación**: Arrancar con 35% global por defecto permitiendo override por categoría.
- **Estado**: PENDING HUMAN APPROVAL.

### DEC-09-02: Algoritmo de Compra Sugerida con Transferencias en Tránsito
- **Decisión**: Determinar si la mercadería en tránsito hacia el depósito (`in_transit`) descuenta al 100% el déficit de compras sugeridas.
- **Opciones**:
  - Opción A: Descontar 100% de la mercadería en tránsito (evita duplicar pedidos al proveedor).
  - Opción B: Mostrar mercadería en tránsito como aviso informativo sin descontar automáticamente.
- **Impacto**: Impacta la cantidad final de bultos sugeridos.
- **Recomendación**: Opción A (descontar del déficit para optimizar capital de trabajo).
- **Estado**: PENDING HUMAN APPROVAL.
