# 26 — Brechas de Producto Gastronómico (Product Gaps)

Inventario de requerimientos esenciales de la industria gastronómica que **no existen en ARBO OS**. A diferencia de `25-bugs.md` (que cataloga fallas sobre lo prometido), este documento registra ausencias de diseño necesarias para operar un local real.

---

## 26.1 Salón y Servicio de Mozo

1. **Gestión dinámica de mesas:**
   - No se pueden unir mesas para grupos grandes.
   - No se puede cambiar comensales de mesa (transferencia de orden).
   - No se pueden transferir platos individuales entre mesas.
2. **División de cuenta real (`Split Bill`):**
   - El modal actual es una calculadora visual. No existe división por producto (comensal A paga su ensalada, comensal B su bife) ni cobro fraccionado con tickets independientes.
3. **Gestión de propinas:**
   - No existe campo para propina en el cobro ni porcentaje sugerido (10%).
   - No hay registro de caja para pozo de propinas de mozos/bacha.

---

## 26.2 Inventario y Cocina

1. **Venta no descuenta stock:**
   - La omisión más crítica: vender platos no descuenta existencias de insumos en tiempo real.
2. **Depósitos múltiples / Sub-almacenes:**
   - No existe diferenciación física de stock entre Barra, Cocina Fría, Cocina Caliente y Depósito Central.
   - Sin transferencias internas de insumos entre sectores.
3. **Impresión térmica de comandas (ESC/POS):**
   - No hay conexión a impresoras fiscales ni térmicas (Epson/Hasar). Las comandas solo se visualizan en pantalla KDS, lo que resulta inviable en cocinas con humo/grasa donde se requieren comandas impresas.

---

## 26.3 Administración, Caja y Finanzas

1. **Historial de turnos y arqueos:**
   - No hay bitácora histórica de aperturas y cierres de caja; cada apertura destruye los movimientos anteriores.
2. **Cuentas corrientes (Proveedores y Clientes):**
   - Compras solo manejan recepción física, sin control de facturas pendientes de pago ni cheques.
   - No existe la modalidad "cuenta corriente comensal" (habitual en clientes frecuentes corporativos).
3. **Facturación Fiscal AFIP / ARCA:**
   - Ausencia total de facturación electrónica (Facturas A, B, C, CAE, QR fiscal obligatorio).

---

## 26.4 Personal y Seguridad Operativa

1. **Multi-usuario y control de acceso:**
   - Un único usuario hardcodeado: `'Valentina (mozo)'`.
   - Sin roles ni permisos segregados (el cajero no debería ver el costo ponderado de los insumos ni las campañas de marketing).
   - Sin PIN de mozo para autorizar descuentos o anulaciones en mesa.
