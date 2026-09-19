# ARBO OS — PRE-PHASE 8 CHECKPOINT
## 12. CATÁLOGO MAESTRO UNIFICADO (MASTER CATALOG)

---

## 1. PRINCIPIO DE NO DUPLICACIÓN
En una cadena con múltiples sucursales (Trevelin, Esquel, etc.), sería un grave error arquitectónico duplicar los productos y recetas:
- **Catálogo Maestro Corporativo**:
  - `products`: Define el nombre ("Espresso Doble"), descripción, categoría, alícuota de IVA y ficha técnica.
  - `recipes` y `recipe_items`: Definen la composición estándar (18g de Café de Especialidad).
  - Pertenecen a nivel `organization_id`.
  - Se definen una única vez por el chef corporativo o tostador principal.

---

## 2. SEPARACIÓN: ATRIBUTOS GLOBALES VS LOCALES

| Atributo del Catálogo | Alcance | Modificable por Sucursal |
| :--- | :---: | :---: |
| Nombre del Producto | **GLOBAL** | NO |
| Ficha Técnica / Receta | **GLOBAL** | NO |
| Alícuota de IVA | **GLOBAL** | NO |
| Unidad de Medida / Insumos | **GLOBAL** | NO |
| Disponibilidad en Carta (`is_available`) | **LOCAL** | SÍ |
| Precio de Venta (Opcional según política) | **LOCAL / OVERRIDE** | SÍ (si está habilitado) |
| Estación KDS asignada | **LOCAL** | SÍ |
