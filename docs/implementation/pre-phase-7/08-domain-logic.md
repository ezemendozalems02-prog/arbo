# ARBO OS — PRE-PHASE 7 CHECKPOINT
## 08. LÓGICA DE DOMINIO FISCAL & MATEMÁTICA IMPOSITIVA

---

## 1. CÁLCULO DE ALÍCUOTAS DE IVA EN ARGENTINA

La capa de dominio fiscal (`fiscalEngine.js`) separará tajantemente la matemática impositiva de los componentes de UI:

### A. Factura A (Emisor RI $\rightarrow$ Receptor RI)
- El precio base de catálogo de ARBO OS es **con IVA incluido** ($P_{final}$).
- Para discriminar el IVA (ej. alícuota general del 21%):
  $$\text{Neto Gravado} = \frac{P_{final}}{1 + 0.21} = \frac{P_{final}}{1.21}$$
  $$\text{IVA 21\%} = P_{final} - \text{Neto Gravado}$$
- Ejemplo para un Espresso Doble de $3.500:
  - $\text{Neto} = \frac{3500}{1.21} = \$2.892,56\text{ ARS}$
  - $\text{IVA 21\%} = \$607,44\text{ ARS}$
  - $\text{Total} = \$3.500,00\text{ ARS}$

### B. Factura B (Emisor RI $\rightarrow$ Consumidor Final)
- No discrimina IVA en el cuerpo visible. El importe total es $3.500,00 ARS.

### C. Factura C (Emisor Monotributista)
- No genera débito fiscal de IVA. Total facturado = Importe neto.

---

## 2. GENERADOR DE CÓDIGO QR OFICIAL AFIP

Según la Resolución General 4892/2020 de AFIP, todo comprobante fiscal electrónico debe contener un código QR codificado en Base64 que apunte a:
```
https://www.afip.gob.ar/fe/qr/?p={BASE64_JSON}
```
Donde el JSON contiene:
- `ver`: 1
- `fecha`: YYYY-MM-DD
- `cuit`: CUIT del emisor (11 dígitos)
- `ptoVta`: Punto de venta AFIP
- `tipoCmp`: Código numérico AFIP (ej. 1 para Factura A, 6 para Factura B)
- `nroCmp`: Número de comprobante oficial
- `importe`: Monto total
- `moneda`: "PES"
- `ctz`: 1.00
- `tipoDocRec`: 80 (CUIT) u 96 (DNI)
- `nroDocRec`: CUIT/DNI del cliente
- `tipoCodAut`: "E"
- `codAut`: Número de CAE obtenido
