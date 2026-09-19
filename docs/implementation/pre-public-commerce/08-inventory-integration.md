# ARBO OS — PRE-PUBLIC COMMERCE CHECKPOINT
## 08. INTEGRACIÓN CON INVENTARIO & CONSUMO DE INSUMOS

---

## 1. PRINCIPIO DE SEGURIDAD INDUSTRIAL

La web pública **NUNCA** debe tener permisos para escribir directamente en la tabla `inventory_movements` ni conocer los componentes de las fichas técnicas.

### Frontera:
- La web pública únicamente solicita productos comerciales (ej. 2 Espresso Doble).
- El backend, en un entorno seguro y de confianza (`SECURITY DEFINER` o microservicio backend autenticado), consulta la tabla `recipes` de la organización.
- Se ejecuta la explosión de ingredientes validando unidades de medida (`g` a `kg`, `ml` a `L`) mediante `unitConversion.js`.
- Se genera el delta negativo correspondiente (`movement_type = 'SALE_DEPLETION'`).

---

## 2. DISPONIBILIDAD DE PRODUCTOS EN LA WEB (OUT OF STOCK)

Para evitar que un cliente web compre un producto cuyos insumos críticos están agotados en el local:
1. En Fase 6 se evaluará una bandera `is_available` en el catálogo público.
2. Si un ingrediente clave tiene stock cero o por debajo del umbral mínimo requerido para una porción, el catálogo público debe reflejar automáticamente el producto como `Agotado` o deshabilitar el botón de agregar.
3. Si a pesar de esto el cliente intenta confirmar un pedido en el milisegundo en que se agotó el insumo en mostrador, el checkout atómico abortará con `INSUFFICIENT_STOCK` garantizando que no se cree una venta ficticia.
