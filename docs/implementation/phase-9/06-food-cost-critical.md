# ARBO OS — FASE 9: DETECCIÓN DE FOOD COST CRÍTICO
## Umbrales Determinísticos y Explicabilidad

### 1. Definición del Food Cost %
Para cada producto que cuente con receta activa:
- `costo_receta = costo_insumos_base * (1 + merma_operativa / 100) / rendimiento_porciones`
- `food_cost_pct = (costo_receta / precio_efectivo) * 100`

### 2. Regla de Frontera Estricta
El umbral normativo de ARBO OS está fijado en:
- `food_cost_pct <= 30.00%`: **HEALTHY** (Rango óptimo para gastronomía de calidad).
- `30.00% < food_cost_pct <= 35.00%`: **WARNING** (Alerta preventiva, requiere seguimiento).
- `food_cost_pct > 35.00%`: **CRITICAL** (Alerta crítica: erosión inaceptable de margen).

**Frontera exacta:**
- 34.99% -> NO crítico (`WARNING`).
- 35.00% -> NO crítico (`WARNING`).
- 35.01% -> **CRÍTICO** (`FOOD_COST_CRITICAL`).

### 3. Explicabilidad Cuantificada
La alerta no se limita a un mensaje genérico. Expone:
1. Producto y precio de venta actual.
2. Costo real de receta desglosado.
3. Insumo con mayor impacto en el costo (nombre, aporte en pesos y porcentaje respecto al costo total de la receta).
4. Precio de venta sugerido para restaurar el Food Cost al objetivo óptimo del 30.00%: `precio_sugerido = costo_receta / 0.30`.
