# ARBO OS — POST-PHASE 7 CHECKPOINT
## 16. DISTINCIÓN: CERTIFICACIÓN TÉCNICA VS VALIDACIÓN FISCAL EXTERNA

---

## 1. ESTADO TÉCNICO: TECHNICALLY VERIFIED
- El motor de software, bases de datos, algoritmos de alícuotas, mapeo de contratos WSFEv1, códigos QR y mecanismos de contingencia asíncrona están 100% verificados y testeados.
- Las suites automáticas garantizan que el código se comporta de manera determinista ante todos los casos de uso documentados.

---

## 2. REQUERIMIENTO FORMAL: REQUIRES EXTERNAL FISCAL VALIDATION
> [!CAUTION]
> El paso a producción comercial viva exige obligatoriamente la intervención y firma del profesional contable de la empresa para cumplimentar los siguientes hitos fiscales legales externos:
> 1. **Encuadre Impositivo**: Certificación de la condición tributaria del emisor (Responsable Inscripto vs Monotributo) y verificación de los regímenes de retención/percepción si aplicaran.
> 2. **Puntos de Venta AFIP**: Alta formal del Punto de Venta tipo "Web Services" mediante el servicio "Administración de Puntos de Venta y Domicilios" con Clave Fiscal Nivel 3.
> 3. **Certificados Digitales**: Generación de CSR, obtención del certificado X.509 en AFIP y delegación del servicio al alias de facturación electrónica.
> 4. **Correlatividad Inicial**: Cotejo del último número de comprobante autorizado en AFIP para sincronizar el punto de partida sin generar saltos de numeración.
