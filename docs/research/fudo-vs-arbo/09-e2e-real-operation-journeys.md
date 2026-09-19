# 09 — Comparación de los 15 Flujos de Operación Real (End-to-End)

Auditoría comparativa paso a paso de los 15 circuitos gastronómicos esenciales que componen el día a día de un restaurante:

---

## Matriz de Estado Operativo por Flujo

| # | Flujo Operativo | Estado en FUDO | Estado en ARBO OS | Análisis de la Diferencia |
|---|---|---|---|---|
| **1** | **Crear producto** | `CONFIRMED_WORKING` | `NOT_IMPLEMENTED` | En FUDO se crean productos con precio, categoría y estación. En ARBO el catálogo es estático en código (`mock/products.js`). |
| **2** | **Crear receta** | `CONFIRMED_WORKING` | `CONFIRMED_WORKING` | Ambos permiten definir ingredientes y cantidades. FUDO soporta subrecetas recursivas; ARBO calcula costo en tiempo real con UI superior. |
| **3** | **Comprar insumo** | `CONFIRMED_WORKING` | `CONFIRMED_WORKING` | Ambos permiten emitir órdenes de compra a proveedores seleccionados. |
| **4** | **Recibir mercadería** | `CONFIRMED_WORKING` | `CONFIRMED_WORKING` | Ambos aumentan el stock físico y recalculan el costo promedio ponderado. FUDO actualiza saldo del proveedor; ARBO no impacta caja. |
| **5** | **Vender producto** | `CONFIRMED_WORKING` | `CONFIRMED_WORKING` | Ambos permiten adicionar productos a mesas o mostrador, aplicar descuentos y modificadores. |
| **6** | **Descontar stock** | `CONFIRMED_WORKING` | **`NOT_IMPLEMENTED`** | **Diferencia crítica:** FUDO descuenta insumos de la receta al confirmar la venta. ARBO **no descuenta stock en ventas** (`InventoryContext.jsx:18-22`). |
| **7** | **Cobrar** | `CONFIRMED_WORKING` | `PARTIAL` | Ambos calculan vuelto y admiten múltiples pagos. ARBO tiene **BUG-003** (retiene ítems cancelados en cocina como cobrables). |
| **8** | **Cerrar caja** | `CONFIRMED_WORKING` | `CONFIRMED_WORKING` | Ambos calculan el dinero teórico del turno y registran la hora de cierre. |
| **9** | **Arqueo de caja** | `CONFIRMED_WORKING` | `PARTIAL` | FUDO permite arqueo ciego y guarda el historial permanente. ARBO muestra el esperado antes de contar (BUG-019) y borra el historial al reabrir (BUG-018). |
| **10** | **Enviar pedido web** | `CONFIRMED_WORKING` | **`BROKEN`** | En FUDO el pedido entra al POS y cocina. En ARBO el checkout web **descarta los datos en memoria** y nadie en el local lo recibe (BUG-001). |
| **11** | **Gestionar reserva** | `CONFIRMED_WORKING` | **`BROKEN`** | En FUDO la reserva bloquea mesa en el plano. En ARBO la web confirma al cliente pero **descarta la reserva** y el admin está inactivo (BUG-002). |
| **12** | **Cocina / KDS** | `CONFIRMED_WORKING` | `PARTIAL` | Ambos muestran comandas con cronómetro. ARBO tiene **BUG-004** (comandas cobradas siguen huérfanas en cocina). FUDO soporta impresión térmica física. |
| **13** | **Cliente (CRM)** | `CONFIRMED_WORKING` | `PARTIAL` | FUDO asocia ventas a clientes para cuenta corriente. ARBO tiene fichas más completas pero **los clientes nuevos no son visibles en el POS** (BUG-006). |
| **14** | **Fidelización** | **`NOT_IMPLEMENTED`** | `PARTIAL` | FUDO no tiene programa de puntos nativo. ARBO tiene libro mayor contable y niveles, pero **los canjes no pueden aplicarse en el POS** (BUG-021). |
| **15** | **Reportes** | `CONFIRMED_WORKING` | `PARTIAL` | FUDO ofrece reportes consolidados y exportables. ARBO tiene métricas RFM/Costos excelentes pero el Dashboard ignora ventas reales (BUG-005). |

---

## Diagnóstico Detallado de los 15 Flujos

### Flujo 1: Crear Producto
- **FUDO:** Operación diaria de autoservicio en `Administración > Productos`. Permite definir nombre, precio, categoría, alícuota de IVA, código de barras y visibilidad en carta QR.
- **ARBO OS:** La ruta `/admin/productos` está marcada como `available: false` ("Próximamente"). Para agregar un producto hay que editar el archivo de código fuente `src/mock/products.js` y recompilar la aplicación.
- **Veredicto:** `GAP`.

