# ARBO OS — PRE-PHASE 9 CHECKPOINT
## 25. MATRIZ DE MODOS DE FALLO (FAILURE MODES)

| Escenario | Comportamiento Esperado | Impacto en Datos | Impacto en Usuario | Recuperación |
| :--- | :--- | :--- | :--- | :--- |
| **Insumo sin factor de empaque configurado** | Utiliza factor por defecto = 1.0 (unidad base) | Ninguno | Sugiere cantidad exacta sin bulto | Configurar factor en maestro de insumos |
| **Plato sin costo de insumos (receta vacía)** | Alerta omite cálculo de Food Cost y muestra aviso "Receta incompleta" | Ninguno | Aviso visual en amarillo | Cargar ingredientes de la receta |
| **Período de ventas sin registros** | Reporte muestra empty state ordenado con total $0 | Cero mutación | Pantalla informativa limpia | Seleccionar rango con ventas |
| **Doble click al convertir sugerencia en compra** | Idempotencia atómica: una sola compra creada | Cero duplicación | Feedback inmediato de éxito | Estado pasa a ORDERED |
