# 09 — ARBO INTELLIGENCE LAYER

---

## 1. PRINCIPIO DE TRANSPARENCIA TECNOLÓGICA

> **"En ARBO OS, una regla determinística nunca se llamará 'Inteligencia Artificial'. La precisión financiera de un restaurante depende de matemáticas exactas, no de modelos probabilísticos que alucinan inventarios o redondean centavos de caja. La inteligencia se construye por capas: primero reglas estrictas, luego analítica descriptiva, y solo al final modelos predictivos y LLMs donde aporten valor real."**

---

## 2. TAXONOMÍA DE LA INTELIGENCIA EN ARBO OS

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ARBO INTELLIGENCE STACK                         │
├───────────────────┬────────────────────┬───────────────────────────────┤
│ 1. RULE-BASED     │ 2. ANALYTICS       │ 3. MACHINE LEARNING / AI      │
│    Determinístico │    Descriptivo     │    Probabilístico             │
│    Lógica pura    │    Tendencias      │    Patrones & Lenguaje        │
└───────────────────┴────────────────────┴───────────────────────────────┘
```

---

## 3. CAPA 1: RULE-BASED (LÓGICA DETERMINÍSTICA)

Esta capa es el **fundamento operativo** de ARBO OS. No requiere aprendizaje automático; requiere algoritmos exactos y confiables al 100%.

### 3.1. Sugerencias Automáticas de Compra (Reorden)
- **Mecanismo:** `src/services/purchaseSuggestionService.js` evalúa:
  $$\text{Déficit} = \text{Stock Mínimo} - (\text{Stock Actual} + \text{En Tránsito})$$
  Si $\text{Déficit} > 0$, calcula la cantidad a pedir ajustada al factor de bulto del proveedor:
  $$\text{Bultos a pedir} = \lceil \text{Déficit} / \text{Factor de Empaque} \rceil$$
- **Naturaleza:** 100% Determinística (`[FACT]`).

### 3.2. Alertas de Food Cost y Degradación de Margen
- **Mecanismo:** `src/services/recipeCostService.js` calcula el costo unitario de insumos mediante el Precio Promedio Ponderado (PPP). Si el Food Cost supera el umbral configurado por el restaurante (ej. > 35%), dispara una alerta visual inmediata al administrador (`[FACT]`).
- **Naturaleza:** 100% Determinística.

### 3.3. Segmentación de Clientes por Reglas Booleanas
- **Mecanismo:** `src/services/segmentService.js` evalúa árboles de decisión determinísticos con operadores `AND` y `OR` (ej. `dias_sin_compra > 30 AND total_gastado > 10000`) (`[FACT]`).
- **Naturaleza:** 100% Determinística.

### 3.4. Detección de Faltantes y Desvíos de Caja
- **Mecanismo:** `src/services/cashCalculations.js` calcula `Diferencia = Saldo Real Declarado - Saldo Teórico`. Si excede la tolerancia permitida, clasifica el turno como irregular (`[FACT]`).
- **Naturaleza:** 100% Determinística.

---

## 4. CAPA 2: ANALYTICS (ANALÍTICA DESCRIPTIVA Y TENDENCIAS)

Esta capa procesa los datos históricos agregados para responder: *¿Qué pasó en el negocio y por qué?*

### 4.1. Matriz de Ingeniería de Menú (Boston Consulting Group / Kasavana-Smith)
- **Mecanismo:** Cruza la popularidad de ventas (volumen) contra la rentabilidad unitaria (margen de contribución) de cada plato:
  - **Estrellas:** Alta venta, alto margen (proteger y promocionar).
  - **Caballos de Batalla:** Alta venta, bajo margen (optimizar receta o subir precio levemente).
  - **Puzzles / Rompecabezas:** Baja venta, alto margen (mejorar posicionamiento en carta).
  - **Perros:** Baja venta, bajo margen (candidatos a eliminación del menú).
- **Valor para el Dueño:** Claridad inmediata para rediseñar la carta trimestralmente.

### 4.2. Curva Horaria de Demanda y Velocidad de Mesa
- **Mecanismo:** Análisis de tiempo promedio de ocupación de mesas por franja horaria y rotación de cubiertos, permitiendo dimensionar el personal de salón y cocina para los turnos pico.

### 4.3. Reporte de Desperdicio y Merma Operativa
- **Mecanismo:** Consolidación de motivos de descarte y ajustes negativos de inventario para cuantificar en dinero exacto las pérdidas por vencimiento, quema o error de preparación.

---

## 5. CAPA 3: MACHINE LEARNING & AI (MODELOS PROBABILÍSTICOS Y NLP)

Esta capa solo se activa en fases avanzadas (Fase 4 del Roadmap) y se reserva para problemas donde las reglas determinísticas son insuficientes.

### 5.1. Predicción de Demanda de Insumos (Time-Series Forecasting)
- **Problema:** Un restaurante vende más hamburguesas los viernes de lluvia o los fines de semana de calor que un martes nublado. Las reglas fijas de stock mínimo fallan ante la estacionalidad y el clima.
- **Enfoque ML:** Modelos autoregresivos livianos (ej. Prophet / LightGBM) que incorporan factores de estacionalidad semanal, feriados y pronóstico meteorológico para anticipar la compra de materias primas perecederas.

### 5.2. Asistente Conversacional para Dueños (NLP / Copilot)
- **Problema:** El dueño quiere respuestas operativas rápidas mientras está fuera del local sin tener que navegar 10 tablas de reportes.
- **Enfoque LLM:** Interfaz por WhatsApp conectada vía Function Calling estructurado a la base de datos de solo lectura de ARBO OS (ej. *"¿Cuánto vendió la sucursal Centro hoy hasta las 15hs?"* -> ejecuta consulta SQL parametrizada y responde en lenguaje natural).

---

## 6. SÍNTESIS DE LA CAPA DE INTELIGENCIA

| Capacidad | Clasificación Real | Estado en ARBO | Valor Operativo |
| :--- | :--- | :--- | :--- |
| **Sugerencia de Compras** | Rule-Based | Implementado en frontend | Inmediato (P0) |
| **Alertas de Margen/Food Cost** | Rule-Based | Implementado en frontend | Inmediato (P0) |
| **Segmentación de Clientes** | Rule-Based | Implementado en frontend | Inmediato (P1) |
| **Ingeniería de Menú** | Analytics | Diseñable sobre V1 | Alto (V1) |
| **Rotación de Mesas** | Analytics | Requiere timestamps de mesas | Medio (V1) |
| **Pronóstico de Demanda** | Machine Learning | Futuro (Fase 4) | Alto (Fase 4) |
| **Copilot WhatsApp Dueño** | LLM / Generative | Futuro (Fase 4) | Diferencial (Fase 4) |
