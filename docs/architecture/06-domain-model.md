# 06 — DOMAIN MODEL Y LÍMITES DE DOMINIO (DDD)

---

## 1. BOUNDED CONTEXTS DE ARBO OS

Siguiendo los principios de Domain-Driven Design (DDD), ARBO OS se organiza en **6 Bounded Contexts** con responsabilidades e invariantes estrictamente delimitadas:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BOUNDED CONTEXTS DE ARBO OS                     │
├───────────────────────────────┬────────────────────────────────────────┤
│ 1. SALES & POS CONTEXT        │ Captura de intención, precios, mesas,  │
│                               │ ítems, modificadores y cobros.         │
├───────────────────────────────┼────────────────────────────────────────┤
│ 2. KITCHEN & DISPATCH (KDS)   │ Enrutamiento de tickets, estaciones de │
│                               │ preparación y tiempos de despacho.     │
├───────────────────────────────┼────────────────────────────────────────┤
│ 3. INVENTORY & COSTING        │ Materias primas, fichas técnicas, PPP, │
│                               │ explosión de recetas y merma.          │
├───────────────────────────────┼────────────────────────────────────────┤
│ 4. CASH & FINANCE CONTEXT     │ Turnos de caja, libro mayor de dinero, │
│                               │ arqueo ciego y medios de pago.         │
├───────────────────────────────┼────────────────────────────────────────┤
│ 5. RETENTION & LOYALTY        │ Directorio de comensales, ARBO Club,   │
│                               │ ledger de puntos y segmentación.       │
├───────────────────────────────┼────────────────────────────────────────┤
│ 6. TENANCY & IDENTITY CONTEXT │ Organizaciones, sucursales, usuarios,  │
│                               │ roles y permisos de acceso (RBAC).     │
└───────────────────────────────┴────────────────────────────────────────┘
```

---

## 2. AGREGADOS, ENTIDADES Y VALUE OBJECTS

### 2.1. Agregado: `Order` (Sales Context)
- **Aggregate Root:** `Order`
- **Entidades internas:** `OrderItem`, `OrderModifier`
- **Value Objects:**
  - `Money`: Inmutable, encapsula monto y moneda (`amount: NUMERIC(12,2)`, `currency: 'ARS'`). Previene errores de punto flotante.
  - `OrderStatus`: Enum (`PENDING`, `CONFIRMED`, `SETTLED`, `CANCELLED`).
  - `OrderType`: Enum (`DINE_IN`, `TAKEAWAY`, `DELIVERY`).
- **Invariantes del Agregado:**
  - Una orden no puede liquidarse (`SETTLED`) si la suma de sus `payments` no cubre exactamente `final_total`.
  - Un `OrderItem` no puede tener una cantidad menor o igual a cero.
  - Los precios aplicados a los ítems quedan congelados en el momento de creación de la orden (`price_snapshot`).

### 2.2. Agregado: `CashShift` (Cash Context)
- **Aggregate Root:** `CashShift`
- **Entidades internas:** `CashMovement`
- **Value Objects:**
  - `ShiftStatus`: Enum (`OPEN`, `CLOSED`).
  - `CashCount`: Registro inmutable del arqueo ciego (`declared_cash: Money`, `declared_cards: Money`).
  - `Discrepancy`: `Money` (positivo = sobrante, negativo = faltante).
- **Invariantes del Agregado:**
  - No puede existir más de un turno `OPEN` por cajero y caja física simultáneamente.
  - No se pueden registrar movimientos en un turno `CLOSED`.
  - Los movimientos históricos son estrictamente inmutables (append-only); no se pueden editar ni borrar.

### 2.3. Agregado: `Recipe` (Inventory & Costing Context)
- **Aggregate Root:** `Recipe`
- **Entidades internas:** `RecipeItem`
- **Value Objects:**
  - `Quantity`: `value: NUMERIC(12,4)`, `unit: UnitEnum` ('KG', 'G', 'L', 'ML', 'UNIT').
  - `WasteFactor`: Porcentaje de merma operativa (`0.0%` a `100.0%`).
  - `FoodCostPercentage`: `NUMERIC(5,2)` derivado: $\frac{\text{Costo Ingredientes}}{\text{Precio Venta Plato}} \times 100$.
- **Invariantes del Agregado:**
  - Toda receta debe contener al menos un ingrediente válido.
  - Las conversiones de unidades deben ser matemáticamente homogéneas (masa a masa, volumen a volumen).

### 2.4. Agregado: `LoyaltyAccount` (Retention Context)
- **Aggregate Root:** `Customer`
- **Entidades internas:** `LoyaltyTransaction`
- **Value Objects:**
  - `PointsBalance`: Saldo entero acumulado (`int >= 0`).
  - `TierLevel`: Enum (`BRONZE`, `SILVER`, `GOLD`, `BLACK`).
- **Invariantes del Agregado:**
  - El saldo de puntos nunca puede ser negativo.
  - Un canje de puntos debe generar un débito en el ledger exactamente igual al costo en puntos de la recompensa.

---

## 3. PURE DOMAIN SERVICES (SERVICIOS DE DOMINIO PUROS)

Los servicios de dominio contienen la lógica matemática del negocio, son funciones puras (sin efectos secundarios ni llamadas a APIs de base de datos) y se pueden ejecutar en frontend o backend:

1. **`PricingDomainService`:** Calcula subtotal, descuentos, recargos y total final de una orden aplicando reglas de redondeo.
2. **`RecipeExplosionDomainService`:** Recibe una orden y el catálogo de fichas técnicas, y produce la lista de ingredientes exactos a descontar de inventario aplicando el factor de merma:
   $$\text{Cantidad a descontar} = \text{Cantidad plato} \times \text{Cantidad receta} \times \left(1 + \frac{\text{Factor merma}}{100}\right)$$
3. **`WeightedAverageCostDomainService (PPP)`:** Recibe el stock previo, el costo unitario anterior, la nueva compra y calcula el nuevo costo promedio ponderado:
   $$\text{PPP}_{\text{nuevo}} = \frac{(\text{Stock}_{\text{ant}} \times \text{PPP}_{\text{ant}}) + (\text{Cantidad}_{\text{compra}} \times \text{Costo}_{\text{compra}})}{\text{Stock}_{\text{ant}} + \text{Cantidad}_{\text{compra}}}$$
4. **`CashBalancingDomainService`:** Calcula el saldo teórico esperado sumando apertura y movimientos registrados, y computa el desvío contra el arqueo físico declarado.
5. **`LoyaltyPointsDomainService`:** Convierte dinero gastado en puntos aplicando el multiplicador del tier vigente del cliente (`earned = floor(amount * tier_multiplier * base_ratio)`).

---

## 4. EVENTOS DE DOMINIO (DOMAIN EVENTS)

Cuando un agregado sufre una mutación válida, emite un evento de dominio inmutable:

- `OrderCreatedEvent`: `order_id`, `items[]`, `table_id`, `channel`, `timestamp`.
- `OrderSettledEvent`: `order_id`, `final_total`, `payments[]`, `customer_id`.
- `KitchenTicketDispatchedEvent`: `ticket_id`, `station_id`, `preparation_time_seconds`.
- `InventoryDepletedEvent`: `order_id`, `movements: [{ ingredient_id, quantity, unit }]`.
- `CashShiftClosedEvent`: `shift_id`, `discrepancy`, `cashier_id`.
- `LoyaltyPointsAccruedEvent`: `customer_id`, `points_earned`, `new_balance`.
