# 24 — Journeys Operativos de Punta a Punta (End-to-End)

Auditoría empírica de los 5 flujos operativos centrales ejecutados paso a paso en el entorno en vivo:

---

## Journey 1: El Ciclo de Mesa y Venta de Salón

**Paso a paso verificado:**
1. Navegar a `/admin/mesas` → Seleccionar **Mesa 1** (interior, capacidad 2).
2. Modal "Abrir Mesa 1" → 2 comensales → Clic en *"Abrir mesa"*.
   - *Resultado:* Mesa cambia a `ocupada`; crea orden vinculada; redirige a `/admin/pos?table=t1`.
3. En el POS: Agregar `Tostón de Palta ×1` ($6.800) y `Copa Malbec ×2` ($8.400).
4. Clic en *"Enviar comanda"* → Se generan comandas `#1-A` (Cocina) y `#1-B` (Bar).
5. En `/admin/cocina`: Ambas comandas aparecen en la columna "NUEVOS" con cronómetros activos.
6. Regreso a `/admin/pos?table=t1` → Clic en *"Cobrar"* → Efectivo $20.000.
7. Confirmar cobro → Vuelto calculado: $4.800.
8. La mesa se libera (`status: 'libre'`).

**Anomalías detectadas en este Journey:**
- **BUG-004:** La comanda `#1-A` continuó activa en la cocina con el cronómetro corriendo, rotulada para una mesa ya desocupada.
- **GAP:** Los 2 cafés y vinos vendidos **no descontaron ni un gramo de café ni un mililitro de vino del inventario**.
- **BUG-005:** El Dashboard principal continuó mostrando las ventas congeladas en $585.300.

---

## Journey 2: Cancelación en Cocina y Bloqueo en POS

**Paso a paso verificado:**
1. Crear comanda para Mesa 1 con `Copa Malbec ×2`.
2. Desde la pantalla KDS (`/admin/cocina`), el personal de barra cancela la comanda `#1-B` con motivo *"Producto sin stock"*.
3. El mozo regresa al POS para quitar la copa de vino de la cuenta.

**Anomalía crítica verificada (BUG-003):**
- El botón de eliminar desaparece.
- El botón de restar queda deshabilitado (`min={item.sentQty}`).
- La cuenta total retiene los $8.400 del producto cancelado.
- El sistema afirma *"✓ 2 ENVIADOS A COCINA"*, forzando al cajero a cobrarle al cliente una bebida que la cocina ya canceló.

---

## Journey 3: Ciclo Completo de Caja y Arqueo

**Paso a paso verificado (Evidencias `08-caja-cerrada.png` y `09-caja-cierre-modal.png`):**
1. Entrar a `/admin/caja` con caja cerrada.
2. Ingresar `$50.000` de fondo inicial → Clic en *"Abrir caja"*.
3. Registrar ingreso manual de `$10.000` (*"Cambio chico"*).
4. Registrar egreso manual de `$3.500` (*"Hielo de emergencia"*).
5. Efectivo esperado calculado: $\$50.000 + \$10.000 - \$3.500 = \$56.500$.
6. Abrir modal de cierre de caja → Ingresar `$56.000` como recuento real.
7. El sistema calcula en vivo: $\$56.000 - \$56.500 = -\$500$ (en rojo).
8. Confirmar cierre → La caja pasa a cerrada y muestra el último cierre.

**Anomalía crítica verificada (BUG-018):**
- Al volver a abrir la caja para el siguiente turno, el array de movimientos se inicializa en vacío (`movements: []`) destruyendo para siempre los registros del turno anterior.

---

## Journey 4: Alta de Cliente y Mostrador

**Paso a paso verificado (Evidencia `06-bug-cliente-crm-invisible-en-pos.png`):**
1. En `/admin/clientes`, dar de alta a "Zulema Auditoria".
2. La ficha se crea exitosamente en el CRM (`arbo_crm_v1`).
3. Ir al POS (`/admin/pos`) → Clic en *"+ Asociar cliente"* → Escribir "Zulema".

**Anomalía crítica verificada (BUG-006):**
- El buscador arroja *"Sin resultados para Zulema"*. El POS lee un archivo estático y desconoce la base de datos del CRM.

---

## Journey 5: Abastecimiento y Recepción de Mercadería

**Paso a paso verificado:**
1. Crear una orden de compra para carne vacuna: 2 cajas de 10 kg a $230.000 total.
2. Clic en *"Recibir compra"*.
3. El sistema convierte las 2 cajas a 20 kg de stock, actualiza el stock actual a $+20\text{ kg}$, recalcula el costo promedio ponderado ($11.500/kg) y emite un movimiento de tipo `entrada`.

**Anomalía detectada:**
- La compra se considera cerrada pero **la caja registradora no registra ningún egreso de fondos** ni existe orden de pago pendiente.
