# ARBO OS — POST-PHASE 7 CHECKPOINT
## 05. AUDITORÍA DEL MOTOR IMPOSITIVO (TAX ENGINE)

---

## 1. PRECISIÓN FINANCIERA & LÓGICA DE IVA
Se auditó exhaustivamente la implementación en `src/services/domain/taxEngine.js`:
- **Factura A (Alícuota 21%)**: Para un producto con precio final de $3.500:
  - $\text{Neto Gravado} = \frac{3500}{1.21} = \$2.892,56$
  - $\text{IVA 21\%} = \$607,44$
  - $\text{Total Comprobante} = \$3.500,00$
- **Factura A (Alícuota 10.5%)**: Para un producto con precio final de $1.800:
  - $\text{Neto Gravado} = \frac{1800}{1.105} = \$1.628,96$
  - $\text{IVA 10.5\%} = \$171,04$
  - $\text{Total Comprobante} = \$1.800,00$
- **Exento (0%)**: Neto = Total, IVA = $0,00.
- **Factura B**: Preserva el precio bruto visible para el consumidor final con discriminación interna.
- **Factura C**: Monotributo sin débito fiscal de IVA (Neto = Total facturado).

## 2. COMPENSACIÓN DE REDONDEO
En carritos mixtos con múltiples líneas gravadas a distintas tasas, la función `roundToTwoDecimals` compensa diferencias de punto flotante asegurando la regla fundamental:
$$\text{Neto} + \text{IVA} = \text{Bruto Total (Exacto al centavo)}$$
El cálculo crítico se ejecuta en el backend/servicios de dominio y nunca en la interfaz de React.
