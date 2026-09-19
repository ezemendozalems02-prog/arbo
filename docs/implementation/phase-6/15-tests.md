# ARBO OS — FASE 6: MATRIZ DE TESTS & CERTIFICACIÓN DE REGRESIONES
## RESULTADOS DE VALIDACIÓN FASE 6

---

## 1. RESUMEN GLOBAL DE SUITES EJECUTADAS

| Fase | Archivo de Prueba | Pruebas | Resultado | Estado |
| :--- | :--- | :---: | :---: | :---: |
| **Fase 1** | `scripts/validate_rls_isolation.js` | 5 | 5 / 5 | **PASS** |
| **Fase 2** | `scripts/validate_phase2_catalog_inventory.js` | 20 | 20 / 20 | **PASS** |
| **Fase 3** | `scripts/validate_phase3_sales_cash_acid.js` | 38 | 38 / 38 | **PASS** |
| **Fase 4** | `scripts/validate_phase4_kds_realtime.js` | 34 | 34 / 34 | **PASS** |
| **Fase 5** | `scripts/validate_phase5_arbo_club_crm.js` | 63 | 63 / 63 | **PASS** |
| **Fase 6** | `scripts/validate_phase6_public_commerce.js` | 30 | 30 / 30 | **PASS** |
| **TOTAL ACUMULADO** | | **190** | **190 / 190** | **100% PASS** |

---

## 2. DETALLE DE LOS 30 TESTS ESPECÍFICOS DE FASE 6

1. `public catalog`: Proyección limpia del catálogo con 2 productos activos.
2. `public catalog hides cost`: Ocultamiento estricto de costos unitarios y PPP.
3. `public catalog hides recipes`: Ocultamiento de recetas, ingredientes e insumos.
4. `tenant isolation`: Catálogo de Org A no muestra productos de Org B.
5. `branch isolation`: Slug `trevelin` resuelve unívocamente la sucursal de Org A.
6. `secure tracking token`: Generación de token no enumerable `ord_sec_...` (>24 caracteres).
7. `guest checkout`: Registro de cliente sin contraseña con status `ACTIVE`.
8. `existing customer matching`: Teléfono normalizado vincula cliente existente sin duplicar.
9. `customer creation`: Persistencia verificada en el estado del tenant.
10. `duplicate phone handling`: Teléfono duplicado en la misma org no crea segundo cliente.
11. `price tampering`: Backend rechaza precio manipulado en cliente (`PRICE_TAMPERING_DETECTED`).
12. `unavailable product`: Producto con `is_available = false` es rechazado.
13. `invalid product`: Producto inexistente aborta la orden.
14. `invalid branch`: Sucursal ajena o inexistente es rechazada.
15. `invalid organization`: Intento de mezclar tenants es bloqueado (`TENANT_ESCAPE_DETECTED`).
16. `public order creation`: Orden creada con total $5.300 ($3.500 + $1.800) en estado `PENDING`.
17. `duplicate submit / idempotency`: Reenvío con misma clave retorna orden existente.
18. `public order items snapshots`: Congelamiento inmutable de nombres y precios unitarios.
19. `public order -> sale`: Conversión exitosa y vinculación a venta real con `status = CONFIRMED`.
20. `sale -> inventory`: Stock de café reducido en 0.018 kg (5.000 -> 4.982 kg).
21. `sale -> cash`: Caja incrementada en $5.300 ($10.000 -> $15.300).
22. `sale -> KDS`: Comanda emitida en KDS con etiqueta `[ONLINE TAKEAWAY]`.
23. `sale -> loyalty`: 53 puntos acreditados en ARBO Club ($\lfloor 5300 / 100 \rfloor = 53$).
24. `rollback`: Falla en confirmación aborta sin dejar ventas ni movimientos huérfanos.
25. `concurrent stock`: Stock insuficiente bloquea checkout previniendo stock negativo.
26. `duplicate loyalty`: Exactamente 1 transacción `EARN` en el libro mayor.
27. `tracking isolation`: Sincronización con estado KDS (`IN_PREPARATION`) y PII ofuscada.
28. `RLS`: Token de orden no enumerable previene ataques IDOR.
29. `mobile/public route`: Resolución de ruta `/store/trevelin` validada.
30. `production build`: Verificación integral de build sin errores.
