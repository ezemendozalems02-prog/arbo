# ARBO OS — PRE-PHASE 9 CHECKPOINT
## 14. AUDITABILIDAD

### 1. Eventos Sensibles de Fase 9
Se registrarán en `audit_logs`:
1. `GENERATE_PURCHASE_SUGGESTIONS`: Registro del cálculo masivo de déficit por depósito.
2. `CONVERT_SUGGESTION_TO_PURCHASE`: Conversión de sugerencia a orden de compra con ID de compra generado.
3. `DISMISS_PURCHASE_SUGGESTION`: Rechazo explícito de sugerencia con motivo ingresado por el encargado.
4. `UPDATE_FOOD_COST_THRESHOLD`: Alteración de los umbrales de margen objetivo del restaurante.
