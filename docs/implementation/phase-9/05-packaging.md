# ARBO OS — FASE 9: FACTOR DE EMPAQUE (PACKAGING FACTOR)
## Reglas de Redondeo y Modelo de Datos

### 1. Modelo de Datos
En la migración `20260919000009_intelligence_analytics_reports.sql`, la tabla `ingredients` incorpora:
- `packaging_unit VARCHAR(50)`: Unidad comercial de compra (ej. 'bolsa de 5kg', 'caja x 12u', 'bidón de 20l').
- `package_factor NUMERIC(12, 4) DEFAULT 1.0000`: Relación cuantitativa entre la unidad comercial y la unidad base del insumo.
- `primary_supplier_id UUID REFERENCES suppliers(id)`: Proveedor primario asociado.

### 2. Regla de Redondeo Estricta: Hacia Arriba (Ceil)
Los proveedores comerciales no fraccionan bultos de venta.
Por tanto, la cantidad sugerida debe cubrir plenamente la necesidad operacional sin incurrir en desabastecimiento:
- `bultos = Math.ceil(deficit_neto / package_factor)`
- `cantidad_sugerida = bultos * package_factor`

**Ejemplo Normativo:**
- Necesidad operacional calculada: 17 kg.
- Factor de empaque del proveedor: bolsas de 5 kg.
- Redondeo: `Math.ceil(17 / 5) = 4` bolsas.
- Cantidad sugerida: `4 * 5 = 20 kg`.
- **Nunca se redondea hacia abajo** (lo cual sugeriría 15 kg y dejaría a la cocina sin 2 kg requeridos).
