# 05 — EL MVP REAL OPERATIVO DE ARBO OS

---

## 1. PRINCIPIO RECTOR DEL MVP

> **"El MVP no es el prototipo que tenemos hoy en memoria, ni tampoco un producto sobrecargado de promesas. El MVP de ARBO OS es el conjunto estrictamente mínimo de capacidades transaccionales y operativas que permite a un restaurante abrir sus puertas, despachar comandas, cobrar sin errores, descontar sus materias primas y cerrar la caja con control real."**

Cualquier funcionalidad que no impida directamente la apertura, el despacho, el cobro o el control básico de inventario queda explícitamente fuera del MVP y se delega a V1 o fases posteriores.

---

## 2. MATRIZ DE PRIORIZACIÓN DEL MVP

```
┌────────────────────────────────────────────────────────────────────────┐
│                          MATRIZ DE ALCANCE MVP                         │
├──────────────────────────────────┬─────────────────────────────────────┤
│ 1. MUST HAVE PARA OPERAR         │ 2. NECESARIO PARA COBRAR            │
│    (Salón, Mostrador, KDS)       │    (Caja, Arqueo, Medios de Pago)   │
├──────────────────────────────────┼─────────────────────────────────────┤
│ 3. NECESARIO PARA CONTROLAR      │ 4. PUEDE ESPERAR                    │
│    (Stock por Receta, Compras)   │    (Campañas, ML, Multi-sucursal)   │
└──────────────────────────────────┴─────────────────────────────────────┘
```

---

## 3. DESGLOSE DETALLADO DE CAPACIDADES

### 3.1. MUST HAVE PARA OPERAR (El flujo físico y de cocina)
Sin esto, el restaurante simplemente no puede trabajar durante el servicio:
- **Autenticación y Roles Básicos:** Login seguro para Cajero, Mozo, Cocinero y Administrador (`[FACT: ARBO hoy carece de auth en /admin]`).
- **POS de Mostrador/Takeaway:** Carga rápida de productos con variantes (tamaño, tipo de leche, agregados) y notas especiales (`[FACT: src/pages/POS.jsx]`).
- **Gestión de Salón (Mesas):** Plano interactivo con mesas, estados (Libre, Ocupada, Por cobrar), apertura de mesa y adición de ítems (`[FACT: src/pages/FloorPlan.jsx]`).
- **Comanda y KDS en Tiempo Real:** 
  - Envío automático de comandas a pantalla de cocina o impresora de comandas.
  - Partición por estaciones (Barra / Cocina) (`[FACT: src/services/kitchenService.js]`).
  - Sincronización atómica: la anulación en KDS notifica al POS (resolución de BUG-003) y el cobro en POS archiva el ticket de cocina (resolución de BUG-004) (`[FACT]`).

### 3.2. NECESARIO PARA COBRAR (La integridad del dinero)
Sin esto, el restaurante pierde dinero o no puede conciliar sus ingresos:
- **Cierre y Apertura de Turnos de Caja:** Registro obligatorio de fondo inicial de caja (`[FACT: src/services/cashCalculations.js]`).
- **Cobro Multi-medio:** Efectivo, MercadoPago (QR / Link / manual), Tarjetas de débito/crédito.
- **División de Cuentas:** Capacidad de dividir un ticket entre varios comensales de una mesa.
- **Arqueo Ciego de Cierre:** El cajero declara lo contado y el sistema contrasta contra el saldo teórico del sistema emitiendo el reporte de sobrante/faltante (`[FACT: src/pages/Caja.jsx]`).
- **Persistencia Inmutable de Movimientos:** Resolución de BUG-018; los movimientos de caja nunca se borran al reabrir o editar un turno (`[FACT]`).
- **Comprobante de Venta:** Impresión o visualización de comanda de pago / ticket interno.

### 3.3. NECESARIO PARA CONTROLAR EL NEGOCIO (La rentabilidad)
Sin esto, el dueño no sabe si gana o pierde plata:
- **Explosión de Recetas en la Venta:** Al cobrar un producto terminado, se descuentan automáticamente del stock los insumos configurados en su ficha técnica (`[FACT: P0-GAP-02 a resolver en base de datos]`).
- **Registro de Compras de Insumos:** Ingreso de facturas de proveedores actualizando el stock y el Precio Promedio Ponderado (PPP) (`[FACT: src/services/purchaseService.js]`).
- **Ajustes Manuales de Inventario:** Para registrar mermas operativas, roturas o conteos físicos con justificación obligatoria (`[FACT: src/pages/Inventory.jsx]`).
- **Reporte Básico de Ventas y Food Cost Diario:** Ventas brutas, descuentos, costo de mercadería vendida (CMV teórico) y margen bruto diario.

### 3.4. PUEDE ESPERAR (Explícitamente postergado para V1 o Fase 2)
Funcionalidades atractivas pero que NO impiden que el restaurante opere su servicio inicial:
- **ARBO Club / Puntos / Niveles:** Desacoplado del MVP operativo puro. Se introduce en V1 una vez estabilizado el flujo transaccional (`[RECOMMENDATION]`).
- **Motor de Campañas y Automatización WhatsApp/Email:** No crítico para abrir y despachar comida.
- **Sugerencias Automáticas de Compra y Predicción:** La compra manual con reporte de stock bajo es suficiente en MVP.
- **Multi-sucursal y Transferencias entre Depósitos:** El MVP apunta a un solo local con uno o dos depósitos internos.
- **Facturación Electrónica AFIP/ARCA Automática:** Puede operar en fase piloto con controlador fiscal externo o comprobante X si la regulación local/piloto lo permite (`[DECISION REQUIRED]`).
- **Tienda Pública Web / Delivery Online Propio:** Aunque el frontend ya existe, no es bloqueante para operar el local físico; se lanza inmediatamente en V1 tras asegurar el salón/mostrador.

---

## 4. CRITERIO DE ACEPTACIÓN DEL MVP

El MVP se considerará completo y listo para operar en un piloto real cuando y solo cuando:
1. Una comanda cargada en POS/Mesa aparezca instantáneamente en KDS.
2. El cobro en caja registre el pago en el turno activo sin permitir adulteraciones.
3. El stock de cada ingrediente involucrado en la comanda se descuente en base de datos de forma atómica.
4. El cierre de caja emita un arqueo con cálculo exacto de sobrantes y faltantes.
5. Todo ocurra sobre una base de datos segura y multi-usuario (sin depender de `localStorage` ni bundles públicos sin login).
