# ARBO OS — FASE 9: PERÍODOS TEMPORALES EXPLÍCITOS
## Resolución Determinística de Fechas

### 1. Períodos Soportados
La función `resolveDateRange()` normaliza de forma determinista y sin ambigüedades los siguientes períodos:
- `hoy`: Desde las 00:00:00 hasta las 23:59:59 del día en curso.
- `ayer`: Período idéntico de 24 horas del día previo.
- `7d`: Ventana móvil de los últimos 7 días calendario completos.
- `30d`: Ventana móvil de los últimos 30 días calendario completos.
- `mes`: Desde el primer día del mes actual a las 00:00:00 hasta el momento actual.
- `custom`: Rango explícito definido por `customFrom` y `customTo`.

### 2. Ventana de Comparación Previa
Para calcular deltas y tendencias porcentuales, el motor define una ventana inmediatamente anterior de duración exactamente igual:
- `duracion = currentTo - currentFrom`
- `prevTo = currentFrom - 1 ms`
- `prevFrom = prevTo - duracion`
