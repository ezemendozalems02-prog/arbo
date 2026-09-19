# ARBO OS — PRE-PHASE 9 CHECKPOINT
## 23. ESTRATEGIA DE MIGRACIÓN DE DATOS

*(Nota: En este checkpoint NO se crea ningún archivo SQL).*

### 1. Migración Prevista
- **Identificador Tentativo**: `20260919000009_intelligence_analytics_reports.sql`
- **Contenido Tentativo**:
  - Tabla `purchase_suggestions` con estado, cantidades y factor de empaque.
  - Vistas o tablas analíticas de clasificación de menú (`menu_engineering_snapshots`).
  - Índices optimizados sobre fechas y categorías para acelerar los reportes.
  - Políticas RLS por `organization_id`.
- **Estrategia de Rollback**:
  - Script idempotente con bloques `DROP TABLE IF EXISTS ... CASCADE`.
  - Sin alteración destructiva de tablas existentes.
