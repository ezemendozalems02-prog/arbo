# ARBO OS — FASE 4: CICLO DE VIDA DE COMANDAS & MÁQUINA DE ESTADOS

---

## 1. MÁQUINA DE ESTADOS FORMAL

El ciclo de vida de una comanda en ARBO OS sigue un flujo unidireccional y predecible:

$$\text{NEW} \xrightarrow{\text{takeTicket}} \text{PREPARING} \xrightarrow{\text{readyTicket}} \text{READY} \xrightarrow{\text{archiveTicket}} \text{ARCHIVED}$$

Con vía de excepción:
$$\forall s \in \{\text{NEW}, \text{PREPARING}, \text{READY}\} \xrightarrow{\text{cancelTicket}} \text{CANCELLED}$$

| Estado | Significado Operativo | Timestamp Asociado | Estado en KDS |
| :--- | :--- | :--- | :--- |
| `NEW` | Comanda recién emitida por venta o mozo | `created_at` | Columna "Nuevos" (Alerta sonora/visual) |
| `PREPARING` | El cocinero/barista comenzó la elaboración | `started_at` | Columna "En Preparación" (Timer activo) |
| `READY` | Plato/bebida listo en el pase para despacho | `ready_at` | Columna "Listos" |
| `ARCHIVED` | Comanda retirada y entregada al comensal | `archived_at` | Oculta de pantalla activa, archivada |
| `CANCELLED` | Venta o plato cancelado por el usuario | `cancelled_at` | Tarjeta tachada con motivo y autor |

---

## 2. REGLA DE CREACIÓN DENTRO DE LA TRANSACCIÓN (DECISIÓN A vs B)

De conformidad con el análisis arquitectónico:
- Se adoptó la **Opción A (Generación Atómica en `execute_sale_checkout`)**.
- **Justificación:** Previene la anomalía crítica de "Venta cobrada sin comanda en cocina". Si la generación del ticket fallara por cualquier motivo, toda la venta se revierte en PostgreSQL sin dejar cobros huérfanos.
