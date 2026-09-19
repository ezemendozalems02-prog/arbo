# ARBO OS — FASE 10: MANEJO DE FALLOS DE IMPRESORA
## Recuperación Operativa y Reintentos

### 1. Escenarios de Falla Cubiertos
- Impresora apagada o desconectada de la red LAN/USB.
- Impresora sin papel térmico o tapa abierta.
- Buffer de impresora saturado o error de comunicación del puente local.

### 2. Protocolo de Recuperación
- **Sin pérdida de datos:** La comanda o venta jamás se aborta ni se cancela en la base de datos debido a un fallo en la impresora.
- El trabajo pasa a estado `FAILED` registrando el mensaje de error textual (`PRINTER_OFFLINE`).
- La interfaz permite al operador reintentar la impresión (`executePrintJob()`) inmediatamente después de cargar papel o encender el dispositivo, sin duplicar la comanda ni generar movimientos espurios de stock o caja.
