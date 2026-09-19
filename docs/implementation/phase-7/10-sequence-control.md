# ARBO OS — FASE 7: CAPA FISCAL ARGENTINA & AUTOMATIZACIONES
## 10. CONTROL DE CORRELATIVIDAD & PUNTOS DE VENTA

---

## 1. EXIGENCIA DE NUMERACIÓN CONTINUA SIN HUECOS
La legislación tributaria argentina exige que cada Punto de Venta mantenga una secuencia numérica ininterrumpida y cronológica por cada tipo de comprobante:
- Punto de Venta 1 + Factura B: `1, 2, 3, 4, ...`
- Punto de Venta 1 + Factura A: `1, 2, 3, ...`
- Punto de Venta 2 + Factura B: `1, 2, ...`

## 2. MECANISMO DE CONTROL DE CONCURRENCIA
Para evitar condiciones de carrera cuando dos cajeros o el sistema web emiten facturas simultáneamente:
1. **Constraint de Unicidad**: `uq_fiscal_invoice_correlative (organization_id, pos_number, invoice_type, invoice_number)`.
2. **Cálculo Transaccional**: El número siguiente se deriva de `max(invoice_number) + 1` bloqueando la fila de secuencia mediante `SELECT FOR UPDATE` o secuencias PostgreSQL dedicadas.
3. **Aislamiento por Sucursal/Punto de Venta**: Las secuencias de dos Puntos de Venta distintos son completamente independientes.
