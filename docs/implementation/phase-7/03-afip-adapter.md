# ARBO OS — FASE 7: CAPA FISCAL ARGENTINA & AUTOMATIZACIONES
## 03. ADAPTADOR AFIP / ARCA WSFE (WEBSERVICES REALES)

---

## 1. ESPECIFICACIÓN & PROTOCOLO
El adaptador `AfipWsfeAdapter` implementa el mapeo de contratos de Web Services de AFIP conforme a las resoluciones generales vigentes (RG 4291/2018 y complementarias):
- **WSAA (Web Service de Autenticación y Autorización)**: Intercambia un Ticket de Requerimiento de Acceso (TRA) firmado digitalmente por un Token + Sign (validez de 12 horas).
- **WSFEv1 (Facturación Electrónica Nacional)**: Operación principal `FECAESolicitar`.

## 2. MAPEO DE TIPOS DE COMPROBANTES Y DOCUMENTOS
- `FACTURA_A`: Código AFIP `1`
- `NOTA_CREDITO_A`: Código AFIP `3`
- `FACTURA_B`: Código AFIP `6`
- `NOTA_CREDITO_B`: Código AFIP `8`
- `FACTURA_C`: Código AFIP `11`
- `NOTA_CREDITO_C`: Código AFIP `13`
- `COMPROBANTE_X`: Código `99` (Control interno, no se envía a AFIP)

Tipos de Documento del Receptor:
- `CUIT`: Código AFIP `80`
- `DNI`: Código AFIP `96`
- `Consumidor Final no categorizado`: Código AFIP `99`

## 3. LÍMITE ESTRICTO DE TIEMPO (TIMEOUT 3.5s)
El cliente HTTP incorpora un `AbortController` con timeout de 3.500 ms. Si AFIP no responde dentro de esta ventana, se dispara inmediatamente la contingencia asíncrona para no degradar la experiencia de cobro en mostrador.

## 4. GESTIÓN SEGURA DE SECRETOS
> [!CAUTION]
> **REGLA DE ORO DE SEGURIDAD**: Los certificados digitales X.509 (`.crt`) y las claves privadas RSA (`.key`) residen exclusivamente en el almacén de secretos del servidor backend (Vault). La interfaz web de ARBO OS jamás tiene acceso a claves privadas criptográficas.
