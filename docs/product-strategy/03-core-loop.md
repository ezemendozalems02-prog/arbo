# 03 — THE ARBO CORE LOOP

---

## 1. DEFINICIÓN CONCEPTUAL DEL CORE LOOP

En un restaurante, el valor no se produce en una pantalla estática; se produce en la circulación continua entre la demanda del comensal, la ejecución en cocina, la liquidación financiera y la reposición de materias primas.

A partir de la evidencia forense acumulada en `FINAL-ARBO-OS-FORENSIC-AUDIT.md` y `FINAL-FUDO-VS-ARBO-COMPARATIVE-AUDIT.md`, el bucle operativo y transaccional central de ARBO OS se define como:

```
    ┌────────────────────────────────────────────────────────┐
    │                  1. ENTRADA DEL PEDIDO                 │
    │  (Salón / Mostrador / Tienda Online / QR en Mesa)       │
    └───────────────────────────┬────────────────────────────┘
                                │
                                ▼
    ┌────────────────────────────────────────────────────────┐
    │               2. DESPACHO & PREPARACIÓN                │
    │  (KDS / Pantalla de Cocina / Estaciones de Comanda)    │
    └───────────────────────────┬────────────────────────────┘
                                │
                                ▼
    ┌────────────────────────────────────────────────────────┐
    │           3. COBRO & LIQUIDACIÓN TRANSACCIONAL         │
    │  (Caja / Arqueo / Múltiples Medios / Facturación)       │
    └───────────────────────────┬────────────────────────────┘
                                │
                                ▼
    ┌────────────────────────────────────────────────────────┐
    │        4. DESCARGA DE INVENTARIO & COSTEO NETO         │
    │  (Explosión de Recetas / Descuento Stock / Margen)     │
    └───────────────────────────┬────────────────────────────┘
                                │
                                ▼
    ┌────────────────────────────────────────────────────────┐
    │         5. RETENCIÓN & FIDELIZACIÓN DEL COMENSAL       │
    │  (Acumulación Puntos / Ledger / Perfil CRM / Hábitos)  │
    └───────────────────────────┬────────────────────────────┘
                                │
                                ▼
    ┌────────────────────────────────────────────────────────┐
    │         6. INTELIGENCIA, ACCIÓN & RE-ENGAGEMENT        │
    │  (Sugerencia Compra / Segmentación / Promo Reactivación)│
    └───────────────────────────┴────────────────────────────┘
```

---

## 2. DESGLOSE PASO A PASO DEL CORE LOOP

### Paso 1: Entrada del Pedido (Order Ingestion)
- **Qué ocurre:** El cliente ordena en el salón asistido por un mozo (`FloorPlan.jsx`), en mostrador (`POS.jsx`), o de forma autónoma desde la web (`PublicMenu.jsx`). Se seleccionan platos, variantes, modificadores y notas operativas.
- **Datos generados:** `order_id`, `items[]`, `modifiers[]`, `customer_id` (o comensal anónimo), `channel` (Dine-in / Takeaway / Delivery), `table_id`, `timestamp`.
- **Módulos que participan:** POS, Salón (Floor Plan), Tienda Pública Web.
- **Transaccionalidad:** Debe ser atómico: la comanda se confirma y bloquea la mesa o genera el ticket pendiente.
- **Gap actual en ARBO:** 
  - BUG-001: El checkout de `/pedidos` no persiste la orden ni la envía a cocina (`[FACT: src/pages/PublicDelivery.jsx]`).
  - BUG-006: El POS no permite vincular directamente clientes del CRM ni validar puntos (`[FACT: src/pages/POS.jsx]`).

### Paso 2: Despacho & Preparación (Kitchen Execution)
- **Qué ocurre:** La comanda se particiona automáticamente por estaciones de trabajo (ej. Horno, Parrilla, Barra) según la categoría del ítem y se proyecta en el KDS (`[FACT: src/services/kitchenService.js]`). Cocina marca preparación, despacho o cancelación.
- **Datos generados:** `ticket_id`, `station_id`, `status` (PENDING → PREPARING → READY → DELIVERED), `prep_time_seconds`.
- **Módulos que participan:** KDS (`KitchenDisplay.jsx`), POS.
- **Transaccionalidad:** Los cambios de estado deben sincronizarse en tiempo real con la mesa y el POS.
- **Gap actual en ARBO:**
  - BUG-003: Al cancelar un ítem en KDS, permanece facturable en el POS (`[FACT]`).
  - BUG-004: Al cobrar un pedido en POS, el ticket de KDS queda huérfano y activo (`[FACT]`).

