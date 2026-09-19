# ARBO OS — FASE 10: COLA DE TRABAJOS DE IMPRESIÓN (PRINT JOBS)
## Ciclo de Vida y Prevención de Doble Impresión

### 1. Modelo de Datos del Trabajo de Impresión
- `id`: Identificador único (`pjob_...`).
- `type`: Tipo de documento (`RECEIPT`, `KITCHEN_TICKET`, `CASH_REPORT`).
- `target`: Destino del hardware (`CASHIER`, `KITCHEN_STATION`, `EXPEDITION`).
- `station_id`: Identificador de estación de cocina asignada.
- `status`: `QUEUED` $\rightarrow$ `PRINTING` $\rightarrow$ `PRINTED` (o `FAILED`).
- `attempts`: Conteo de intentos de transmisión.

### 2. Prevención Estricta de Doble Impresión
La función `enqueuePrintJob()` rechaza trabajos con IDs ya presentes en la cola activa, y `executePrintJob()` retorna inmediatamente sin reenviar datos si el estado ya es `PRINTED`. Esto previene que un cajero o camarero que presione dos veces el botón de cobro imprima múltiples comandas físicas para una misma orden.
