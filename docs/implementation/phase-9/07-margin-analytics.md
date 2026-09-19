# ARBO OS — FASE 9: ANALÍTICA DE MARGEN BRUTO
## Métricas de Contribución por Producto

### 1. Margen Bruto Unitario
El margen de contribución unitario mide el valor monetario neto que cada porción vendida aporta para cubrir los costos fijos y generar beneficio neto:
- `margen_unitario = precio_venta_efectivo - costo_receta_por_porcion`

### 2. Margen de Contribución Total del Período
- `margen_total = SUM(margen_unitario * unidades_vendidas)`

### 3. Impacto de Sobreescrituras Multi-Sucursal (Fase 8)
El cálculo de margen respeta rigurosamente las sobreescrituras de precio configuradas para cada sucursal a través de `branch_product_settings`:
- Si la sucursal tiene `price_override`, se calcula con dicho precio local.
- Si no, se utiliza el `base_price` del catálogo maestro.
- Los reportes consolidados agregan los márgenes respetando el precio efectivo de cada venta real registrada.
