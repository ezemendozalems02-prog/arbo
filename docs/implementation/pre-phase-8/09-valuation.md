# ARBO OS — PRE-PHASE 8 CHECKPOINT
## 09. VALORIZACIÓN DE INVENTARIO MULTI-DEPÓSITO

---

## 1. CÁLCULO DE VALORACIÓN POR DEPÓSITO Y SUCURSAL
La valoración total del activo de inventario se calcula a partir de los saldos agregados y sus respectivos costos ponderados:

$$\text{Valor Inventario}(\text{Depósito } W) = \sum_{i \in \text{Insumos}} \left( \text{Stock Actual}(W, i) \cdot \text{PPP}(W, i) \right)$$

### INDEPENDENCIA DE VALORIZACIÓN:
- $\text{Valor}(\text{Trevelin}) \neq \text{Valor}(\text{Esquel}) \neq \text{Valor}(\text{Depósito Central})$.
- La empresa puede auditar en tiempo real cuánto capital tiene inmovilizado en cada local físico.

---

## 2. IMPACTO DE OPERACIONES EN LA VALORIZACIÓN
1. **Compras (`PURCHASE`)**: Incrementa cantidad y actualiza el costo ponderado.
2. **Ventas (`SALE_DEPLETION`)**: Reduce el valor del inventario al costo PPP vigente, registrando el costo de mercadería vendida (CMV).
3. **Mermas (`WASTE`)**: Reduce el valor del inventario como pérdida operativa directa.
4. **Transferencias (`TRANSFER_OUT` / `TRANSFER_IN`)**:
   - `TRANSFER_OUT`: Reduce el activo del depósito origen.
   - `TRANSFER_IN`: Incrementa el activo del depósito destino.
   - **En Tránsito**: La mercadería no desaparece; se clasifica contablemente como "Activo en Tránsito".
