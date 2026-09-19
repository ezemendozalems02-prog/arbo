# ARBO OS — PRE-PHASE 8 CHECKPOINT
## 05. PRINCIPIO DE FUENTE ÚNICA DE LA VERDAD (SINGLE SOURCE OF TRUTH)

---

## 1. REGLA ARQUITECTÓNICA ABSOLUTA
En ARBO OS está terminantemente prohibido mantener dos fuentes dispares de saldo de inventario:
- `stock_transfers` representa el **documento comercial y flujo de trabajo de negocio** (quién solicitó, quién despachó, quién recibió, notas y estado).
- `inventory_movements` representa el **libro mayor inmutable de partida física y contable** (append-only ledger).

```
   TRANSFERENCIA (stock_transfers)
        │
        ├─► [PASO 1: DESPACHO] ──► Genera inventory_movement (TRANSFER_OUT)
        │                            - branch_id: Origen
        │                            - quantity_delta: -10.0000
        │                            - cost_snapshot: PPP Origen
        │
        └─► [PASO 2: RECEPCIÓN] ─► Genera inventory_movement (TRANSFER_IN)
                                     - branch_id: Destino
                                     - quantity_delta: +10.0000
                                     - cost_snapshot: PPP Origen transferido
```

---

## 2. GARANTÍAS DERIVADAS
1. **Cero Duplicación de Saldos**: El saldo de una sucursal o depósito **SIEMPRE** se deriva exclusivamente de `SUM(quantity_delta)` en `inventory_movements`.
2. **Trazabilidad Completa**: Cada movimiento generado por una transferencia enlaza en `reference_id` el identificador de la transferencia y en `reason` el número de remito interno.