### Paso 3: Cobro & Liquidación Transaccional (Settlement)
- **Qué ocurre:** El cliente solicita la cuenta. Se aplica división de pago, descuentos, propinas y canjes de puntos del Club. Se registra el ingreso en la caja del turno abierto.
- **Datos generados:** `payment_id`, `amount`, `payment_method` (Cash, MP, Card), `cash_shift_id`, `tax_details`, `points_redeemed`.
- **Módulos que participan:** POS Checkout, Caja (`Caja.jsx`, `cashCalculations.js`).
- **Transaccionalidad:** ESTRICTA. El cobro no puede registrarse sin impactar el arqueo de caja de forma inmediata e inmutable.
- **Gap actual en ARBO:**
  - BUG-018: Al reabrir una caja se borran los movimientos históricos del turno (`[FACT]`).
  - BUG-021: El POS no tiene selector para aplicar recompensas de ARBO Club (`[FACT]`).
  - Ausencia de emisión fiscal electrónica (AFIP/ARCA) (`[FACT]`).

### Paso 4: Descarga de Inventario & Costeo Real (Stock & Margin Depletion)
- **Qué ocurre:** Al confirmarse la venta, el sistema ejecuta la "explosión de recetas": toma cada plato vendido, busca su ficha técnica (`recipeService.js`), multiplica la cantidad de ingredientes por el volumen de porciones y descuenta las materias primas del depósito activo. Calcula el Food Cost real y el margen bruto del ticket.
- **Datos generados:** `stock_movement[]` (tipo SALE), `depleted_quantity`, `current_stock_level`, `unit_cost_snapshot`, `ticket_food_cost`, `ticket_gross_margin`.
- **Módulos que participan:** Inventario (`InventoryContext.jsx`), Recetas (`recipeCostService.js`), Compras (`purchaseService.js`).
- **Transaccionalidad:** ESTRICTA. Debe ejecutarse en una transacción de base de datos única para evitar inventario fantasma o stocks negativos no intencionales.
- **Gap actual en ARBO:**
  - P0-GAP-02: Las ventas del POS **NO descuentan el inventario** en el código actual (`[FACT: InventoryContext.jsx:18-22, comentario explícito TODO]`).

### Paso 5: Retención & Fidelización del Comensal (Customer Capture)
- **Qué ocurre:** El monto gastado genera puntos de fidelización en ARBO Club según el ratio configurado. Si el cliente no estaba registrado, el ticket emite un QR dinámico para auto-registro o el cajero ingresa su teléfono. El ledger de puntos se incrementa de forma inmutable.
- **Datos generados:** `loyalty_transaction_id`, `points_earned`, `points_balance`, `tier_upgrade_event`, `customer_visit_count`, `customer_ltv`.
- **Módulos que participan:** ARBO Club (`loyaltyPointsService.js`), Clientes/CRM (`ClientContext.jsx`).
- **Transaccionalidad:** Ledger auditable (append-only).
- **Gap actual en ARBO:**
  - Desconexión entre el POS y el servicio de puntos (`[FACT: src/services/loyaltyPointsService.js existe pero no es invocado en checkout]`).

### Paso 6: Inteligencia Operativa, Acción & Re-engagement
- **Qué ocurre:** Los datos consolidados de la venta alimentan dos ramas:
  1. *Hacia atrás (Back-office):* Si el stock cayó por debajo del mínimo, se genera una sugerencia de compra (`purchaseSuggestionService.js`).
  2. *Hacia adelante (Marketing/Growth):* El motor de segmentación actualiza la etiqueta del comensal (ej. "VIP", "En Riesgo", "Amante de Pizzas") y dispara triggers de automatización (ej. WhatsApp de cumpleaños o aviso de puntos por vencer).
- **Datos generados:** `purchase_suggestion_id`, `customer_segment_assignment`, `automation_event`.
- **Módulos que participan:** Sugerencias de Compra, Segmentación (`segmentService.js`), Notificaciones.
- **Transaccionalidad:** Asíncrono / Event-driven.
- **Gap actual en ARBO:**
  - El motor de sugerencias funciona con arrays en memoria y no genera órdenes de compra en borrador (`[FACT]`).
  - No existe motor backend de mensajería (WhatsApp/Email) para materializar las campañas (`[FACT]`).

---

## 3. RESUMEN DE DEPENDENCIAS DEL BUCLE

```
[Entrada de Pedido] ──(Sincrónico)──► [KDS Preparación]
        │
   (Sincrónico)
        ▼
  [Cobro en Caja] ────(Atómico)────► [Descarga Recetas & Stock]
        │
   (Atómico)
        ▼
 [Ledger ARBO Club] ──(Asíncrono)──► [Segmentación CRM & Sugerencia Compras]
```

**Conclusión estratégica:** El Core Loop de ARBO OS es conceptualmente superior al de Fudo porque cierra el círculo con fidelización e inteligencia de costos nativa; sin embargo, en el estado actual de prototipo, el bucle se encuentra **roto en 4 puntos clave (Stock, KDS sync, Checkout público y Ledger en POS)**. El objetivo del MVP es soldar este ciclo transaccional de manera inquebrantable.
