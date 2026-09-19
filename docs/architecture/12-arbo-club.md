# 12 — ARBO CLUB: ARQUITECTURA DE FIDELIZACIÓN TRANSVERSAL

---

## 1. INTEGRACIÓN TRANSVERSAL DE ARBO CLUB EN EL SISTEMA

ARBO Club no es un subsistema aislado ni una tarjeta de puntos externa; es un **servicio transversal** que interactúa directamente con el punto de venta, la tienda pública y el motor de automatizaciones:

```
[Comensal Identificado en Salón / Mostrador / Web]
                       │
                       ▼
[Orden Cobrada] ──► [Cálculo de Puntos Según Tier Activo]
                       │
                       ▼
┌────────────────────────────────────────────────────────┐
│             LEDGER INMUTABLE: loyalty_transactions     │
│   (id, customer_id, order_id, points_delta: +150)      │
└──────────────────────┬─────────────────────────────────┘
                       │
                       ▼
[Evaluación de Promoción de Tier] ──► [Bronce -> Plata -> Oro -> Black]
                       │
                       ▼
[Actualización de Perfil CRM] ──► [Trigger: Disparo Notificación WhatsApp]
```

---

## 2. EL LIBRO MAYOR DE PUNTOS (IMMUTABLE LEDGER)

1. **Estructura Append-Only:** Toda mutación de puntos es una inserción inmutable. Se prohibe el uso de `UPDATE` sobre el saldo de puntos.
2. **Cálculo del Saldo Real:**
   ```sql
   SELECT COALESCE(SUM(points_delta), 0) AS current_balance
   FROM loyalty_transactions
   WHERE customer_id = $1 AND organization_id = $2;
   ```
3. **Compensaciones y Correcciones:** Si una venta se anula o se produce un ajuste administrativo, se inserta una nueva fila con motivo `REVERSAL_ORDER_REFUND` y `points_delta` negativo; nunca se borra la fila original.

---

## 3. RESOLUCIÓN DE BUG-021: CANJE ATÓMICO EN POS (REDEMPTIONS)

### 3.1. El Problema Histórico
En el prototipo previo, el servicio de fidelización existía en código (`src/services/loyaltyPointsService.js`), pero el modal de checkout del POS carecía de controles para redimir premios contra una orden (`[FACT: BUG-021]`).

### 3.2. El Flujo de Canje Transaccional
1. **Identificación:** En la pantalla de cobro, el cajero busca al cliente por teléfono o escanea su QR personal.
2. **Consulta de Recompensas Elegibles:** El backend retorna los premios disponibles según su saldo de puntos:
   - Ejemplo: *"Café de Especialidad Gratis"* (Costo: 300 puntos).
3. **Aplicación al Ticket:** El POS descuenta el valor del producto como ítem bonificado o descuento de línea (`discount_amount`).
4. **Liquidación Atómica:** La base de datos ejecuta en el mismo bloque ACID:
   - Cobro del saldo restante de la orden.
   - `INSERT INTO loyalty_transactions (customer_id, order_id, points_delta, reason)` con valor `-300` y razón `REWARD_REDEMPTION`.

---

## 4. SISTEMA DINÁMICO DE NIVELES (TIERS)

| Tier | Requisito de Gasto Anual (Rolling 12M) | Multiplicador de Puntos | Beneficios Exclusivos |
| :--- | :--- | :--- | :--- |
| **BRONZE** | $0 a $50.000 ARS | 1.0x (1 pt cada $100) | Acceso al catálogo estándar de premios |
| **SILVER** | $50.001 a $150.000 ARS | 1.25x (1.25 pts cada $100) | 1 café de bienvenida al mes |
| **GOLD** | $150.001 a $350.000 ARS | 1.5x (1.5 pts cada $100) | Mesa preferencial en reservas + postre gratis |
| **BLACK** | > $350.000 ARS | 2.0x (2.0 pts cada $100) | Invitación a catas privadas + 0% costo delivery |

- **Recálculo de Tiers:** Se ejecuta de forma reactiva al finalizar cada venta o mediante un worker nocturno que evalúa la ventana móvil de los últimos 365 días.
