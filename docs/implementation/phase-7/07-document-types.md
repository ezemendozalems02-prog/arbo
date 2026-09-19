# ARBO OS — FASE 7: CAPA FISCAL ARGENTINA & AUTOMATIZACIONES
## 07. TIPOS DE COMPROBANTES FISCALES

---

## 1. CLASIFICACIÓN IMPLEMENTADA

### A. Factura A
- **Emisor**: Responsable Inscripto.
- **Receptor**: Responsable Inscripto (exige CUIT válido del cliente).
- **Tratamiento de IVA**: Discriminado explícitamente en el cuerpo del comprobante (Neto + Débito Fiscal).

### B. Factura B
- **Emisor**: Responsable Inscripto.
- **Receptor**: Consumidor Final, Exento o Monotributista.
- **Tratamiento de IVA**: IVA no discriminado en la vista del cliente. El total facturado incluye el impuesto.

### C. Factura C
- **Emisor**: Monotributista.
- **Receptor**: Cualquier categoría tributaria.
- **Tratamiento de IVA**: Sin débito fiscal. Neto = Total facturado.

### D. Notas de Crédito (A / B / C)
- Documentos de ajuste o devolución que reflejan importes negativos o anulaciones de comprobantes previamente autorizados.

### E. Comprobante X (Control Interno)
- Documento no fiscal de uso operativo interno (comandas de control, precuenta de mesa).
- No se envía a AFIP ni contiene CAE.
