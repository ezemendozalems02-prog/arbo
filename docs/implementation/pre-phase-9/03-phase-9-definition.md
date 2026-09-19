# ARBO OS — PRE-PHASE 9 CHECKPOINT
## 03. DEFINICIÓN OFICIAL DE FASE 9

### 1. Nombre Oficial
**FASE 9: CAPA DE INTELIGENCIA OPERACIONAL, ANALÍTICA AVANZADA & GESTIÓN DE COMPRAS SUGERIDAS**
*(Operational Intelligence & Advanced Analytics Layer)*

### 2. Objetivo
Dotar a ARBO OS de un motor determinístico y analítico capaz de asistir al propietario y a los encargados de sucursal en la toma de decisiones críticas sobre abastecimiento, desvíos de rentabilidad y desempeño de la carta, eliminando la intuición y los reportes desconectados.

### 3. Problema que Resuelve
1. **Desabastecimiento y Sobre-stock**: Los encargados piden "a ojo" o de memoria, generando quiebres de insumos críticos o inmovilización innecesaria de capital de trabajo.
2. **Desvíos Ocultos de Food Cost %**: Cuando el precio de una materia prima sube en compras, el plato sigue vendiéndose al mismo precio base, erosionando silenciosamente el margen bruto del negocio sin alertar al operador.
3. **Falta de Claridad sobre la Carta**: Ausencia de clasificación objetiva de los platos según la matriz de popularidad y margen (Kasavana-Smith).
4. **Pantallas de Reportes no funcionales**: Actualmente `/admin/reportes/*` figura como `available: false` en `nav.config.js`.

### 4. Alcance Autorizado
1. **Motor Determinístico de Compras Sugeridas (`purchaseSuggestionService.js`)**:
   - Evaluación por insumo: $\text{Déficit} = \text{Stock Mínimo} - (\text{Stock Actual} + \text{En Tránsito})$.
   - Redondeo a bultos enteros comerciales según el factor de empaque de cada proveedor:
     $$\text{Bultos} = \left\lceil \frac{\text{Déficit}}{\text{Factor Empaque}} \right\rceil$$
   - Generación de sugerencias agrupadas por proveedor habitual.
2. **Alertas Dinámicas de Margen y Food Cost Crítico**:
   - Detección automática cuando $\text{Food Cost \%} > 35\%$ sobre precio de venta.
   - Etiquetado `FOOD_COST_CRITICAL` con cálculo de precio de venta sugerido para restablecer el 30% objetivo.
3. **Matriz de Ingeniería de Menú (Kasavana-Smith)**:
   - Clasificación cuatrimestral/mensual:
     - **Estrellas** (Alto Margen, Alto Volumen)
     - **Caballos de Batalla** (Bajo Margen, Alto Volumen)
     - **Rompecabezas** (Alto Margen, Bajo Volumen)
     - **Perros** (Bajo Margen, Bajo Volumen)
   - Recomendaciones estratégicas asociadas.
4. **Vistas y Reportes Analíticos Reales**:
   - `/admin/reportes/ventas` (Agregación por franjas horarias, medios de pago, sucursal).
   - `/admin/reportes/productos` (Ranking de CMV, ventas por categoría).
   - `/admin/reportes/clientes` (Frecuencia de consumo, ticket promedio por segmento).
5. **Métricas de Rendimiento Operativo**:
   - Desperdicio/merma operativa por insumo y sucursal.
   - Rotación y tiempo medio de ocupación de mesas.

### 5. Dependencias
- Fases 1 a 8 completas (Catálogo, Recetas con rinde/merma, Ledger de inventario con PPP, Ventas cobradas, Depósitos y Transferencias).

### 6. Non-Scope
- NO integrar modelos de lenguaje externos (OpenAI/Gemini/Anthropic) en esta fase ni enviar PII fuera de la base de datos.
- NO implementar modo offline PWA ni drivers de comanderas térmicas (reservado para Fase 10).
- NO desarrollar módulos contables corporativos ni liquidación de sueldos.
