# ARBO OS — POST-PHASE 6 CHECKPOINT
## 05. VALIDACIÓN DE INVENTARIO, EXPLOSIÓN DE RECETAS & CONCURRENCIA

---

## 1. COMPORTAMIENTO VERIFICADO

- **Explosión de Recetas**:
  - Un pedido online de 1 Espresso Doble consume exactamente 18g de café en grano (`0.018 kg`).
  - Stock inicial: `5.000 kg` $\rightarrow$ Stock resultante tras checkout: `4.982 kg`.
- **Cálculo de Costo Real**:
  - Costo unitario auditado: `18g * $15/g = $270,00 ARS`.
  - Food Cost sobre precio de venta ($3.500): `7.71%`.

---

## 2. PROTECCIÓN CONTRA CONCURRENCIA & STOCK NEGATIVO

Se sometió el sistema a la prueba de contención de stock (Test 25 de Fase 6):
- Escenario: Quedan únicamente `0.007 kg` disponibles en la sucursal (insuficiente para 1 espresso de `0.018 kg`).
- Intento de checkout: El motor transaccional detecta `availableStock < requiredQty` y aborta inmediatamente con:
  ```
  INSUFFICIENT_STOCK: Stock insuficiente para Café Grano Especialidad (Disponible: 0.007 kg, Requerido: 0.018 kg)
  ```
- **Resultado**: El stock no sufre decrementos ficticios y jamás pasa a valores negativos.
