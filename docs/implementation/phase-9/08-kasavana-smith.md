# ARBO OS — FASE 9: MATRIZ KASAVANA-SMITH (MENU ENGINEERING)
## Clasificación Analítica de Platos

### 1. Metodología
La Matriz Kasavana-Smith clasifica todos los platos del menú en función de dos dimensiones ortogonales:
1. **Popularidad:** Unidades vendidas en el período.
2. **Rentabilidad:** Margen de contribución unitario (`precio - costo`).

### 2. Benchmarks de Normalización
Para evitar comparaciones arbitrarias entre categorías de distinta rotación, los umbrales se derivan de la media estadística del período:
- **Benchmark de Popularidad (`averageUnitsSold`):**
  `total_unidades_vendidas / cantidad_de_platos_activos`
- **Benchmark de Rentabilidad (`benchmarkMargin`):**
  Margen medio ponderado: `margen_total_acumulado / total_unidades_vendidas`

### 3. Los Cuatro Cuadrantes
- **STAR (Estrella):**
  `unidades_vendidas >= averageUnitsSold` Y `margen_unitario >= benchmarkMargin`.
  Alta popularidad y alta rentabilidad. Mantener calidad rigurosa y visibilidad destacada.
- **PLOWHORSE (Caballo de batalla):**
  `unidades_vendidas >= averageUnitsSold` Y `margen_unitario < benchmarkMargin`.
  Alta popularidad pero bajo margen. Evaluar aumentos marginales de precio o reformulación de receta para reducir Food Cost.
- **PUZZLE (Rompecabezas):**
  `unidades_vendidas < averageUnitsSold` Y `margen_unitario >= benchmarkMargin`.
  Baja popularidad pero alto margen. Promover mediante sugerencias de meseros o ubicación privilegiada en carta.
- **DOG (Perro):**
  `unidades_vendidas < averageUnitsSold` Y `margen_unitario < benchmarkMargin`.
  Baja popularidad y baja rentabilidad. Candidato para reingeniería o remoción de la carta.

### 4. Regla Normativa
La clasificación es estrictamente analítica. **NO altera el catálogo ni los precios automáticamente**.