### Flujo 2: Crear Receta (Ficha Técnica)
- **FUDO:** Editor en pantalla con selección de ingredientes, mermas de cocción y asignación de costo. Soporta subrecetas recursivas.
- **ARBO OS:** Interfaz en `/admin/recetas` con cálculo automático de costo unitario basado en el costo ponderado de los insumos.
- **Veredicto:** `CONFIRMED_WORKING` en ambos.

### Flujos 3 y 4: Comprar y Recibir Mercadería
- **FUDO:** Orden de compra que al recibirse incrementa el stock, recalcula el costo ponderado y actualiza la cuenta corriente del proveedor.
- **ARBO OS:** Circuito completo en `/admin/compras` con resolución dimensional de unidades (`unitsToStock`). Incrementa existencias y genera movimiento tipo `entrada`. Sin impacto en caja ni pasivo comercial.
- **Veredicto:** `PARIDAD TÉCNICA` en el almacén físico; FUDO superior en la integración financiera.

### Flujos 5, 6 y 7: Vender, Descontar Stock y Cobrar
- **FUDO:** El circuito opera de forma atómica: el mozo adiciona → confirma → la cocina recibe comanda → **el stock se descuenta en base de datos** → el cajero cobra → se emite factura fiscal y se libera la mesa.
- **ARBO OS:** El circuito sufre tres roturas encadenadas:
  1. La venta **no descuenta stock** (el stock permanece inmutable tras vender).
  2. Si una comanda se cancela en cocina, **el ítem sigue cobrándose en caja** (BUG-003).
  3. No se emite factura fiscal ni impresión física.
- **Veredicto:** `GAP CRÍTICO`.

### Flujos 8 y 9: Cierre y Arqueo de Caja
- **FUDO:** El cajero cuenta el dinero a ciegas (sin ver el valor teórico) y declara el recuento. El sistema calcula la diferencia, emite el reporte Z y archiva el turno para siempre en el historial de arqueos.
- **ARBO OS:** La pantalla muestra el dinero esperado antes del conteo (arqueo no ciego). Al ingresar el monto real, calcula la diferencia exactamente. Sin embargo, **al abrir el siguiente turno se borra todo el historial de movimientos anteriores** (BUG-018).
- **Veredicto:** FUDO apto para auditoría contable; ARBO no retiene trazabilidad histórica.

### Flujos 10 y 11: Pedidos Online y Reservas
- **FUDO:** Los pedidos entran a la bandeja de delivery y las reservas bloquean mesas en el salón (condicionado a pago de add-on de $55.000).
- **ARBO OS:** La web pública emite números de pedido y confirmaciones de reserva falsos, descartando los datos en memoria (BUG-001, BUG-002).
- **Veredicto:** `BROKEN` en ARBO OS; `CONFIRMED_WORKING` en FUDO.

### Flujo 12: Cocina (KDS)
- **FUDO:** Pantalla KDS en tiempo real con tiempos estimados por plato y desvío opcional a comanderas térmicas físicas.
- **ARBO OS:** KDS moderno con partición estructural de tickets (`cocina`, `bar`, `frio`), pero con **BUG-004** (las comandas cobradas en salón continúan huérfanas en el monitor con el cronómetro corriendo).
- **Veredicto:** `PARTIAL` en ARBO OS; `CONFIRMED_WORKING` en FUDO.

### Flujo 13: Clientes (CRM)
- **FUDO:** Clientes vinculados a delivery y cuenta corriente. Sin segmentación.
- **ARBO OS:** Fichas ricas con notas, tags y motor de segmentación dinámico, pero con **BUG-006** (clientes dados de alta en CRM no aparecen en el buscador del POS).
- **Veredicto:** ARBO tiene mejor modelo analítico; FUDO tiene mejor integración operativa.

### Flujo 14: Fidelización (Loyalty)
- **FUDO:** Inexistente de forma nativa (`NOT_IMPLEMENTED`).
- **ARBO OS:** Sistema completo con acumulación de puntos, 4 niveles y emisión de cupones, pero con **BUG-021** (los canjes no pueden cargarse en el POS).
- **Veredicto:** `OPORTUNIDAD NETA PARA ARBO OS`.

### Flujo 15: Reportes y Métricas
- **FUDO:** Reportes de ventas, productos más vendidos, ranking de camareros y estado de resultados (P&L) exportables a Excel.
- **ARBO OS:** Métricas analíticas modernas (RFM, Food Cost, CLV, Retención) con interfaces visuales superiores, pero con **BUG-005** (el Dashboard principal ignora las ventas del POS y permanece congelado en cifras mock).
- **Veredicto:** ARBO tiene mejor ingeniería analítica; FUDO tiene reportes conectados a transacciones reales.
