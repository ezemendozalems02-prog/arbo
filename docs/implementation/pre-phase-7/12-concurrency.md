# ARBO OS — PRE-PHASE 7 CHECKPOINT
## 12. CONCURRENCIA & CORRELATIVIDAD FISCAL
## PREVENCIÓN DE SALTOS DE NÚMERO Y CONDICIONES DE CARRERA

---

## 1. EL RIESGO DE CORRELATIVIDAD EN AFIP

La normativa de AFIP exige que la numeración de los comprobantes fiscales para un mismo Punto de Venta y tipo de factura sea **estrictamente correlativa y continua** (1, 2, 3, 4...).
Si dos terminales de cobro intentan emitir la `Factura B #0001-00000045` al mismo tiempo:
- Una de las dos peticiones será rechazada por AFIP con error de "Número ya utilizado" o "Salto de correlatividad detectado".

---

## 2. ESTRATEGIA DE BLOQUEO & SECUENCIA EN ARBO OS

Para evitar carreras de condición entre múltiples cajeros:
1. **Serialización por Punto de Venta**:
   - Se implementa una tabla de control de secuencia fiscal o bloqueo a nivel de fila (`FOR UPDATE` sobre `branches.fiscal_pos_number`).
2. **Sincronización con AFIP (`FECompUltimoAutorizado`)**:
   - Al iniciar la jornada o ante una discrepancia, el sistema consulta a AFIP cuál fue el último número autorizado oficialmente.
3. **Idempotencia de Emisión**:
   - Se asegura la restricción `UNIQUE(organization_id, pos_number, invoice_type, invoice_number)`.
   - Si una solicitud sufre reintentos de red, el sistema no incrementa el número fiscal hasta que el comprobante anterior esté asentado.
