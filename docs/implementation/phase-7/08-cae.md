# ARBO OS — FASE 7: CAPA FISCAL ARGENTINA & AUTOMATIZACIONES
## 08. CÓDIGO DE AUTORIZACIÓN ELECTRÓNICO (CAE)

---

## 1. DEFINICIÓN
El CAE (Código de Autorización Electrónico) es la constancia numérica obligatoria de 14 dígitos otorgada por AFIP / ARCA que valida legalmente la emisión de una factura electrónica.

## 2. REGLAS DE CICLO DE VIDA DEL CAE EN ARBO OS
1. **Asignación Solo por Autoridad**: Ningún componente interno ni el Mock genera un CAE considerado legal. En entorno Mock, los CAEs generados portan prefijo `7428...` determinista y son estrictamente sintéticos.
2. **Fecha de Vencimiento**: Se persiste inmutablemente en el campo `cae_expires_at` (plazo legal habitual de 10 días corridos otorgado por AFIP).
3. **Inmutabilidad**: Una vez asignado un CAE a una factura con estado `AUTHORIZED`, el registro no admite modificaciones ulteriores en base de datos.
4. **Validación de Formato**: Expresión regular obligatoria `/^\d{14}$/` para asegurar la integridad de los datos almacenados.
