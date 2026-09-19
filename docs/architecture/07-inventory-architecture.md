# 07 — ARQUITECTURA DE INVENTARIO Y MOTOR DE EXPLOSIÓN DE RECETAS

---

## 1. EL LIBRO MAYOR DE INVENTARIO (IMMUTABLE LEDGER)

ARBO OS descarta por completo el modelo de "campo estático `stock_quantity`" que se sobreescribe con un simple `UPDATE`. En su lugar, implementa un **Libro Mayor de Inventario Inmutable (Append-Only Ledger)** en la tabla `inventory_movements`.

```
┌────────────────────────────────────────────────────────────────────────┐
│                      INVENTORY LEDGER ARCHITECTURE                     │
├────────────────────────────────────────────────────────────────────────┤
│ Cada cambio físico de materia prima es un registro histórico:         │
│  - ID (UUID)                                                           │
│  - Organization & Branch & Warehouse ID                                │
│  - Ingredient ID                                                       │
│  - Movement Type (PURCHASE, SALE_DEPLETION, WASTE, ADJUSTMENT, etc.)   │
│  - Quantity Delta (+ Ingreso / - Egreso)                               │
│  - Unit Cost Snapshot (Costo PPP exacto al momento del movimiento)     │
│  - Reference ID (order_id, purchase_id, transfer_id)                   │
│  - Reason / Notes                                                      │
│  - Created By (Usuario responsable)                                    │
│  - Created At (Timestamp inmutable)                                    │
└────────────────────────────────────────────────────────────────────────┘
```

### 1.1. Tipos de Movimiento Soportados
1. `PURCHASE`: Ingreso por factura de compra a proveedor. Aumenta stock y recalcula PPP.
2. `SALE_DEPLETION`: Egreso automático por venta de plato/bebida vía explosión de receta.
3. `WASTE`: Egreso por merma no vendible (rotura, quema, vencimiento, descarte).
4. `ADJUSTMENT`: Corrección manual por auditoría o recuento físico de inventario.
5. `TRANSFER_OUT`: Egreso de un depósito (ej. Depósito Central) con destino a sucursal.
6. `TRANSFER_IN`: Ingreso confirmado en depósito destino procedente de transferencia.
7. `RETURN`: Devolución a proveedor o anulación de comanda cobrada.

### 1.2. Cálculo del Stock Vigente
El stock actual en un depósito específico se obtiene mediante agregación o mediante una vista materializada indexada:
```sql
SELECT 
    ingredient_id,
    warehouse_id,
    COALESCE(SUM(quantity_delta), 0) AS current_stock
FROM inventory_movements
WHERE organization_id = $1 AND warehouse_id = $2
GROUP BY ingredient_id, warehouse_id;
```

---

## 2. EL MOTOR DE EXPLOSIÓN DE RECETAS (RECIPE EXPLOSION)

### 2.1. Flujo de Ejecución ante una Venta
Cuando una orden pasa a estado `SETTLED` (cobrada), el backend ejecuta una función almacenada transaccional en PostgreSQL (`fn_deplete_order_inventory`):

```
[Orden Cobrada en POS] 
         │
         ▼
[Obtener Items & Variantes] ──► [Buscar Fichas Técnicas Activas]
         │
         ▼
[Procesar Modificadores]    ──► [Identificar Sustituciones / Extras]
         │
         ▼
[Calcular Cantidad x Merma] ──► [Insertar Registros en inventory_movements]
         │
         ▼
[Commit Transaccional]      ──► [Emitir Evento: InventoryDepletedEvent]
```

### 2.2. Manejo de Modificadores (Extras y Sustituciones)
- **Modificador de Adición (Extra shot de café, extra queso):** Agrega un movimiento de egreso directo para el ingrediente del extra.
- **Modificador de Sustitución (Leche de almendras por leche entera):** 
  - Anula el consumo del ingrediente base de la receta (leche entera: 0 ml).
  - Genera el egreso del ingrediente sustituto (leche de almendras: 200 ml).

### 2.3. Soporte para Sub-Recetas (Recetas Multi-Nivel)
Un plato puede consumir tanto ingredientes simples como sub-recetas elaboradas previamente (ej. salsa de tomate casera o masa madre):
- **Modo 1 (Sub-receta stockeable):** Si el restaurante elabora batches de salsa y los ingresa al stock como un ítem intermedio, la venta del plato descuenta directamente "litros de salsa".
- **Modo 2 (Explosión recursiva):** Si la sub-receta no se gestiona como stock intermedio, el motor desciende en el árbol y descuenta proporcionalmente los tomates, cebollas y aceite de la sub-receta.

---

## 3. ACTUALIZACIÓN DEL PRECIO PROMEDIO PONDERADO (PPP)

Cuando se registra una compra (`PURCHASE`), el nuevo costo unitario del ingrediente se recalcula de forma determinística:

$$\text{PPP}_{\text{nuevo}} = \frac{(\text{Stock Actual} \times \text{PPP Actual}) + (\text{Cantidad Comprada} \times \text{Costo Unitario Factura})}{\text{Stock Actual} + \text{Cantidad Comprada}}$$

- Si el stock actual es $\le 0$, el nuevo $\text{PPP}$ toma directamente el costo de la nueva compra.
- El valor calculado se guarda en `ingredients.current_cost_unit` y sirve de base para el cálculo del Food Cost % en tiempo real de todos los platos que lo contengan.

---

## 4. POLÍTICA ANTE STOCK NEGATIVO Y CONTINUIDAD OPERATIVA

> **"En la realidad gastronómica, un mozo o cajero en hora pico de un sábado por la noche NUNCA debe ser bloqueado para vender porque el sistema marque 0 unidades de un insumo si físicamente el cocinero tiene el producto en la mano."**

### La Regla de ARBO OS
1. **No Bloqueo en POS:** La venta y la descarga de stock se efectúan aun si el saldo teórico cae a negativo (ej. `-2.5 kg`).
2. **Registro de Alerta Operativa:** El sistema genera automáticamente una alerta de *Inventario Negativo* (`ANOMALY_NEGATIVE_STOCK`) con severidad media.
3. **Auditoría Posterga:** Al día siguiente, el encargado audita si hubo una compra sin registrar en el sistema o una merma mal declarada, aplicando un ajuste de inventario compensatorio (`ADJUSTMENT`).
