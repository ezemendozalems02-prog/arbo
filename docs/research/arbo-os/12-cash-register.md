# 12 — Caja y Arqueos

**Ruta:** `/admin/caja`  
**Archivos:** `src/admin/pages/pos/Caja.jsx`, `src/services/cashCalculations.js`, `src/admin/components/pos/CloseCashModal.jsx`, `CashMovementModal.jsx`, `src/context/POSContext.jsx:66-95`  
**Estado general:** `PARTIAL` — circuito aritmético de apertura, ingresos, egresos y cálculo de diferencia de efectivo funcional en sesión única; destruye el historial al abrir un nuevo turno (BUG-018) y carece de arqueo ciego o trazabilidad de turnos pasados.

---

## 12.1 Modelo de Datos y Ciclo de Vida

El estado de la caja se almacena en `POSContext.state.cash` (persistido en `arbo_pos_v1`):

```js
cash: {
  status: 'cerrada' | 'abierta',
  openedAt: Date | null,
  closedAt: Date | null,
  initialAmount: number,
  movements: Array<{ id, type: 'venta' | 'ingreso' | 'egreso', amount, method?, concept, createdAt }>,
  lastClosing: { expectedCash, declaredCash, diff, closedAt } | null,
}
```

### Operaciones Verificadas en Runtime

| Operación | Función / Componente | Estado | Evidencia / Detalle |
|---|---|---|---|
| Vista de caja cerrada | `OpenCashCard` (`Caja.jsx:15-44`) | `CONFIRMED_WORKING` | Muestra estado "La caja está cerrada", input de monto inicial y datos del último cierre si existe. Evidencia: `evidence/08-caja-cerrada.png`. |
| Apertura de caja | `openCashRegister` (`POSContext.jsx:67-72`) | `CONFIRMED_WORKING` | Verificado con `$50.000` inicial. Despliega las 5 tarjetas de KPI y los paneles de desglose. |
| Registro de ingreso manual | `CashMovementModal` (`type="ingreso"`) | `CONFIRMED_WORKING` | Verificado: ingreso de `$10.000` con concepto "Cambio chico". |
| Registro de egreso manual | `CashMovementModal` (`type="egreso"`) | `CONFIRMED_WORKING` | Verificado: egreso de `$3.500` con concepto "Hielo de emergencia". |
| Venta en efectivo | `confirmSale` (`POSContext.jsx:326-329`) | `CONFIRMED_WORKING` | Si la caja está abierta, inyecta automáticamente un movimiento `{ type: 'venta', method: 'efectivo', amount }`. |
| Venta con otros medios | `confirmSale` | `CONFIRMED_WORKING` | Se suma a `cashSummary.byMethod` (tarjeta, MP, transf.) sin inflar el efectivo físico esperado. |
| Modal de arqueo / cierre | `CloseCashModal.jsx` | `CONFIRMED_WORKING` | Verificado: cálculo en tiempo real de diferencia contra efectivo esperado. Evidencia: `evidence/09-caja-cierre-modal.png`. |
| Cierre de caja | `closeCashRegister` (`POSContext.jsx:81-95`) | `CONFIRMED_WORKING` | Pasa estado a `'cerrada'`, guarda `lastClosing` con `diff` y fecha. |
| Historial de turnos pasados | — | `NOT_IMPLEMENTED` | Ver BUG-018. |
| Retiro ciego de caja | — | `NOT_IMPLEMENTED` | Ver BUG-019. |
| Arqueo parcial / X de caja | — | `NOT_IMPLEMENTED` | No existe reporte X intermedio; sólo cierre Z final. |

---

## 12.2 Verificación de la Lógica Matemática (`cashCalculations.js`)

Se auditó el servicio de cálculo de caja (`src/services/cashCalculations.js:10-34`):

```js
export function calcCashSummary(cash) {
  const ventas = sumByType(cash.movements, 'venta')
  const ingresos = sumByType(cash.movements, 'ingreso')
  const egresos = sumByType(cash.movements, 'egreso')

  const ventasEfectivo = cash.movements
    .filter(m => m.type === 'venta' && m.method === 'efectivo')
    .reduce((sum, m) => sum + m.amount, 0)
  const expectedCash = cash.initialAmount + ventasEfectivo + ingresos - egresos

  const byMethod = Object.fromEntries(PAYMENT_METHODS.map(method => [
    method,
    cash.movements.filter(m => m.type === 'venta' && m.method === method).reduce((sum, m) => sum + m.amount, 0),
  ]))

  return { ventas, ingresos, egresos, expectedCash, byMethod }
}
```

### Prueba de Carga Ejecutada en Vivo
1. **Inicial:** `$50.000`
2. **Ingreso:** `+$10.000` ("Cambio chico")
3. **Egreso:** `-$3.500` ("Hielo de emergencia")
4. **Cálculo de Efectivo Esperado:**
   $$\text{Esperado} = 50.000 + 0 + 10.000 - 3.500 = \$56.500$$
5. El modal de cierre calculó exactamente `$56.500`.
6. Al ingresar `$56.000` como efectivo real contado, el sistema calculó:
   $$\text{Diferencia} = 56.000 - 56.500 = -\$500$$
   mostrando en rojo `Diferencia -$500`. El cálculo aritmético es **exacto y confiable**.

---

## 12.3 Defectos y Vulnerabilidades Forenses

### BUG-008 · P2 · Ventas con caja cerrada quedan fuera del arqueo para siempre
Ya documentado en `25-bugs.md`. Si se cobra una venta con la caja cerrada, el sistema permite la venta pero no guarda el movimiento de caja. Al abrir la caja más tarde, esa venta física no tiene forma de ser reconciliada ni aparece en el arqueo.

### BUG-018 · P1 · Caja — Destrucción total del historial de movimientos y turnos anteriores
- **Archivos:** `src/context/POSContext.jsx:70`, `Caja.jsx:28-41`
- **Mecánica:** Al abrir un nuevo turno:
  ```js
  cash: { ...s.cash, status: 'abierta', openedAt: new Date(), closedAt: null, initialAmount, movements: [] }
  ```
  La instrucción `movements: []` **destruye de forma permanente e irrecuperable todos los movimientos del turno anterior**.
- Además, `lastClosing` es un único objeto plano (no una lista cronológica). Si la caja se abre y cierra dos veces, el cierre anterior se sobrescribe.
- **Impacto:** No existe auditoría de caja histórica. Un dueño o gerente no puede consultar cuánto dinero se movió hace dos días, quién abrió la caja, ni qué diferencias de arqueo se acumularon en el mes. Es inviable para control fiscal o de prevención de fraude.

### BUG-019 · P2 · Caja — Arqueo no ciego y cierre con descuadre sin justificación
- **Archivos:** `src/admin/components/pos/CloseCashModal.jsx:20-23`
- **Mecánica:** El modal de cierre muestra en pantalla completa y en negrita:
  ```jsx
  <span>Efectivo esperado</span>
  <span style={{ fontWeight: 700, color: COLORS.greenDark }}>{formatMoney(expectedCash)}</span>
  ```
  **antes** de que el cajero cuente e ingrese el dinero real.
- **Impacto:** En gastronomía y retail, mostrar el saldo teórico antes del recuento elimina el control por arqueo ciego: el cajero sabe de antemano cuánto debe declarar para que la diferencia sea cero. Adicionalmente, el sistema permite cerrar la caja con cualquier descuadre (ej. `-$50.000` o `+$20.000`) sin exigir un motivo, explicación o autorización de supervisor.
