# ARBO OS — FASE 7: CAPA FISCAL ARGENTINA & AUTOMATIZACIONES
## 14. ANÁLISIS DE SEGURIDAD & VECTOR DE AMENAZAS

---

## 1. AMENAZAS IDENTIFICADAS Y MITIGACIONES
| Vector de Amenaza | Clasificación | Mitigación Implementada |
| :--- | :---: | :--- |
| **Exposición de Certificados / Claves Privadas** | **P0** | Claves RSA y certificados X.509 residen exclusivamente en Vault de servidor; nunca incluidos en bundle cliente ni en `.env` frontend. |
| **Adulteración de CAE o Importes** | **P0** | El backend valida la estructura matemática del comprobante y verifica el CAE contra el registro inmutable; la UI no define importes fiscales. |
| **Tenant Escape en Facturación** | **P0** | Filtrado estricto por `organization_id` en RLS y relaciones foráneas no modificables por el cliente. |
| **Spam / Bombardeo de Mensajes** | **P1** | Claves de idempotencia deterministas a nivel base de datos (`uq_automation_execution_idempotency`). |
| **Salto o Duplicación de Correlativos** | **P1** | Restricción única sobre `(organization_id, pos_number, invoice_type, invoice_number)` con cálculo transaccional. |

## 2. INTEGRIDAD CRIPTOGRÁFICA
- Los datos de validación QR se generan estrictamente desde el backend.
- Ningún parámetro de alícuota o tipo de factura es aceptado del cliente sin validación contra el catálogo del tenant.
