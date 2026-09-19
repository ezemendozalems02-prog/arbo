# ARBO OS — FASE 10: KDS EN MODO OFFLINE
## Resiliencia en Cocina

### 1. Estado PENDING_SYNC
Cuando se toma una comanda en el POS sin conexión, el ticket se emite localmente hacia la pantalla de cocina o impresora térmica con la marca visual `PENDING_SYNC`.

### 2. Preparación Inmediata
La cocina no detiene la marcha: los cocineros preparan los platos con la comanda física o pantalla local. Al restablecerse la red, el sincronizador actualiza el estado del ticket en el servidor sin duplicar la comanda en pantalla ni emitir impresiones duplicadas.
