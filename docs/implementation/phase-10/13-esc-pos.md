# ARBO OS — FASE 10: PROTOCOLO ESC/POS & COMANDOS TÉRMICOS
## Estándar de Impresión Industrial

### 1. Ubicación y Especificación
Implementado en `src/services/domain/printManager.js` mediante la función `buildEscPosCommands()`.

### 2. Comandos Binarios Implementados
- `ESC @` (`\x1B\x40`): Inicialización y reseteo del hardware de impresión.
- `ESC a` (`\x1B\x61\x00` a `\x02`): Alineación (izquierda, centro, derecha).
- `ESC E` (`\x1B\x45\x01` / `\x00`): Activación y desactivación de negrita.
- `GS !` (`\x1D\x21\x11`): Doble alto y doble ancho para títulos y totales legibles en cocina.
- `GS V` (`\x1D\x56\x41\x03`): Comando de corte automático de papel con avance previo de 3 líneas.
- Ancho soportado: 58mm y 80mm con divisores visuales estandarizados (`------------------------------------------------`).
