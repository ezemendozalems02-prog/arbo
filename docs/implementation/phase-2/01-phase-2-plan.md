# FASE 2 — PLAN DE IMPLEMENTACIÓN
## CATÁLOGO, FICHAS TÉCNICAS & STOCK INICIAL

---

### METADATOS
- **Fase:** Fase 2 — Catálogo, Ingredientes, Recetas, Stock Inicial y Costeo PPP
- **Documento:** `docs/implementation/phase-2/01-phase-2-plan.md`
- **Fecha:** 19 de Septiembre de 2026
- **Estado:** PLAN TÉCNICO APROBADO
- **Fuentes Vinculantes:**
  - `docs/architecture/IMPLEMENTATION-GATE.md`
  - `docs/architecture/FINAL-ARBO-OS-ARCHITECTURE-REVIEW.md`
  - `docs/implementation/FINAL-PHASE-1-REPORT.md`

---

## 1. OBJETIVO ESTRICTO DE LA FASE 2

Construir la capa de catálogo e inventario relacional persistente que servirá como base transaccional para la futura venta y descarga de recetas en el POS:
1. **Modelo de Datos Relacional:** Crear tablas PostgreSQL para categorías, productos, ingredientes, recetas, ítems de receta y movimientos de inventario.
2. **Multi-Tenancy y RLS:** Proteger el 100% de las nuevas tablas con políticas Row Level Security (RLS) que hereden el aislamiento de organización de la Fase 1.
3. **Conversión y Normalización de Unidades:** Garantizar que masa (`kg`, `g`) y volumen (`l`, `ml`) se conviertan con precisión matemática de 4 decimales (`NUMERIC(12,4)`), evitando redondeos silenciosos.
4. **Fichas Técnicas & Costeo de Recetas:** Relacionar productos con ingredientes y calcular en base de datos y servicios de dominio el costo unitario por porción y el Food Cost % respecto al precio de venta.
5. **Cálculo de Precio Promedio Ponderado (PPP):** Implementar la fórmula formal de costeo ponderado ante ingresos de inventario.
6. **Stock Basado en Movimientos (Append-Only):** Establecer el stock inicial y registrar egresos mediante la tabla inmutable `inventory_movements`, verificando que el saldo sea la sumatoria histórica de deltas.
7. **Validación del Escenario de Referencia:** Validar el caso `Espresso Doble`:
   - Insumo: Café Grano ($15.000/kg), Stock inicial: 5.000 kg.
   - Receta: 18g de Café Grano.
   - Costo unitario esperado: $270 ARS.
   - Precio de venta: $3.500 ARS.
   - Food Cost % esperado: 7.71%.
   - Saldo tras consumo de 1 porción: 4.982 kg.

---

## 2. INVENTARIO DE CÓDIGO Y DECISIONES DE DISEÑO

### 2.1. Tablas a Crear en PostgreSQL
- `categories`: agrupador de menú del tenant (`organization_id`).
- `products`: producto final de venta con precio base (`NUMERIC(12,2)`).
- `ingredients`: insumo base con unidad normalizada (`kg`, `g`, `l`, `ml`, `u`) y costo unitario actual PPP (`NUMERIC(12,4)`).
- `recipes`: cabecera de ficha técnica vinculada a un producto (`yield_portions`, `waste_percentage`).
- `recipe_items`: renglón de ingrediente con dosis y unidad requerida.
- `inventory_movements`: libro mayor inmutable de variaciones de stock (`INITIAL_STOCK`, `PURCHASE`, `ADJUSTMENT`, `SALE_DEPLETION`, `WASTE`).

### 2.2. Servicios de Dominio en TypeScript/JavaScript
- `src/services/domain/unitConversion.js`: conversión pura y exacta entre unidades de la misma dimensión física.
- `src/services/domain/recipeCalculator.js`: cálculo de costo de recetas, factor de merma y Food Cost %.
- `src/services/domain/inventoryCosting.js`: cálculo determinístico de PPP y agregación de stock actual a partir de movimientos.

---

## 3. PASOS DE EJECUCIÓN

1. Crear la migración SQL `supabase/migrations/20260919000002_catalog_recipes_inventory.sql`.
2. Actualizar `supabase/seed.sql` con el escenario base de café y recetas.
3. Implementar la capa de servicios de dominio puro para conversiones, costeo y PPP.
4. Crear suite de pruebas de validación `scripts/validate_phase2_catalog_inventory.js`.
5. Ejecutar y validar que todas las pruebas pasen al 100%.
6. Verificar que la compilación `npm run build` continúe limpia.
7. Documentar los resultados y límites de la fase en `docs/implementation/phase-2/`.
