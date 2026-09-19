# ARBO OS — FASE 2: RESULTADOS DE PRUEBAS AUTOMATIZADAS

**Script de Validación:** `scripts/validate_phase2_catalog_inventory.js`  
**Fecha de Ejecución:** 2026-09-19  
**Resultado Global:** **20 PASADOS, 0 FALLADOS (100% SUCCESS)**

---

## REPORTE DETALLADO DE CASOS DE PRUEBA

```text
======================================================================
ARBO OS - SUITE DE VALIDACION FASE 2: CATALOGO, RECETAS Y STOCK
======================================================================

--- BLOQUE 1: UNIDADES Y CONVERSIONES ---
[PASS] Conversion g a kg exacta (18g = 0.018kg)
[PASS] Conversion ml a l exacta (500ml = 0.5l)
[PASS] Error en conversion incompatible (kg a ml)

--- BLOQUE 2: CATÁLOGO E INGREDIENTES ---
[PASS] Ingrediente Café Grano creado correctamente ($15000/kg)
[PASS] Producto Espresso Doble creado ($3500)
[PASS] Restricción: Precio negativo rechazado
[PASS] Restricción: Costo unitario negativo rechazado

--- BLOQUE 3: RECETAS Y EXPLOSIÓN ---
[PASS] Receta creada para Espresso Doble (1 porción)
[PASS] Item 18g Café Grano asociado a Receta
[PASS] Costo unitario exacto: $270 ARS
[PASS] Food Cost exacto: 7.71%
[PASS] Margen bruto exacto: $3230.00 (92.29%)
[PASS] Cálculo con factor de merma (10% waste -> 0.02kg -> $300)

--- BLOQUE 4: STOCK INICIAL Y MOVIMIENTOS ---
[PASS] Movimiento INITIAL_STOCK registrado (+5.000 kg)
[PASS] Stock actual calculado desde movimientos: 5.000 kg
[PASS] Explosión de receta para 1 porción genera -0.018 kg
[PASS] Balance tras venta de 1 Espresso Doble: exactamente 4.982 kg

--- BLOQUE 5: COSTEO PPP (PRECIO PROMEDIO PONDERADO) ---
[PASS] Nuevo PPP tras compra: 5kg@$15000 + 5kg@$18000 = $16500/kg
[PASS] Salida de stock no altera PPP unitario ($16500)

--- BLOQUE 6: AISLAMIENTO MULTI-TENANT (RLS) ---
[PASS] Organización B no puede ver productos de Organización A
[PASS] Cross-tenant recipe_item injection bloqueado

======================================================================
RESULTADO FASE 2: 20 PASADOS, 0 FALLADOS
CASO OBLIGATORIO VALIDADO:
  - Consumo 18g: 0.018 kg
  - Costo porción: $270.00 ARS
  - Food Cost: 7.71%
  - Stock inicial: 5.000 kg
  - Stock final: 4.982 kg
======================================================================
```
