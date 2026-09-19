# ARBO OS — POST-PHASE 7 CHECKPOINT
## 17. DEFINICIÓN, ALCANCE Y LÍMITES DE FASE 8

---

## 1. IDENTIFICACIÓN OFICIAL DE FASE 8

- **FASE 8 NAME**: **Escala Multi-Sucursal & Depósitos**
- **OBJETIVO PRIMARIO**:
  Habilitar la operación distribuida de ARBO para redes de sucursales (ej. Trevelin, Esquel, Depósito Central de Tostaduría), permitiendo transferencias formales de insumos y mercadería entre depósitos con trazabilidad de despacho/recepción, catálogo centralizado y consolidación de métricas directivas.

---

## 2. ALCANCE (SCOPE OFICIAL DE FASE 8)
1. **Entidad Depósitos (`warehouses` / `storage_locations`)**:
   - Modelado de depósitos por sucursal (ej. "Depósito Central", "Barra Salón", "Cámara Fría").
2. **Transferencias de Stock (`stock_transfers` & `stock_transfer_items`)**:
   - Ciclo de vida estricto: `DRAFT` $\rightarrow$ `DISPATCHED` $\rightarrow$ `RECEIVED` (o `CANCELLED`).
   - Movimientos atómicos de inventario: `TRANSFER_OUT` en origen y `TRANSFER_IN` en destino.
3. **Mantenimiento del Costeo PPP en Transferencias**:
   - Traslado del costo unitario del insumo despachado y recalculo ponderado en el inventario del depósito receptor.
4. **Catálogo Centralizado con Anulación Local**:
   - Definición de recetas maestras en la organización con flags de disponibilidad por sucursal.
5. **Panel Directivo Consolidado (Executive Multi-Branch Dashboard)**:
   - Vista agregada de ventas, food cost consolidado y volumen de stock en tránsito.

---

## 3. LÍMITES ESTRICTOS (NON-SCOPE DE FASE 8)
- NO convertir ARBO en una plataforma de logística portuaria o aduanera.
- NO crear un ERP multi-empresa genérico.
- NO implementar white-labeling para terceros.
- NO desvirtuar el foco: ARBO Patagonia (Café, Vino y Gastronomía).

---

## 4. CRITERIOS DE ÉXITO DE FASE 8
- Creación y despacho de un remito de transferencia de 10 kg de café desde el Depósito Central de Trevelin hacia la Sucursal Esquel.
- Verificación de que el stock en origen se decrementa en tránsito y solo impacta en el stock disponible de Esquel cuando el encargado presiona "Confirmar Recepción".
- Mantenimiento ininterrumpido de las 236 pruebas existentes.
