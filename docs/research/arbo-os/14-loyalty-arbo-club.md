# 14 — Fidelización y ARBO Club

**Rutas:** `/admin/loyalty`, `/admin/loyalty/miembros`, `/admin/loyalty/niveles`, `/admin/loyalty/beneficios`, `/admin/loyalty/canjes`, `/admin/loyalty/movimientos`, `/arbo-club` (público)  
**Archivos:** `src/admin/pages/loyalty/LoyaltyDashboard.jsx`, `Members.jsx`, `Levels.jsx`, `Rewards.jsx`, `Redemptions.jsx`, `PointsTransactions.jsx`, `src/services/loyaltyPointsService.js`, `redemptionService.js`, `rewardService.js`, `loyaltyService.js`, `src/pages/ArboClub.jsx`  
**Estado general:** `PARTIAL` — libro mayor de transacciones de puntos y reglas de beneficios bien diseñados; desconectado del POS (no se pueden aplicar canjes en mostrador) y portal público puramente estático.

---

## 14.1 Modelo y Reglas del Programa

- **Ratio de acumulación:** `$100 gastados = 1 punto` (`pointsForAmount` en `loyaltyService.js`).
- **Niveles (Tiers):**
  1. *Semilla* (`0` a `499` pts) — 0% beneficio base.
  2. *Brote* (`500` a `1.499` pts) — 5% descuento en café, café de bienvenida.
  3. *Árbol* (`1.500` a `3.499` pts) — 10% descuento, cata mensual prioritaria.
  4. *Copa* (`3.500+` pts) — 15% descuento, mesa preferencial, postre de cumpleaños.
- **Transacciones de puntos (`POINT_TRANSACTIONS`):** Tipos admitidos: `EARN` (compra), `REDEEM` (canje), `ADJUST` (ajuste manual), `REFUND` (reversión), `EXPIRE` (vencimiento).
- **Invariante contable:** Ninguna operación muta el saldo de un cliente sin emitir un registro con `balanceBefore` y `balanceAfter` (`loyaltyPointsService.js:12-18`).

---

## 14.2 Operaciones Verificadas

| Operación | Componente / Servicio | Estado | Detalle |
|---|---|---|---|
| Dashboard de Fidelización | `LoyaltyDashboard.jsx` | `CONFIRMED_WORKING` | Métricas de puntos en circulación, miembros activos y distribución por nivel. |
| Gestión de miembros | `Members.jsx` | `CONFIRMED_WORKING` | Lista socios, saldo de puntos, nivel alcanzado y botón para ajuste manual. |
| Ajuste manual de puntos | `adjustPoints` (`CRMContext.jsx:128`) | `CONFIRMED_WORKING` | Suma o resta puntos con motivo y genera transacción `ADJUST`. |
| Catálogo de beneficios | `Rewards.jsx` | `CONFIRMED_WORKING` | Altas y bajas de premios (ej. *"Café de cortesía"*, *"20% en almuerzo"*). |
| Ejecutar canje | `redeemReward` (`CRMContext.jsx:139`) | `CONFIRMED_WORKING` | Valida saldo, descuenta puntos y genera código `ARBO-XXXXX` con status `pendiente`. |
| Marcar canje utilizado | `markRedemptionUsed` | `CONFIRMED_WORKING` | Cambia estado a `utilizado` con timestamp `usedAt`. |
| Cancelar canje | `cancelRedemption` | `BROKEN` | Ver BUG-010. Devuelve puntos incluso en canjes ya consumidos. |
| Consumo de canjes en el POS | — | `NOT_IMPLEMENTED` | Ver BUG-021. El POS no tiene forma de recibir el código de canje. |
| Consulta pública de puntos | `/arbo-club` | `UI_ONLY` | Ver BUG-022. Muestra un cliente demo fijo; no hay login ni consulta por DNI/teléfono. |
| Vencimiento automático de puntos | `buildExpirationCandidate` | `CODE_ONLY` | Función existente en código; sin cron ni job en runtime. |

---

## 14.3 Ciclo de Canje y Generación de Códigos

El servicio `redemptionService.js` junto a `rewardService.js:15-20` genera códigos alfanuméricos de 5 caracteres con prefijo de marca:

$$\text{Código: } \texttt{ARBO-[A-Z2-9]}^5 \quad (\text{ej. } \texttt{ARBO-K7X9B})$$

El flujo lógico es estricto en la deducción:
1. `validateRedemption`: Verifica si el beneficio está activo, dentro de fecha y si el cliente tiene saldo suficiente (`customer.points >= reward.pointsCost`).
2. `applyPointsTransaction`: Descuenta los puntos (`type: 'REDEEM'`) y actualiza el nivel del cliente en tiempo real si el nuevo saldo lo degrada.
3. Se genera el objeto `redemption` en estado `pendiente`.

---

## 14.4 Defectos y Riesgos Identificados

### BUG-010 · P2 · Cancelación de canjes ya utilizados devuelve los puntos al cliente
- **Archivo:** `src/context/CRMContext.jsx:171-181`
- **Mecánica:**
  ```js
  const redemption = s.redemptions.find(r => r.id === redemptionId)
  if (!redemption || redemption.status === 'cancelado') return s
  ```
  La función sólo bloquea si el estado ya es `cancelado`. Si un canje figura en estado `utilizado` (el cliente ya tomó el café o almorzó gratis), pulsar cancelar ejecuta `applyPointsTransaction` con `type: 'REFUND'` y le devuelve los puntos a la cuenta.
- **Impacto:** Vulnerabilidad de fraude interno o doble beneficio no autorizado.

### BUG-021 · P1 · ARBO Club — Los canjes no pueden consumirse ni aplicarse en el POS
- **Archivos:** `src/admin/components/pos/CheckoutModal.jsx`, `OrderPanel.jsx`, `src/context/POSContext.jsx`
- **Mecánica:** En todo el módulo del POS no existe ningún campo de entrada, lector ni botón para canjear un código de beneficio (`ARBO-XXXXX`). Si un cliente se presenta en caja con un cupón generado en ARBO Club, el cajero **no tiene manera de descontar el producto en la comanda ni de registrar el canje en la venta**.
- **Impacto:** El programa de fidelización queda roto en el punto de contacto más importante. El cajero se ve obligado a inventar un descuento manual porcentual o regalar el producto fuera de sistema.

### BUG-022 · P2 · Sitio público de ARBO Club es una maqueta estática sin autenticación
- **Archivo:** `src/pages/ArboClub.jsx:3, 27-43`
- **Mecánica:** La sección pública importa `DEMO_MEMBER` (`puntos: 2.840`) desde `benefits.js`. Un cliente real que visita `arbo.com/arbo-club` no puede iniciar sesión, no puede consultar su saldo por teléfono ni puede activar sus beneficios desde su celular.
- **Impacto:** Experiencia engañosa para el comensal: parece una app de club pero no ofrece funcionalidad transaccional para el usuario final.
