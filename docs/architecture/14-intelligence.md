# 14 — CAPA DE INTELIGENCIA OPERACIONAL: REGLAS, ANALÍTICA Y MODELOS

---

## 1. SEPARACIÓN TÉCNICA DE LA INTELIGENCIA

En ARBO OS, la inteligencia se divide rigurosamente en tres capas con tecnologías y garantías diferenciadas:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      CAPA DE INTELIGENCIA DE ARBO                      │
├───────────────────────────────┬────────────────────────────────────────┤
│ 1. RULE ENGINE DETERMINÍSTICO │ Exactitud 100%. Algoritmos matemáticos │
│    (In-Database & Services)   │ en SQL y TypeScript. Cero alucinación. │
├───────────────────────────────┼────────────────────────────────────────┤
│ 2. ANALYTICS DESCRIPTIVO      │ Vistas materializadas, agregaciones y  │
│    (PostgreSQL OLAP Views)    │ tendencias históricas del restaurante. │
├───────────────────────────────┼────────────────────────────────────────┤
│ 3. MACHINE LEARNING & AI      │ Modelos predictivos y LLMs para ayuda  │
│    (External / Asíncrono)     │ conversacional del dueño fuera del core│
└───────────────────────────────┴────────────────────────────────────────┘
```

---

## 2. CAPA 1: RULE ENGINE DETERMINÍSTICO

### 2.1. Cálculo de Margen y Alerta de Food Cost
- Se ejecuta cada vez que cambia el costo unitario de un ingrediente o el precio de un plato:
  $$\text{Food Cost \%} = \frac{\text{Costo Total Receta con Merma}}{\text{Precio Venta Base Plato}} \times 100$$
- Si $\text{Food Cost \%} > 35\%$, se marca el plato en el catálogo con un indicador rojo (`FOOD_COST_CRITICAL`) y se sugiere un precio de venta recomendado para restablecer el 30% de costo objetivo.

### 2.2. Algoritmo de Compra Sugerida con Factor de Empaque
- `purchaseSuggestionService.js` evalúa:
  $$\text{Déficit} = \text{Stock Mínimo} - (\text{Stock Actual} + \text{En Tránsito})$$
  $$\text{Bultos a Pedir} = \left\lceil \frac{\text{Déficit}}{\text{Factor Empaque Proveedor}} \right\rceil$$

---

## 3. CAPA 2: ANALYTICS Y MATRIZ DE INGENIERÍA DE MENÚ

El sistema consolida semanalmente los datos de ventas para clasificar la carta según la **Matriz Kasavana-Smith**:

```
                  ALTA POPULARIDAD (Volumen)
                             ▲
              CABALLO DE     │      ESTRELLA
               BATALLA       │   (High Margin,
            (Low Margin,     │    High Volume)
             High Volume)    │
     BAJO ───────────────────┼─────────────────── ALTO
    MARGEN                   │                  MARGEN
                PERRO        │    ROMPECABEZAS
            (Low Margin,     │   (High Margin,
             Low Volume)     │    Low Volume)
                             ▼
                  BAJA POPULARIDAD (Volumen)
```

- **Acción sugerida para Caballos de Batalla:** Aumentar el precio un 5% o renegociar el insumo base con el proveedor.
- **Acción sugerida para Rompecabezas:** Ubicarlo en la parte superior del menú digital y destacarlo con fotografía profesional.

---

## 4. CAPA 3: PRIVACIDAD Y LÍMITES DE IA EXTERNA (LLM BOUNDARY)

> **"Ningún dato de identificación personal (PII) de comensales —como nombres, teléfonos, direcciones o tarjetas— saldrá JAMÁS del sistema hacia proveedores de LLM como OpenAI, Anthropic o Google Gemini."**

### 4.1. Reglas de Aislamiento para el Copilot del Dueño
1. **Acceso Estrictamente Read-Only:** El asistente por WhatsApp interactúa mediante llamadas a funciones estructuradas (*Function Calling*) que ejecutan consultas `SELECT` parametrizadas en vistas analíticas de solo lectura.
2. **Payloads Anonimizados:** El modelo de lenguaje solo recibe métricas numéricas agregadas (ej. *"Ventas totales: $450.000, 120 comandas, producto más vendido: Hamburguesa Doble"*).
3. **Validación de Tenant Forzada:** La función SQL que alimenta al modelo inyecta irrevocablemente `WHERE organization_id = session_org_id`, imposibilitando que el asistente divulgue datos de otros restaurantes.
