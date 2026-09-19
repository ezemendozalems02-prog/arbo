# ARBO OS — PRE-PHASE 7 CHECKPOINT
## 16. INTEGRACIONES EXTERNAS PREVISTAS & CLASIFICACIÓN

---

## 1. MATRIZ DE INTEGRACIONES

| Integración | Prioridad | Propósito | Alternativa para Desarrollo / Test |
| :--- | :---: | :--- | :--- |
| **AFIP WSAA** | **OBLIGATORIA** | Autenticación y obtención de Token & Sign (Ticket de Acceso) | `MockFiscalAdapter` determinista |
| **AFIP WSFEv1** | **OBLIGATORIA** | Solicitud de CAE para Facturas A, B, C y Notas de Crédito | `MockFiscalAdapter` determinista |
| **AFIP Padrón CUIT** | *OPCIONAL* | Consulta automática de Razón Social al ingresar CUIT | Ingreso manual de Nombre / Razón Social |
| **Meta WhatsApp API** | *EVOLUTIVA* | Envío de ticket digital y automatizaciones de cortesía | Vista digital web mediante enlace seguro |

---

## 2. REGLA DE INDEPENDENCIA DEL ENTORNO LOCAL

Ningún test unitario, de integración o CI/CD debe requerir certificados reales ni conexión viva a los servidores de AFIP para ejecutarse con éxito.
El `MockFiscalAdapter` simula de forma exacta los códigos de respuesta, errores de rechazo y generación de CAE de AFIP.
