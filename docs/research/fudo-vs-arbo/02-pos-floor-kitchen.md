# 02 — POS, Salón, Mesas, Comandas y Cocina (KDS)

**Categorías cubiertas:**
4. Punto de Venta (POS)
5. Salón y Operación de Mozos
6. Gestión de Mesas
7. Comandas y Adiciones
8. Sistema de Cocina (KDS)

---

## 4. Punto de Venta (POS)

### FUDO
- **Qué hace:** Sistema POS transaccional web para mostrador y salón.
- **Qué fue documentado (`DOCUMENTED` en Fase 3 y art. 11712764):**
  - **Operación 100% por teclado:** El cajero/operador puede abrir mesas, adicionar ítems, aplicar descuentos, cerrar ventas y calcular vueltos sin utilizar el mouse mediante atajos directos (`CTRL + C`, Enter, flechas, foco en buscador por 2 caracteres o código numérico).
  - **Confirmación en dos fases:**
    - Fase 1 (Pendiente / Anaranjado): Mutable, permite cambiar cantidad, precio o borrar sin dejar rastro.
    - Fase 2 (Confirmado): Inmutable, dispara impresión/KDS y descuento de stock. Cualquier anulación posterior exige motivo obligatorio y queda registrada tachada en gris para auditoría.
  - Pagos combinados múltiples (efectivo + tarjeta + transferencia en una misma orden).
- **Limitaciones:** Interfaz web visualmente densa y utilitaria (estilo sistema legacy). No es personalizable estéticamente.
- **Bugs conocidos:** En mesas concurrentes, dos mozos adicionando al mismo tiempo pueden generar colisiones de estado en el refresco.
- **Estado:** `CONFIRMED_WORKING`.

### ARBO OS
- **Qué hace:** Interfaz de POS en React 19 (`/admin/pos`) con catálogo visual de 35 productos agrupados en 12 categorías.
- **Qué fue observado (`OBSERVED` en `04-pos.md`):**
  - Grilla de productos, steppers de cantidad, selección de modificadores con alteración de precio, cálculo defensivo de descuentos (`calcDiscountAmount`) y vuelto en efectivo exacto.
  - **BUG-007 (P1 · Roto en mobile/tablet):** La grilla hardcodea `gridTemplateColumns: 'minmax(0, 1fr) 340px'`. En pantallas de 390 px el catálogo mide 0 px; en iPad vertical (768 px) mide 84 px, impidiendo el uso en tablets de mozo (Evidencia: `evidence/07-pos-mobile-390.png`).
  - **BUG-003 (P1 · Defecto de dinero):** Cancelar una comanda desde la cocina no resetea `sentQty` en el POS. La línea continúa facturándose, los botones de restar/eliminar quedan deshabilitados y el cajero está forzado a cobrar un ítem cancelado.
  - No existe atajo de teclado ni soporte para lector de código de barras.
- **Estado:** `PARTIAL` (Funciona en monitores de escritorio anchos; inutilizable en tablets y con bug crítico de dinero).

### DIFERENCIA COMPROBADA
FUDO ofrece un POS de alta velocidad operable íntegramente por teclado con confirmación en dos fases y auditoría de cancelaciones. ARBO OS ofrece un POS visual moderno basado en mouse/touch que falla en tablets y retiene ítems cancelados en el saldo a pagar.

### IMPLICACIÓN
El POS de ARBO OS requiere resolver de inmediato la grilla responsive para tablets y desvincular las cantidades canceladas del subtotal a cobrar.

---

## 5 & 6. Salón y Gestión de Mesas

### FUDO
- **Qué hace:** Editor visual de plano de salas y mesas en cuadrícula arrastrable (`drag & drop`).
- **Qué fue documentado (`DOCUMENTED` en Fase 4 y art. 11730672):**
  - Múltiples salas con asignación independiente de caja e impresora por sector.
  - Mesas con número, estado visual en colores (libre, ocupada, precuenta impresa), comensales, camarero asignado y notas operativas (ej. *"celíaco"*).
  - Operaciones avanzadas: Cambio de mesa (mover comensales), unión de mesas y transferencia de ítems entre órdenes.
  - **Cobro comercial agresivo:** El módulo de Mesas es un add-on de pago sobre el plan básico; las "Ventas por comensal" exigen un segundo add-on adicional; y las reservas exigen contratar un módulo de IA ($55.000/mes).
- **Limitaciones:** Vocabulario visual rígido (sólo mesas cuadradas o circulares de 2 tamaños; no hay barras ni áreas de espera). Borrar una mesa desvincula las ventas históricas dejándolas huérfanas (`art. 11730986`).
- **Estado:** `CONFIRMED_WORKING`.

