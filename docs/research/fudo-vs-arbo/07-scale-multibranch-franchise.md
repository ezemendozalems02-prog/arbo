# 07 — Multi-sucursal, Franquicias y Dark Kitchens

**Categorías cubiertas:**
29. Operación Multi-sucursal y Cadenas
30. Modelos de Franquicia y Dark Kitchens

---

## 29. Operación Multi-sucursal

### FUDO
- **Qué hace:** Agrupación superficial de cuentas independientes mediante un selector de locales.
- **Qué fue documentado (`DOCUMENTED` en Fase 14):**
  - **La debilidad estructural central de FUDO:** La *sucursal* **no es una dimensión nativa de su modelo de datos**. Cada local es una base de datos aislada con su propia facturación, su propio catálogo y sus propios usuarios.
  - **Módulo Multi-sucursal:** Consiste únicamente en:
    1. Un conmutador de cuentas para que el dueño pase de un local a otro sin reloguear.
    2. Un reporte consolidado básico de ventas exportable.
  - **Limitaciones severas comprobadas:**
    - **No hay transferencias de stock entre sucursales:** Si la Sucursal A le envía 10 kg de café a la Sucursal B, debe registrarse como "ajuste/merma" en A y "compra ficticia" en B.
    - **No hay catálogo centralizado:** Cambiar el precio de un plato en 5 locales exige entrar a cada cuenta una por una y modificarlo a mano.
    - **Cobro duplicado:** Cada sucursal debe pagar su abono completo mensual independiente.
- **Estado:** `PARTIAL` (Multi-cuenta cosmético, no arquitectura multi-sucursal real).

### ARBO OS
- **Qué hace:** Sistema diseñado para un único punto de venta físico (`18-multibranch-scale.md`).
- **Qué fue observado (`OBSERVED`):**
  - Cero noción de `branch_id` o `tenant_id` en ninguna de las estructuras de datos.
  - Un solo almacén de stock (`currentStock`), un mapa de 14 mesas fijo y una única caja registradora.
  - **Propuesta de Arquitectura (`27-target-architecture.md`):** Define un modelo relacional moderno donde `branches` es una entidad subordinada a `tenants`, permitiendo transferencias de stock, catálogos centralizados y aislamiento de seguridad vía RLS.
- **Estado:** `NOT_IMPLEMENTED` (En código actual).

### DIFERENCIA COMPROBADA
FUDO resuelve el multi-sucursal cobrando cuentas independientes con un conmutador de acceso. ARBO OS actualmente solo modela un local único, aunque su diseño relacional futuro contempla multi-sucursal nativo desde el esquema de base de datos.

---

## 30. Franquicias y Dark Kitchens

### FUDO
- **Qué hace:** Inadecuado para franquicias y dark kitchens multi-marca.
- **Qué fue documentado (`DOCUMENTED` en Fase 14):**
  - En una dark kitchen (cocina oculta con 3 marcas gastronómicas virtuales compartiendo la misma cocina y los mismos insumos), Fudo obliga a contratar 3 cuentas separadas. El stock de carne o vegetales queda fragmentado en 3 cuentas sin poder deducirse de un depósito central unificado.
  - En franquicias, no permite al franquiciante auditar en tiempo real los costos, recetas ni ventas brutas de los franquiciados de manera automatizada.
- **Estado:** `NOT_IMPLEMENTED`.

### ARBO OS
- **Qué hace:** Difusión comercial de franquicias en `/franquicia` sin soporte de software en el admin.
- **Qué fue observado (`OBSERVED` en `18-multibranch-scale.md`):**
  - El sitio web público promueve la expansión de locales ("Franquicias Patagonia para el mundo").
  - **BUG-024 (P1 · Pérdida de Leads):** El formulario de solicitud de dossier (`DossierForm` en `Franquicia.jsx`) recibe datos de inversores y simula el envío con `setSent(true)`, descartando los contactos en memoria sin transmitirlos ni persistirlos.
  - En el panel administrativo no existen herramientas de control de franquicias ni regalías.
- **Estado:** `NOT_IMPLEMENTED` en software; `BROKEN` en captura de prospectos.

---

## Síntesis Clasificatoria

| Capacidad | Clasificación FUDO | Clasificación ARBO OS | Tipo de Brecha |
|---|---|---|---|
| **Multi-sucursal Operativo** | `PARTIAL` (Cuentas separadas) | `NOT_IMPLEMENTED` | **GAP ACTUAL** |
| **Transferencias de Stock** | `NOT_IMPLEMENTED` | `NOT_IMPLEMENTED` | **OPORTUNIDAD COMÚN** |
| **Catálogo Centralizado** | `NOT_IMPLEMENTED` | `NOT_IMPLEMENTED` | **OPORTUNIDAD COMÚN** |
| **Dark Kitchen Multi-marca** | `NOT_IMPLEMENTED` | `NOT_IMPLEMENTED` | **OPORTUNIDAD COMÚN** |
| **Captura de Franquiciados**| No aplica | `BROKEN` (BUG-024) | **BUG ARBO** |
