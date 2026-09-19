# ARBO OS — FASE 7: CAPA FISCAL ARGENTINA & AUTOMATIZACIONES
## 19. REGISTRO DE RIESGOS & CONSIDERACIONES FISCALES

---

## 1. MATRIZ DE RIESGOS

| Riesgo | Impacto | Probabilidad | Mitigación | Estado |
| :--- | :---: | :---: | :--- | :---: |
| **Caída prolongada de AFIP (>24 hs)** | ALTO | MEDIA | Cola de contingencia persistente con reintentos exponenciales y reporte de estado para el contador. | MITIGADO |
| **Vencimiento de Certificados Digitales X.509** | CRÍTICO | BAJA | Notificaciones de alerta preventiva a 30 y 15 días del vencimiento en el dashboard admin. | CONTROLADO |
| **Discrepancia en Alícuotas por cambio legal de AFIP** | MEDIO | BAJA | Motor impositivo modular parametrizable (`taxEngine.js`) sin lógica hardcodeada en componentes de interfaz. | RESUELTO |
| **Cómputo erróneo de redondeo en comprobantes con múltiples ítems** | MEDIO | BAJA | Algoritmo de ajuste al centavo en `taxEngine.js` que garantiza suma idéntica al importe cobrado. | TESTEADO |

---

## 2. ADVERTENCIA OBLIGATORIA: VALIDACIÓN FISCAL EXTERNA
> [!IMPORTANT]
> **ESTADO TÉCNICO: TECHNICALLY IMPLEMENTED**
> Toda la arquitectura de software, tablas, colas de contingencia, correlatividad, motor de IVA y simulación de contratos SOAP de AFIP se encuentran completas, operativas y validadas mediante 46 pruebas automatizadas.
>
> **ESTADO LEGAL: REQUIRES ACCOUNTANT / FISCAL VALIDATION**
> La salida a producción comercial real con facturación legal en vivo requiere obligatoriamente:
> 1. Verificación por parte del contador matriculado de la organización del encuadre tributario del contribuyente (Responsable Inscripto vs Monotributo).
> 2. Alta formal de los Puntos de Venta (Web Services) en el portal fiscal de AFIP con clave fiscal nivel 3.
> 3. Carga de los certificados digitales de producción delegados a nombre de ARBO en el servidor seguro backend.