### ARBO OS
- **Qué hace:** Visualizador de 14 mesas semilla (`mock/tables.js`) agrupadas en 3 zonas predefinidas (`interior`, `ventana`, `exterior`).
- **Qué fue observado (`OBSERVED` en `05-tables-orders.md`):**
  - Apertura de mesa modal con selector de comensales y vínculo bidireccional hacia la orden del POS.
  - **Gaps Críticos (`NOT_IMPLEMENTED`):**
    - No existe cambio de mesa (si un cliente pasa de adentro al patio, no se puede mover la orden).
    - No existe unión de mesas para grupos grandes.
    - No existe transferencia de platos entre mesas.
    - No hay editor de plano arrastrable: las mesas son fijas en código.
  - **División de cuentas (`UI_ONLY`):** `SplitBillModal.jsx` es una calculadora visual que divide el total por $N$ personas. No divide por ítem consumido ni emite pagos separados.
- **Estado:** `PARTIAL`.

### DIFERENCIA COMPROBADA
FUDO permite unir mesas, cambiar de mesa, dividir cuentas por comensal y diseñar el plano arrastrando elementos. ARBO OS cuenta con una cuadrícula estática sin soporte para movimientos de comensales ni división transaccional de pagos.

### IMPLICACIÓN
Un restaurante real con ARBO OS colapsaría operativamente ante el primer grupo que solicite juntar dos mesas o pagar consumos por separado.

---

## 7 & 8. Comandas y Sistema de Cocina (KDS)

### FUDO
- **Qué hace:** Monitor de Cocina digital (KDS) en tiempo real complementado con ruteo de impresión a comanderas térmicas físicas (ESC/POS).
- **Qué fue documentado (`DOCUMENTED` en Fase 5 y art. 11730998):**
  - Despacho automático de comanda al confirmar venta en salón, mostrador o delivery.
  - Tiempos de preparación estimados configurables por producto y por categoría.
  - Marcado automático de estado "Demorado" según tiempo transcurrido con alertas sonoras.
  - Admisión explícita en su propia documentación: *"De todas formas, necesitarás una impresora para emitir los tickets de precuenta"* (reconocimiento de la necesidad física del papel en gastronomía).
- **Limitaciones:** El ruteo por estaciones (cocina caliente vs barra) se basa en filtros manuales en cada pantalla y no en una asignación estructural de destino garantizada.
- **Estado:** `CONFIRMED_WORKING`.

### ARBO OS
- **Qué hace:** Pantalla KDS dedicada en `/admin/cocina` y bandeja de comandas en `/admin/comandas`.
- **Qué fue observado (`OBSERVED` en `06-kds.md`):**
  - Ruteo estructural limpio en código (`kitchenService.js`): cada producto declara su estación (`cocina`, `bar`, `frio`) y `buildTicketsFromOrder` parte automáticamente la orden en tickets `#Mesa-A`, `#Mesa-B`.
  - Cronómetro individual por comanda con semáforo de colores: Normal (<6 min), Demorado (>6 min), Crítico (>12 min).
  - Transiciones de estado: `SENT` → `IN_PREP` → `READY` o `CANCELLED`.
  - **BUG-004 (P1 · Comandas Huérfanas):** Al cobrar y liberar una mesa en el POS, `confirmSale` elimina la orden pero **no cierra las comandas en cocina**. En el KDS, la comanda continúa en pantalla con el reloj corriendo indefinidamente para una mesa ya desocupada (Evidencia: `evidence/05-bug-comanda-huerfana-tras-cobro.png`).
  - **Inexistencia de Salida Térmica (`NOT_IMPLEMENTED`):** Cero soporte para impresoras físicas térmicas.
- **Estado:** `PARTIAL`.

---

## Síntesis Clasificatoria

| Categoría | Clasificación FUDO | Clasificación ARBO OS | Tipo de Brecha |
|---|---|---|---|
| **POS (Velocidad/Teclado)** | `CONFIRMED_WORKING` (Atajos totales) | `NOT_IMPLEMENTED` (Solo mouse) | **GAP** |
| **POS (Confirmación 2 fases)**| `CONFIRMED_WORKING` (Buffer + Auditoría) | `PARTIAL` (Envío inmediato) | **DIFERENCIA DE IMPLEMENTACIÓN** |
| **Plano de Mesas** | `CONFIRMED_WORKING` (Editor visual) | `PARTIAL` (Grilla estática) | **GAP** |
| **Operación Salón (Unir/Mover)**| `CONFIRMED_WORKING` | `NOT_IMPLEMENTED` | **GAP CRÍTICO** |
| **División de Cuenta** | `CONFIRMED_WORKING` (Cobro parcial) | `UI_ONLY` (Calculadora) | **GAP** |
| **Ruteo KDS a Estaciones** | `PARTIAL` (Filtros en pantalla) | `CONFIRMED_WORKING` (Estructural) | **OPORTUNIDAD ARBO** |
| **Sincronización POS ↔ KDS** | `CONFIRMED_WORKING` | `BROKEN` (BUG-003, BUG-004) | **GAP CRÍTICO** |
| **Impresión de Comandas** | `CONFIRMED_WORKING` (ESC/POS nativo)| `NOT_IMPLEMENTED` | **GAP** |
