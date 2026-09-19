# ARBO OS — PRE-PHASE 8 CHECKPOINT
## 23. CRITERIOS OBJETIVOS DE ACEPTACIÓN (SUCCESS CRITERIA)

---

## 1. CRITERIOS DETERMINISTAS DE ÉXITO

1. **Escenario de Transferencia Real**:
   - Se despachan 10,000 kg de café desde el Depósito Central de Trevelin hacia la Sucursal Esquel.
   - El stock disponible en Trevelin se reduce exactamente en 10,000 kg.
   - El remito queda en estado `DISPATCHED` con costo snapshot congelado ($10.000/kg).
   - El stock en Esquel NO se incrementa hasta que el encargado presiona "Confirmar Recepción".
   - Al confirmar recepción de 10,000 kg, el stock en Esquel se incrementa exactamente en 10,000 kg y su PPP se recalcula con la fórmula ponderada oficial.

2. **Aislamiento de Consumo de Salón**:
   - Una venta de 5 Espressos en Trevelin descuenta café exclusivamente del depósito local de Trevelin, dejando el stock de Esquel y de Tostaduría Central intacto.

3. **Prevención de Doble Recepción**:
   - Si dos peticiones simultáneas intentan recibir el mismo remito, exactamente UNA completa exitosamente y la otra es rechazada como NO-OP sin generar movimientos contables duplicados.

4. **Regresión Cero**:
   - El 100% de las 236 pruebas acumuladas de las Fases 1 a 7 continúa pasando sin fallos.
