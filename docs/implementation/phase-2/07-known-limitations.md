# ARBO OS — FASE 2: LIMITACIONES CONOCIDAS Y ALCANCE POSTERGADO

De acuerdo con el mandato de no adelantar fases y mantener la integridad del alcance:

---

## 1. LO QUE ESTÁ FUERA DE ALCANCE EN FASE 2

1. **POS y Cobro en Vivo:**
   - La baja automática de inventario a través de transacciones de venta desde terminales de mozo o mostrador se implementará en la **Fase 3 (POS & Comandas)**.
   - En Fase 2, la función `calculateRecipeDepletion()` está probada a nivel de servicio y dominio, y genera la estructura exacta para el ledger, pero no se ha conectado un punto de venta.
2. **Caja y Cierres X/Z:**
   - No se implementaron movimientos de dinero ni arqueos de caja en esta fase.
3. **Módulo de Compras a Proveedores (Purchase Orders):**
   - El inventario inicial y las entradas se registran mediante movimientos de tipo `INITIAL_STOCK` o `PURCHASE_RECEIPT` con costo unitario, pero sin la gestión de órdenes de compra, órdenes de pago o cuentas corrientes a proveedores.
4. **KDS (Cocina y Barismo):**
   - El enrutamiento de comandas por estación de preparación se pospone para las fases de salón y cocina.
5. **ARBO Club / Fidelización / Clientes:**
   - No se integraron programas de puntos ni perfiles de clientes en el catálogo en esta etapa.
6. **Facturación Electrónica (AFIP):**
   - No se emitieron comprobantes fiscales ni CAE.
