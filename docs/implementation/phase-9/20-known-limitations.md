# ARBO OS — FASE 9: LIMITACIONES CONOCIDAS (KNOWN LIMITATIONS)
## Alcance y Fronteras Operativas

### 1. Lead Time de Proveedores
Actualmente el tiempo de entrega (*lead time*) de los proveedores no está modelado en base de datos.
El motor asume reposición para el umbral de stock objetivo configurado manualmente (`target_stock_level`). No se infiere ni se inventa un lead time predictivo.

### 2. Generación Automática de Órdenes de Compra
Por diseño normativo de Fase 9, el sistema sugiere compras pero **no genera órdenes de compra comerciales reales** de forma autónoma. El estado se mantiene en `SUGGESTED` hasta la revisión humana.

### 3. Exclusión Estricta de Funcionalidades de Fase 10
Quedan deliberadamente excluidas de esta fase:
- PWA offline y Service Workers.
- Cola de salida IndexedDB outbox.
- Impresión térmica ESC/POS y bridge de hardware.
