# ARBO OS — PRE-PHASE 7 CHECKPOINT
## 06. DEPENDENCIAS CON LAS FASES 1 A 6

---

## 1. INTEGRACIÓN CON LOS CIMIENTOS EXISTENTES

La Fase 7 se apoya de forma directa sobre las estructuras ya validadas y certificadas:

```
┌────────────────────────────────────────────────────────┐
│          FASE 7: CAPA FISCAL & AUTOMATIZACIONES        │
└───────────┬──────────────┬─────────────┬───────────────┘
            │              │             │
            ▼              ▼             ▼
      [ sales ]     [ customers ]  [ organizations ]
    (Fase 3 & 6)       (Fase 5)        (Fase 1)
```

1. **Dependencia con `sales` & `sale_items` (Fases 3 y 6)**:
   - Todo comprobante fiscal debe emitirse sobre una venta ya cerrada o validada, utilizando sus líneas (`sale_items`) para calcular las bases imponibles y el IVA correspondiente.
2. **Dependencia con `customers` (Fase 5)**:
   - Para emitir una **Factura A**, el sistema requiere el `document_id` (CUIT) y la razón social del cliente.
   - Para **Facturas B** superiores al umbral legal de AFIP, se requiere capturar el DNI del comensal.
3. **Dependencia con `organizations` & `branches` (Fase 1)**:
   - La organización aporta el `tax_id` (CUIT emisor) y la condición frente al IVA (Responsable Inscripto o Monotributo).
   - Cada sucursal aporta el número de **Punto de Venta AFIP** (`fiscal_pos_number`).
4. **Dependencia con `cash_movements` (Fase 3)**:
   - El comprobante fiscal registra el desglose impositivo pero el dinero cobrado impacta en el libro mayor de caja sin alteración de la transacción ACID.
