# ARBO OS — PRE-PHASE 7 CHECKPOINT
## 03. DEFINICIÓN OFICIAL DE LA FASE 7

---

## 1. FUENTES DE AUTORIDAD

La definición de la Fase 7 se extrae directamente de:
- `docs/architecture/FINAL-ARBO-OS-ARCHITECTURE-REVIEW.md` (Línea 78 y Línea 268).
- `docs/architecture/15-fiscal-layer.md` (Arquitectura hexagonal y contingencia).
- `docs/architecture/13-automation.md` (Pipeline de automatizaciones).
- `docs/product-strategy/FINAL-ARBO-OS-PRODUCT-STRATEGY.md` (Pilar tributario argentino).

---

## 2. DENOMINACIÓN & OBJETIVO

### Nombre Oficial:
**FASE 7: CAPA FISCAL ARGENTINA & AUTOMATIZACIONES OPERATIVAS**  
*(AFIP / ARCA WSFE, RESILIENCIA ANTE CAÍDAS & WORKERS)*

### Objetivo Principal:
Dotar a ARBO OS de la capacidad de emitir comprobantes fiscales electrónicos oficiales para la República Argentina (**Facturas A, B, C, Notas de Crédito y Comprobantes X de control interno**) de forma totalmente desacoplada, con obtención de **CAE** (Código de Autorización Electrónico), cálculo y discriminación de alícuotas de IVA (21%, 10.5%, Exento), generación de código QR fiscal obligatorio de AFIP, protocolo de **contingencia asíncrona anti-caídas** para evitar demoras en el salón o mostrador, y un motor de **automatizaciones operativas basadas en eventos**.

---

## 3. PRINCIPIO DE DESACOPLAMIENTO HEXAGONAL

La facturación fiscal **no debe acoplarse directamente a la venta en el salón**:
- La venta se cobra y se asienta en el punto de venta de forma inmediata.
- El adaptador fiscal (`FiscalPort`) gestiona la comunicación con los Web Services de AFIP con un **timeout estricto de 3.5 segundos**.
- Si AFIP responde con éxito, se almacena el CAE y se entrega el ticket final.
- Si AFIP no responde (timeout o caída del ente fiscal), la venta en el salón **NO se revierte**: se emite un comprobante transitorio y se encola la solicitud en una tabla de contingencia para su resolución en background.
