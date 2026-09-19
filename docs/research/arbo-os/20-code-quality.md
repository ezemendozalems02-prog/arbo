# 20 — Calidad de Código, Mantenibilidad y Patrones

**Archivos:** Todo `src/` (184 archivos, ~12.800 líneas)  
**Estado general:** `PARTIAL` — servicios puros de alta elegancia matemática; ausencia absoluta de TypeScript y tests automatizados.

---

## 20.1 Fortalezas Notables de la Base de Código

1. **Servicios Puros Desacoplados (`src/services/`):**
   22 módulos que contienen lógica de negocio pura sin dependencias de React:
   - `salesCalculations.js`: cálculos defensivos acotando descuentos entre 0 y subtotal (`Math.max(0, ...)`).
   - `cashCalculations.js`: discriminación de flujos de efectivo físico vs pagos digitales.
   - `purchaseService.js`: algoritmo de costo promedio ponderado y resolución dimensional de unidades.
   - `kitchenService.js`: partición determinística de comandas por estación de trabajo (`cocina`, `bar`, `frio`).
   - `segmentService.js`: motor de reglas lógicas desacoplado de la UI.
2. **Higiene de Linting:**
   `npm run lint` ejecuta ESLint y finaliza con **0 errores y 0 advertencias**.
3. **Manejo de Fechas en Serialización:**
   Los tres contextos implementan `reviveDates` para convertir strings ISO 8601 a instancias reales de `Date` al des-serializar desde `localStorage`.

---

## 20.2 Deuda Técnica y Fragilidades

### Ausencia de TypeScript
- El proyecto es JavaScript plano (`.jsx` / `.js`). No existe `tsconfig.json`.
- Riesgo directo de discrepancias de tipado: ej. `line.insumoId` en compras vs `item.id` en inventario vs `item.productId` en recetas. Sin verificación estática en tiempo de compilación.

### Ausencia de Tests Automatizados (`NOT_IMPLEMENTED`)
- No existe ningún runner de pruebas (`vitest`, `jest`).
- No existen archivos `*.test.*` ni `*.spec.*`.
- Toda la lógica crítica de dinero, vuelto, puntos y arqueos se basa en pruebas manuales.

### Ineficiencia en React Contexts (Re-render Cascada)
- Los tres contextos construyen sus objetos de retorno en el cuerpo del Provider sin `useMemo`:
  - `POSContext.jsx:359`
  - `InventoryContext.jsx:226`
  - `CRMContext.jsx:250`
- Cada actualización de estado (por ejemplo, escribir una nota a un cliente) genera una nueva referencia de objeto `value`, forzando el re-render de **todos los componentes consumidores** del árbol.
