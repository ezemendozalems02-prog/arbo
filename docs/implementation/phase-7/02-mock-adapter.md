# ARBO OS — FASE 7: CAPA FISCAL ARGENTINA & AUTOMATIZACIONES
## 02. ADAPTADOR FISCAL MOCK (MOCK FISCAL ADAPTER)

---

## 1. OBJETIVO
Proveer una implementación determinista y completamente reproducible para:
- Ejecución de suites de prueba automáticas sin conexión a internet ni dependencias externas.
- Entornos de desarrollo local y CI/CD.
- Simulación exhaustiva de escenarios de falla (timeout, caída de AFIP, rechazo por CUIT inválido).

## 2. COMPORTAMIENTO & MODOS CONFIGURABLES
El `MockFiscalAdapter` soporta cuatro modos de operación conmutables en caliente:

| Modo | Comportamiento Simulado | Respuesta de Retorno |
| :--- | :--- | :--- |
| **SUCCESS** | Autorización normal de AFIP | `status: 'AUTHORIZED'`, CAE sintético de 14 dígitos (`7428...`), Vto. a 10 días |
| **REJECTION** | Rechazo formal por inconsistencia | `status: 'REJECTED'`, `errorCode: '10014'`, `cae: null` |
| **TIMEOUT** | Pérdida de paquetes o demora >3.5s | Lanza excepción tipada `FISCAL_TIMEOUT` |
| **UNAVAILABLE** | Servidores AFIP caídos (HTTP 503) | Lanza excepción tipada `AFIP_SERVICE_UNAVAILABLE` |

## 3. GENERACIÓN DETERMINISTA DE CAE
- Prefijo oficial sintético: `7428`.
- Secuencia: Derivada estrictamente de `caeSequence + invoice_number`.
- Previene números aleatorios que generen tests no reproducibles o fluctuantes.
