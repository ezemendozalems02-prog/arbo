# ARBO OS — POST-PHASE 7 CHECKPOINT
## 14. VALIDACIÓN DE FLUJOS TRANSACCIONALES END-TO-END

---

## 1. FLUJO A: VENTA EN SALÓN CON FACTURACIÓN FISCAL

```
VENTA EN SALÓN (Mesa o Mostrador)
  │
  ├─► PAGO & ARQUEO DE CAJA (Efectivo/Tarjeta)
  ├─► EXPLOSIÓN DE RECETAS & CONSUMO INVENTARIO (PPP)
  ├─► EMISIÓN DE COMANDA KDS (Cocina / Barra)
  ├─► ASIGNACIÓN DE PUNTOS ARBO CLUB (Floor(Total / 100))
  │
  └─► CAPA FISCAL DESACOPLADA (FiscalManager)
        ├── Caso Óptimo: AFIP autoriza <3.5s ──► Factura con CAE & QR Oficial
        └── Caso Degradado: AFIP timeout/503 ──► Factura PENDING_CONTINGENCY + Encolado
              │
              └─► PIPELINE DE AUTOMATIZACIONES (Ticket Digital WhatsApp)
```
- **Hallazgo**: No se crearon caminos paralelos ni ventas huérfanas. El comprobante fiscal se referencia limpiamente mediante `sales.fiscal_invoice_id`.

---

## 2. FLUJO B: PEDIDO ONLINE PÚBLICO (TAKEAWAY / DELIVERY)

```
TIENDA WEB PÚBLICA (/store/:slug)
  │
  ├─► VALIDACIÓN DE CARRITO & PRECIOS (Anti-Tampering)
  ├─► REGISTRO / MATCHING DE CLIENTE
  ├─► CONFIRMACIÓN EN MOSTRADOR (ConfirmPublicOrderToSale)
  │     ├── Dispara checkout ACID
  │     ├── Actualiza estado de orden a CONFIRMED
  │     ├── Genera ticket KDS con tag [ONLINE TAKEAWAY]
  │     └── Emite comprobante fiscal vía FiscalPort
  │
  └─► TRACKING SEGURO (/pedidos/tracking/:token)
        └── Visualización de estado sincronizada en tiempo real sin exponer PII
```
- **Hallazgo**: La integración con Fase 6 es orgánica, indivisible y consistente.
