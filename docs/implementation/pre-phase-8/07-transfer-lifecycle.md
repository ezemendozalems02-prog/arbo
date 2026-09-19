# ARBO OS — PRE-PHASE 8 CHECKPOINT
## 07. CICLO DE VIDA DE TRANSFERENCIAS & PUNTOS DE MUTACIÓN FÍSICA

---

## 1. MÁQUINA DE ESTADOS TRANSACCIONAL

```
       [ DRAFT ]  (Borrador preparatorio. Cero impacto físico)
           │
           ├─► (Opcional: [ REQUESTED ] — Solicitud formal de sucursal)
           │
           ▼
     [ DISPATCHED ]  <--- MOMENTO 1: EGRESO FÍSICO
           │              - Se valida stock disponible en Origen.
           │              - Se inserta 'TRANSFER_OUT' (-Q) en Origen.
           │              - La mercadería queda EN TRÁNSITO.
           │
           ▼
     [ RECEIVED ]    <--- MOMENTO 2: INGRESO FÍSICO
                          - Se valida recepción física en Destino.
                          - Se inserta 'TRANSFER_IN' (+Q) en Destino.
                          - Se recalcula el PPP ponderado en Destino.
```

---

## 2. CANCELACIONES & COMPENSACIONES
- **Cancelación desde `DRAFT` o `REQUESTED`**:
  - Simplemente transiciona a `CANCELLED`. No requiere movimientos de inventario porque la mercadería nunca egresó físicamente.
- **Cancelación desde `DISPATCHED`**:
  - La mercadería ya salió de origen. Si el transporte regresa o se cancela el despacho, se requiere una operación atómica de reversión que genera un movimiento compensatorio de reingreso en origen (`movement_type = 'TRANSFER_IN'` o ajuste formal de reversión).
