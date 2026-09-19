# ARBO OS — PRE-PHASE 9 CHECKPOINT
## 17. MODO OFFLINE Y DEGRADADO EN FASE 9

### 1. Comportamiento ante Pérdida de Conexión
- **Analíticas y Reportes**: Son funciones de consulta directiva que requieren conectividad para agregar datos consolidados. Si se interrumpe la conexión, muestran el último snapshot cacheado con aviso visual de *"Datos actualizados al último corte de conexión"*.
- **Generación de Pedidos de Compra**: Requiere conexión para verificar stock de transferencias en tránsito y emitir la orden formal. Si no hay conexión, se deshabilita la emisión final hasta restablecer la red.
- **Nota de Scope**: La arquitectura integral Offline-First (PWA con Service Worker, IndexedDB outbox queue y reconexión automática de ventas) corresponde a la **Fase 10**.
