# ARBO OS — FASE 3: PLAN TÉCNICO DE VENTAS, CAJA Y TRANSACCIÓN ACID

**Fecha:** 2026-09-19  
**Estado:** IMPLEMENTADO Y VALIDADO  
**Objetivo:** Construir el núcleo transaccional ACID de ventas, cobros en efectivo y movimientos de caja en ARBO OS, integrando la descarga de inventario por explosión de recetas y preservando el historial de turnos de caja en un libro mayor inmutable (append-only ledger).

---

## 1. ALCANCE Y LÍMITES DE FASE 3

### En Alcance:
1. **Puntos de Venta y Cajas:**
   - Tabla `cash_registers`: Registradoras físicas/lógicas asociadas a una organización y sucursal.
   - Tabla `cash_sessions`: Turnos de caja (`OPEN`, `CLOSED`) con usuario de apertura/cierre, monto inicial, arqueo esperado, declarado y diferencias.
   - Tabla `cash_movements`: Libro mayor inmutable para registrar `OPENING`, `SALE`, `REFUND`, `ADJUSTMENT_IN`, `ADJUSTMENT_OUT`.
2. **Ventas y Cobros:**
   - Tabla `sales`: Cabecera con número secuencial por sucursal, subtotal, descuentos, total y estado (`DRAFT`, `CONFIRMED`, `PAID`, `CANCELLED`).
   - Tabla `sale_items`: Líneas con snapshots inmutables de precio (`unit_price_snapshot`) y nombre de producto (`product_name_snapshot`).
   - Tabla `payments`: Registro de cobro en efectivo (`CASH`) con validación estricta de total a pagar contra recibido y vuelto.
3. **Descarga de Inventario por Receta:**
   - Para cada producto vendido con receta en `recipes`, se calculan y registran consumos negativos en `inventory_movements` con tipo `SALE_DEPLETION` en unidad base.
4. **Operación Transaccional ACID Indivisible:**
   - Función PostgreSQL RPC `execute_sale_checkout(...)` que encapsula en una única transacción atómica:
     - Verificación de sesión de caja activa (`OPEN`).
     - Cálculo y validación de totales.
     - Bloqueo de concurrencia (`FOR UPDATE`) sobre insumos.
     - Verificación estricta de stock (`INSUFFICIENT_STOCK`).
     - Creación de cabecera `sales`.
     - Inserción de `sale_items`.
     - Inserción de `payments`.
     - Inserción de deltas de insumos en `inventory_movements`.
     - Inserción de entrada de dinero en `cash_movements`.
     - Rollback completo si cualquier validación o restricción falla.
5. **Aislamiento Multi-tenant (RLS):**
   - Políticas PostgreSQL en las 6 nuevas entidades garantizando aislamiento total entre organizaciones y sucursales.

### Fuera de Alcance (Estrictamente Postergado):
- POS de salón avanzado con split de pagos complejos.
- KDS / Pantallas de cocina en tiempo real.
- Fidelización / ARBO Club y canje de recompensas.
- Medios de pago electrónicos (Mercado Pago, tarjetas, transferencias bancarias).
- Facturación fiscal electrónica AFIP / ARCA y CAE.
- Reservas y pedidos online.

---

## 2. ETAPAS DE EJECUCIÓN

| Etapa | Descripción | Artefactos |
| :--- | :--- | :--- |
| **1. DDL & Migración** | Modelado de 6 tablas e índices | `supabase/migrations/20260919000003_sales_cash_acid.sql` |
| **2. RPC Transaccional** | Función ACID `execute_sale_checkout` | Dentro de migración SQL |
| **3. Capa de Dominio** | Servicios puros de checkout y caja | `src/services/domain/saleCheckout.js`, `cashSessionManager.js` |
| **4. Adaptación UI** | Compatibilidad sin sobreescritura de caja | `src/context/POSContext.jsx` |
| **5. Testing Automatizado** | 38 validaciones (slice, rollback, concurrencia) | `scripts/validate_phase3_sales_cash_acid.js` |
| **6. Build de Producción** | Verificación sin errores de bundle | Vite build exitoso |
| **7. Documentación** | 9 reportes técnicos de arquitectura | `docs/implementation/phase-3/*.md` |
