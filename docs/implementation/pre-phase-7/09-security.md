# ARBO OS — PRE-PHASE 7 CHECKPOINT
## 09. AUDITORÍA DE SEGURIDAD ESPECÍFICA DE LA CAPA FISCAL

---

## 1. MATRIZ DE AMENAZAS EN FACTURACIÓN ELECTRÓNICA

| Amenaza | Nivel | Descripción | Mitigación Arquitectónica |
| :--- | :---: | :--- | :--- |
| **Exposición de Certificados Digitales** | **P0** | Fuga de la clave privada (`.key`) o certificado (`.crt`) de AFIP | Almacenamiento exclusivo en Supabase Secrets / Vault; nunca en cliente |
| **Salto de Correlatividad AFIP** | **P0** | Emitir comprobantes fuera de secuencia cronológica o con números salteados | Bloqueo estricto a nivel de base de datos (`FOR UPDATE`) sobre el correlativo |
| **Falsificación de CAE** | **P0** | Inserción de un CAE apócrifo en `fiscal_invoices` por un usuario malicioso | Generación exclusiva mediante funciones seguras en servidor (`SECURITY DEFINER`) |
| **Tenant Escape Fiscal** | **P0** | Facturar con el CUIT o certificado de una organización ajena | Aislamiento estricto por `organization_id` en las credenciales fiscales |
| **IDOR en Consulta Fiscal** | **P1** | Un usuario descarga la factura de otro cliente modificando el ID | Comprobantes protegidos por RLS de tenant o tokens de tracking de venta |
| **Inconsistencia Fiscal vs Caja** | **P1** | Facturar por un monto distinto al cobrado en la sesión de caja | Vinculación forzosa con `sale_id` y validación `total_amount == sale.total` |

---

## 2. CONTEO PREVIO DE VULNERABILIDADES RESIDUALES

- **P0**: 0 (Arquitectura diseñada para prevenir fugas y saltos de secuencia).
- **P1**: 0.
- **P2**: 0.
