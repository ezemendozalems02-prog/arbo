# ARBO OS — PRE-PHASE 8 CHECKPOINT
## 24. DECISIONES DE NEGOCIO Y POLÍTICAS OPERATIVAS (HUMAN DECISIONS)

---

## 1. INVENTARIO DE DECISIONES REQUERIDAS

| Decisión | Pregunta Central | Propuesta Técnica por Defecto | Estado |
| :--- | :--- | :--- | :---: |
| **D1: Discrepancias en Recepción** | ¿Qué ocurre si la sucursal recibe menos cantidad de la que despachó el depósito central? | Acreditar la cantidad real recibida a stock disponible e imputar el faltante como merma de transporte (`movement_type = 'WASTE'`). | **DECISION REQUIRED** |
| **D2: Política de Precios de Carta** | ¿Todas las sucursales deben tener el mismo precio de carta corporativo o se permiten precios diferenciados por local? | Precios centralizados uniformes por defecto, permitiendo overrides solo con autorización explícita de Gerencia. | **DECISION REQUIRED** |
| **D3: Aprobación Previa de Despacho** | ¿Las transferencias requieren un paso previo de solicitud y aprobación (`REQUESTED` $\rightarrow$ `APPROVED`) o pueden despacharse directamente? | Soportar despacho directo para agilidad operativa, permitiendo flujo de solicitud cuando la cadena crezca. | **DECISION REQUIRED** |
| **D4: Modelado del Depósito Central** | ¿El depósito central es una sucursal dedicada de tipo "Centro Logístico" o un depósito sin sucursal? | Sucursal dedicada (`branch_id NOT NULL`) para no romper la integridad relacional de `inventory_movements`. | **APROBADO ARQUITECTURA** |
