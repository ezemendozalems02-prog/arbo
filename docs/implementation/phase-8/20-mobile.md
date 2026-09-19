# ARBO OS — Fase 8: Adaptabilidad Móvil & Responsive

### 1. Operación en Depósito y Salón
La operativa de depósitos (recuento, despacho de remito y recepción de mercadería) se ejecuta frecuentemente desde teléfonos móviles o tablets en bodega:
- Diseño `CSS Grid` y `Flexbox` que se colapsa en una sola columna en pantallas angostas (`minmax(320px, 1fr)`).
- Modales con `maxHeight: 90vh` y scroll vertical interno para prevenir desbordes de viewport.
- Botones de acción táctiles de tamaño generoso (mínimo 44px de alto) para confirmación de recepción y despacho.
- Tablas con `overflowX: auto` que previenen el desborde horizontal de la vista en smartphones.
