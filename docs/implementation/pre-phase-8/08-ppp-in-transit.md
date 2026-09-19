# ARBO OS — PRE-PHASE 8 CHECKPOINT
## 08. PRECIO PROMEDIO PONDERADO (PPP) EN TRÁNSITO & TRASPASO DE COSTOS

---

## 1. POLÍTICA DE VALORIZACIÓN EN TRASLADO
Cuando se despacha una transferencia desde el Depósito Origen (ej. Tostaduría Central):
1. **Snapshot al Despacho**: Cada ítem congela en `unit_cost_snapshot` el valor exacto del PPP vigente del insumo en el origen al momento de presionar "Despachar".
2. **Invariabilidad en Tránsito**: Si durante el traslado terrestre (ej. Trevelin a Esquel) el costo del café en el origen cambia por una nueva compra, la mercadería en viaje mantiene inalterado su costo histórico snapshot.
3. **Ponderación al Recibir en Destino**:
   La sucursal destino aplica la fórmula oficial del dominio (`calculateWeightedAverageCost`):
   $$\text{PPP}_{\text{Destino Nuevo}} = \frac{(Q_{\text{Existente}} \cdot \text{PPP}_{\text{Destino Actual}}) + (Q_{\text{Recibida}} \cdot \text{Costo Snapshot})}{(Q_{\text{Existente}} + Q_{\text{Recibida}})}$$

---

## 2. DECISIONES DE NEGOCIO REQUERIDAS (DECISION REQUIRED)

> [!WARNING]
> ### DECISION REQUIRED 1: Tratamiento de Mermas / Faltantes en Recepción
> Si se despachan 10,000 kg pero la sucursal receptora constata y firma 9,800 kg:
> - **Opción A (Recomendada)**: La sucursal recibe 9,800 kg a stock disponible y los 0,200 kg faltantes se registran automáticamente como `movement_type = 'WASTE'` con motivo "Merma en transporte".
> - **Opción B**: Rechazo total de la transferencia hasta que origen corrija el remito.

> [!WARNING]
> ### DECISION REQUIRED 2: Gastos de Flete / Logística en Costeo
> ¿El flete o costo de transporte incrementa el costo unitario del insumo en la sucursal receptora o se imputa como gasto operativo general de la sucursal?
> - *Default propuesto*: Se imputa a cuenta de gasto general; el insumo mantiene su costo de materia prima pura para no distorsionar el Food Cost teórico entre sucursales.
