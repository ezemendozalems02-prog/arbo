# ARBO OS — PRE-ARBO CLUB CHECKPOINT: INTEGRIDAD DEL DOMINIO

---

## 1. REVISIÓN DE LA CADENA INTEGRADA (FASES 1 A 4)

Se verificó la consistencia estructural a lo largo de las 4 fases en producción:

$$\text{Organization} \rightarrow \text{Branch} \rightarrow \text{Catalog} \rightarrow \text{Recipes} \rightarrow \text{Inventory} \rightarrow \text{Sales} \rightarrow \text{Payments} \rightarrow \text{Cash} \rightarrow \text{Kitchen}$$

### Hallazgos de Integridad Relacional:
1. **Claves Foráneas (Foreign Keys):**
   - No se detectaron claves foráneas rotas ni referencias flotantes.
   - Las relaciones estructurales de pertenencia utilizan `ON DELETE CASCADE` hacia la organización o sucursal matriz.
   - Las relaciones operativas de preservación histórica (`products`, `ingredients`, `kitchen_stations`) utilizan `ON DELETE RESTRICT` o snapshots inmutables para impedir que la eliminación de un catálogo destruya la auditoría contable o de producción.
2. **Ausencia de Dependencias Circulares:**
   - La cadena es estrictamente jerárquica y acíclica.
3. **Fuente Única de Verdad en Libros Mayores:**
   - **Inventario:** Reside exclusivamente en `inventory_movements`. No existen columnas mutables de stock en `products` ni `ingredients`.
   - **Caja:** Reside en `cash_movements` vinculada a `cash_sessions`.
   - **Comandas:** Reside en `kitchen_tickets` y `kitchen_ticket_items`.
4. **Residuos de LocalStorage:**
   - Si bien el prototipo inicial utilizaba `localStorage` para simular estado fuera de línea, todo el dominio core (migraciones 1 a 4 y servicios de dominio puros) opera de manera independiente y determinista en PostgreSQL.
   - En la Fase 5, el cliente y sus puntos no dependerán de `localStorage`; se persistirán como entidades relacionales formales (`customers`, `loyalty_transactions`).
