# ARBO OS — POST-PHASE 7 CHECKPOINT
## 02. AUDITORÍA DEL PUERTO FISCAL (`FiscalPort`) Y ADAPTADORES

---

## 1. DESACOPLAMIENTO ARQUITECTÓNICO
Se inspeccionó la relación entre el núcleo transaccional de ventas y el subsistema fiscal:
- El motor de ventas (`saleCheckout.js`) y de pedidos públicos (`publicCommerceManager.js`) operan con independencia del proveedor fiscal.
- `FiscalPort` actúa como frontera hexagonal:
  ```
  Ventas Core ──> fiscalManager.js ──> FiscalPort ──> [ MockFiscalAdapter | AfipWsfeAdapter ]
  ```
- **Conclusión de Auditoría**: CERO acoplamiento directo entre el POS y los protocolos SOAP/WSDL de AFIP.

## 2. ADAPTADORES VERIFICADOS
1. `MockFiscalAdapter`:
   - Modos probados: `SUCCESS`, `REJECTION` (código 10014), `TIMEOUT` (>3.5s) y `UNAVAILABLE` (503).
   - Genera respuestas deterministas y reproducibles para CI/CD.
2. `AfipWsfeAdapter`:
   - Construye fielmente el payload `FECAESolicitar` conforme a la especificación WSFEv1.
   - Enforce de timeout estricto de 3.5 segundos con `AbortController`.
   - No expone ni contiene credenciales criptográficas hardcodeadas.
