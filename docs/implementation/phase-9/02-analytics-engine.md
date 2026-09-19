# ARBO OS — FASE 9: MOTOR ANALÍTICO BASE
## Arquitectura y Principios de Dominio

### 1. Ubicación y Responsabilidad
El motor analítico reside en `src/services/domain/analyticsEngine.js`. Separa estrictamente la lógica de dominio y los algoritmos matemáticos de los componentes de interfaz de usuario de React.

### 2. Características del Motor
- **Determinismo:** Para un mismo estado de inventario, recetas y ventas, el resultado analítico es idéntico e independiente del entorno de ejecución.
- **Reproducibilidad:** Los cálculos pueden reproducirse históricamente con snapshots de datos.
- **Aislamiento de Errores:** Errores o datos insuficientes en una receta o producto no interrumpen el procesamiento del resto del catálogo.
- **Sin Efectos Secundarios:** Los cálculos analíticos son funciones puras que no mutan el ledger principal ni crean fuentes paralelas de verdad.
