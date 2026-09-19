# ARBO OS — PRE-PHASE 9 CHECKPOINT
## 21. CRITERIOS DE ÉXITO (SUCCESS CRITERIA)

La Fase 9 solo podrá declararse **COMPLETE** si:
1. [ ] El servicio `purchaseSuggestionService` calcula el déficit exacto considerando stock actual, transferencias en tránsito y factor de empaque sin margen de error.
2. [ ] Las alertas de `FOOD_COST_CRITICAL` se disparan de forma determinística ante recetas con costo > 35% y calculan el precio sugerido con fórmula exacta.
3. [ ] La Matriz de Ingeniería de Menú (Kasavana-Smith) clasifica correctamente los platos en Estrellas, Caballos de Batalla, Rompecabezas y Perros basándose en ventas reales.
4. [ ] Las rutas de reportes (`/admin/reportes/ventas`, `/admin/reportes/productos`, `/admin/reportes/clientes`) son 100% funcionales, con consultas conectadas al backend real.
5. [ ] El baseline de 266 pruebas de regresión se mantiene en 100% verde (266/266).
6. [ ] La suite de pruebas de Fase 9 agrega cobertura exhaustiva y pasa al 100%.
7. [ ] La compilación de producción (`npx vite build`) finaliza sin errores.
