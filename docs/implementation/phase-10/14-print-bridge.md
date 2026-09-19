# ARBO OS — FASE 10: ARQUITECTURA PRINT BRIDGE
## Comunicación entre Navegador y Hardware Local

### 1. El Reto de Seguridad del Navegador
Las aplicaciones web modernas corren en un sandbox seguro que restringe la apertura directa de sockets TCP arbitrarios o puertos USB físicos sin drivers.

### 2. Solución Arquitectónica
- **Topología:**
  `ARBO OS Web (Frontend SPA)`
  $\downarrow$ `HTTP / WebSocket (localhost:9100/print)`
  `Local Print Bridge (Agente de Impresión Local en PC/POS)`
  $\downarrow$ `Driver USB / Socket LAN / Serial COM`
  `Impresoras Térmicas ESC/POS (Epson, Hasar, Bematech, Sam4s)`
- **Validación:** El sistema envía cargas útiles JSON al endpoint local configurado, el cual decodifica y transfiere los bytes brutos ESC/POS a la impresora de destino.
