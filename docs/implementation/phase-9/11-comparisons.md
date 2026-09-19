# ARBO OS — FASE 9: COMPARATIVAS HISTÓRICAS
## Variación Absoluta y Porcentual

### 1. Cálculo de Métricas Comparativas
Para cada KPI clave (Facturación, Conteo de Tickets, Ticket Promedio):
- `valor_actual`: Acumulado del período evaluado.
- `valor_anterior`: Acumulado del período previo inmediatamente anterior.
- `variacion_absoluta = valor_actual - valor_anterior`.
- `variacion_porcentual = (variacion_absoluta / valor_anterior) * 100` (cuando `valor_anterior > 0`).

### 2. Presentación Neutral y Explicable
El sistema no etiqueta de manera subjetiva los valores (ej. "bueno" o "malo" arbitrario). Presenta con precisión el signo monetario, el porcentaje de cambio relativo y el contexto temporal de la comparación.
