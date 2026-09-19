# ARBO OS — PRE-PHASE 7 CHECKPOINT
## 19. REGISTRO DE RIESGOS (RISK REGISTER)

---

## 1. MATRIZ DE RIESGOS IDENTIFICADOS PREVIO A FASE 7

| ID | Riesgo | Impacto | Probabilidad | Mitigación Planificada | Estado |
| :--- | :--- | :---: | :---: | :--- | :---: |
| **R-01** | **Caída o saturación de servidores AFIP** | ALTO | ALTA | Desacople con cola de contingencia asíncrona | **PLANIFICADA** |
| **R-02** | **Salto de correlatividad en facturas** | ALTO | MEDIA | Bloqueo transaccional de secuencia por Punto de Venta | **PLANIFICADA** |
| **R-03** | **Fuga de certificados digitales tributarios** | CRÍTICO | BAJA | Almacenamiento exclusivo en Supabase Secrets / Vault | **PLANIFICADA** |
| **R-04** | **Duplicación de facturas por reintentos** | MEDIO | MEDIA | Constraint `UNIQUE(organization_id, pos_number, invoice_type, invoice_number)` | **PLANIFICADA** |
| **R-05** | **Demoras en cobro de salón por llamada SOAP** | ALTO | MEDIA | Timeout estricto de 3.5 segundos | **PLANIFICADA** |
| **R-06** | **Spam en automatizaciones por reintentos** | BAJO | MEDIA | Clave de idempotencia única `execution_key` | **PLANIFICADA** |
