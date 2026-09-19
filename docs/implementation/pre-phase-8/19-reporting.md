# ARBO OS — PRE-PHASE 8 CHECKPOINT
## 19. NIVELES DE REPORTING & PREVENCIÓN DE DUPLICACIÓN

---

## 1. TRES NIVELES DE VISIBILIDAD DE REPORTES

1. **Nivel Depósito (Warehouse-Level)**:
   - Kardex de movimientos de insumos.
   - Detalle de mermas y ajustes físicos.
   - Destinado al encargado de depósito o jefe de barra.

2. **Nivel Sucursal (Branch-Level)**:
   - Ventas por canal (Salón, Mostrador, Takeaway).
   - Arqueos de caja de turno y diferencias de efectivo.
   - Food Cost local y rendimiento de recetas.
   - Destinado al Gerente de Sucursal.

3. **Nivel Organización (Organization-Level)**:
   - P&L consolidado estimado (Ventas menos CMV de insumos).
   - Eficiencia comparativa entre locales.
   - Balance global de activos en inventario.
   - Destinado a Dirección y Contabilidad.

---

## 2. EVITAR DUPLICACIÓN DE CÁLCULOS
Todos los reportes leen de las mismas fuentes primarias inmutables:
`sales`, `sale_items`, `cash_movements` e `inventory_movements`.
No se crearán tablas auxiliares desincronizadas de saldos acumulados.
