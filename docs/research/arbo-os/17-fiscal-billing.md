# 17 — Facturación, Régimen Fiscal y AFIP / ARCA

**Rutas:** No existen  
**Archivos:** `src/admin/pages/pos/POS.jsx`, `src/services/salesCalculations.js`, `src/context/POSContext.jsx`  
**Estado general:** `NOT_IMPLEMENTED` — no existe ningún módulo fiscal, impositivo ni de facturación electrónica.

---

## 17.1 Veredicto Forense

**FACT · NOT_IMPLEMENTED** — ARBO OS opera en un régimen **100% informal/interno**.
- No existe integración con los Web Services de **AFIP / ARCA** (WSFE, WSMTXCA).
- No hay solicitud de **CAE** (Código de Autorización Electrónico) ni **CAEA**.
- No existe el concepto de tipos de comprobante fiscal: **Factura A, B, C, M**, Tique a Consumidor Final, Nota de Débito ni Nota de Crédito.
- No existe desglose de **IVA** (21%, 10,5%, exento). Todos los precios en carta son números brutos planos sin desglose impositivo.
- No hay campo para CUIT/CUIL de clientes ni condición frente al IVA (Responsable Inscripto, Monotributo, Consumidor Final).
- No existe generación de **código QR fiscal obligatorio** (RG 4597/2019) con URL oficial de validación.

---

## 17.2 Lo que realmente genera el POS

Al confirmar una venta en el POS (`confirmSale` en `POSContext.jsx:303`):
1. Se genera un número correlativo simple (`#0001`, `#0002`).
2. Se registra un objeto plano en `sales` dentro de `localStorage`.
3. Se muestra una pantalla de confirmación con el total cobrado y vuelto.
4. **No hay impresión física:** Ni vía Web Print API, ni comando ESC/POS a comandera térmica (Epson, Hasar, Bematech), ni generación de PDF.
5. **No hay anulación ni Nota de Crédito:** Una vez confirmada una venta, no puede modificarse, anularse ni emitirse devolución formal.

---

## 17.3 Riesgo Legal y Operativo

| Requisito Legal Gastronómico (Argentina) | Estado en ARBO OS | Nivel de Riesgo |
|---|---|---|
| Emisión obligatoria de comprobante fiscal (RG 4291) | `NOT_IMPLEMENTED` | **Crítico (Clausura / Multa)** |
| Envío de Libro de IVA Digital | `NOT_IMPLEMENTED` | **Crítico (Incumplimiento formal)** |
| Controlador fiscal homologado (Nueva Tecnología) | `NOT_IMPLEMENTED` | **Alto** |
| Discriminación de propinas / medios electrónicos | `NOT_IMPLEMENTED` | **Medio** |
| Facturación diferida / Cuentas corrientes | `NOT_IMPLEMENTED` | **Medio** |
