# 04 — Caja, Arqueos, Finanzas y Facturación Fiscal

**Categorías cubiertas:**
17. Caja y Registradoras
18. Arqueos y Turnos de Caja
19. Finanzas, Gastos y Cuentas Corrientes
28. Facturación Fiscal e Impositiva (AFIP / ARCA)

---

## 17 & 18. Caja, Arqueos y Turnos

### FUDO
- **Qué hace:** Módulo de caja multi-registradora con control de turnos, arqueo ciego y bitácora histórica permanente.
- **Qué fue documentado (`DOCUMENTED` en Fase 7 y art. 11730876):**
  - **Múltiples cajas simultáneas:** Se pueden crear diferentes cajas (ej. *Caja Salón*, *Caja Mostrador*, *Caja Delivery*, *Caja Barra*), cada una vinculada a usuarios o salas específicas.
  - **Patrón de Arqueo Ciego (`CONFIRMED_WORKING`):** Mediante el permiso de rol `Ver "Según sistema" en arqueo abierto` (Fase 13), el administrador puede **ocultar el saldo esperado al cajero**. El cajero debe contar los billetes físicos y declarar el importe sin saber la cifra del sistema, evitando fraudes o compensaciones fraudulentas.
  - **Historial de turnos inmutable:** Cada cierre genera un registro histórico numerado con fecha de apertura, fecha de cierre, cajero responsable, saldo inicial, ventas por medio de pago, retiros, sobrantes/faltantes y estado. Nunca se borran los movimientos.
- **Limitaciones:** La reconciliación de cobros digitales externos (Mercado Pago / tarjetas) depende del cierre de lote del posnet si no se usa Fudo Pagos integrado.
- **Estado:** `CONFIRMED_WORKING`.

### ARBO OS
- **Qué hace:** Módulo de caja única en `/admin/caja` con cálculo de efectivo esperado en sesión.
- **Qué fue observado (`OBSERVED` en `12-cash-register.md`):**
  - **Aritmética Verificada (`CONFIRMED_WORKING`):** La fórmula de `cashCalculations.js` es matemáticamente exacta:
    $$\text{EfectivoEsperado} = \text{MontoInicial} + \text{VentasEfectivo} + \text{Ingresos} - \text{Egresos}$$
    Comprobado en vivo en la auditoría: Apertura con $50.000 + Ingreso $10.000 - Egreso $3.500 = **$56.500 esperado**; declarado $56.000 arrojó **-$500 de diferencia** en rojo (Evidencia: `evidence/09-caja-cierre-modal.png`).
  - **BUG-018 (P1 · Destrucción de Historial):** `openCashRegister` (`POSContext.jsx:70`) ejecuta `movements: []` al abrir un nuevo turno, **borrando definitivamente todos los movimientos del turno anterior**. `lastClosing` es un único objeto que se sobreescribe al siguiente cierre. No existe historial de turnos pasados.
  - **BUG-019 (P2 · Arqueo no ciego):** El modal de cierre muestra en pantalla completa y en negrita el "Efectivo esperado" antes del conteo, y permite cerrar con cualquier diferencia sin exigir motivo ni clave de supervisor.
  - **BUG-008 (P2 · Venta fuera de caja):** Vender con la caja cerrada registra la venta pero omite el movimiento en caja, dejando el dinero físico fuera del arqueo para siempre.
  - **Caja única:** No se pueden operar dos terminales con cajas separadas.
- **Estado:** `PARTIAL` (Aritmética correcta en sesión única; inviable para control comercial).

### DIFERENCIA COMPROBADA
FUDO soporta múltiples cajas, auditoría histórica permanente y arqueo ciego por rol. ARBO OS opera con una sola caja, destruye el historial al abrir un nuevo turno y exhibe el saldo teórico facilitando la manipulación del arqueo.

---

## 19. Finanzas, Gastos y Cuentas Corrientes

