# ARBO OS — PRE-PHASE 8 CHECKPOINT
## 10. ALCANCE DE RECETAS, FICHAS TÉCNICAS Y CONSUMO LOCAL

---

## 1. PREVENCIÓN DE FUGAS O CONSUMOS CRUZADOS
Un riesgo crítico en sistemas gastronómicos multi-sucursal es que una venta en un local descuente inventario de otro local por falta de filtrado estricto:
- **Regla Inquebrantable**:
  Una comanda o venta en **Trevelin** debe descontar materias primas **ÚNICA Y EXCLUSIVAMENTE** de los depósitos asignados a Trevelin.
  Jamás una orden en Trevelin puede decrementar café del stock de Esquel ni de la Tostaduría Central.

---

## 2. MECANISMO DE RESOLUCIÓN DE DEPÓSITO PARA EXPLOSIÓN
Al momento de ejecutar la explosión de recetas en una venta:
1. El sistema identifica la sucursal de la venta (`branch_id`).
2. Se selecciona el depósito predeterminado de la sucursal (`is_default = true`) o el depósito asociado a la estación de producción (ej. Barra $\rightarrow$ Depósito Barra; Cocina $\rightarrow$ Depósito Cocina).
3. La verificación de stock suficiente (`availableStock >= requiredQty`) se evalúa estrictamente contra el depósito seleccionado.
4. Si el stock en el depósito local es insuficiente, el POS bloquea la venta o alerta al cajero, sin intentar descontar automáticamente de otra sucursal.
