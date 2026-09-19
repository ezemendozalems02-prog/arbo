# ARBO OS — PRE-PHASE 9 CHECKPOINT
## 28. RIESGOS CONOCIDOS & MITIGACIONES

### 1. Matriz de Riesgos
1. **Riesgo de Consultas Pesadas en Reportes Históricos**:
   - *Impacto*: Lentitud en tableros analíticos ante años de datos acumulados.
   - *Mitigación*: Filtrado por ventanas de fecha y límites en consultas SQL indexadas.
2. **Riesgo de Sobre-Compra por Error de Datos**:
   - *Impacto*: Compra excesiva de un insumo si el encargado ingresó un factor de empaque erróneo.
   - *Mitigación*: El sistema genera **sugerencias** que requieren confirmación y revisión explícita del encargado antes de mutar a orden de compra.