### FUDO
- **Qué hace:** Control financiero operativo con plan de cuentas de gastos y cuentas corrientes comerciales.
- **Qué fue documentado (`DOCUMENTED` en Fase 7 y 12):**
  - **Cuentas Corrientes de Clientes ("Fiado"):** Permite a comensales habituales o corporativos consumir a crédito, registrando cobros parciales posteriores.
  - **Cuentas Corrientes de Proveedores:** Registra compras a plazo con saldo adeudado y control de pagos.
  - **Categorías de Gastos Operativos:** Registro de erogaciones no relacionadas con mercadería (alquiler, luz, sueldos, mantenimiento) con impacto en el estado financiero del negocio.
- **Estado:** `CONFIRMED_WORKING`.

### ARBO OS
- **Qué hace:** Registro de movimientos de ingreso/egreso manuales con etiqueta de texto plano.
- **Qué fue observado (`OBSERVED`):**
  - No existe el concepto de cuenta corriente para clientes ni proveedores (`NOT_IMPLEMENTED`).
  - Recibir una compra de insumos no impacta en la caja ni genera cuenta por pagar.
  - No existe clasificación formal de gastos operativos por categoría contable.
- **Estado:** `NOT_IMPLEMENTED`.

---

## 28. Facturación Fiscal e Impositiva (AFIP / ARCA)

### FUDO
- **Qué hace:** Módulo de Facturación Electrónica oficial homologado con entes tributarios de LATAM.
- **Qué fue documentado (`DOCUMENTED` en Fase 15 y helpcenter AFIP):**
  - **Conexión directa AFIP / ARCA (Argentina):** Emisión en línea de **Factura A, B, C**, Tique a Consumidor Final, Notas de Débito y Crédito.
  - Solicitud automática de **CAE** (Código de Autorización Electrónico) y validación de CUIT con padrón AFIP.
  - Generación obligatoria del **código QR fiscal** (Resolución General 4597) y código de barras.
  - Compatible con Controladores Fiscales de Nueva Tecnología (Hasar / Epson).
  - Emisión de Libro de IVA Digital para presentación mensual por contadores.
- **Estado:** `CONFIRMED_WORKING`.

### ARBO OS
- **Qué hace:** Cero emisión fiscal (`17-fiscal-billing.md`).
- **Qué fue observado (`OBSERVED`):**
  - Cero integración con AFIP / ARCA.
  - No existen tipos de comprobante fiscal ni solicitud de CAE.
  - No hay desglose de alícuotas de IVA (21%, 10,5%).
  - Las ventas confirmadas en el POS son comprobantes de consumo interno no válidos como factura fiscal.
- **Estado:** `NOT_IMPLEMENTED`.

### DIFERENCIA COMPROBADA
FUDO cumple con el régimen legal y tributario de emisión de comprobantes fiscales electrónicos en Argentina y LATAM. ARBO OS opera en absoluta informalidad sin capacidad de facturación fiscal.

### IMPLICACIÓN
Operar comercialmente un restaurante en Argentina con ARBO OS en su estado actual constituye una infracción tributaria sancionable con clausura comercial por la AFIP/ARCA.

---

## Síntesis Clasificatoria

| Categoría | Clasificación FUDO | Clasificación ARBO OS | Tipo de Brecha |
|---|---|---|---|
| **Cálculo de Efectivo en Turno**| `CONFIRMED_WORKING` | `CONFIRMED_WORKING` | **PARIDAD TÉCNICA** |
| **Múltiples Cajas** | `CONFIRMED_WORKING` | `NOT_IMPLEMENTED` (Una sola) | **GAP** |
| **Historial Permanente de Turnos**| `CONFIRMED_WORKING` | `BROKEN` (BUG-018: reseteo a []) | **GAP CRÍTICO** |
| **Arqueo Ciego** | `CONFIRMED_WORKING` (Oculta según sistema)| `NOT_IMPLEMENTED` (Muestra esperado) | **GAP** |
| **Cuentas Corrientes (Fiado)** | `CONFIRMED_WORKING` (Clientes y Proveedores)| `NOT_IMPLEMENTED` | **GAP** |
| **Facturación Electrónica AFIP**| `CONFIRMED_WORKING` (CAE, Factura A/B/C) | `NOT_IMPLEMENTED` | **GAP LEGAL CRÍTICO** |
