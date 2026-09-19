# ARBO OS — FASE 10: OBSERVABILIDAD Y MONITOREO
## Registro de Errores y Diagnóstico Operacional

### 1. Monitoreo de Eventos Críticos
El sistema registra y clasifica:
- **Fallos de Sincronización:** Intentos fallidos, razones de conflicto (`SYNC_CONFLICT`) y transiciones a `DEAD_LETTER`.
- **Fallos de Hardware:** Estados `PRINT_FAILED` por impresora sin papel o desconectada.
- **Fallos Fiscales:** Intentos en cola de contingencia de AFIP.
- **Auditoría de Dominio:** Ledger de eventos administrativos y automatizaciones (`automation_executions`).

### 2. Privacidad en Logs
Los logs de diagnóstico enmascaran contraseñas, tokens JWT y números de tarjetas de crédito para cumplir con estándares PCI-DSS y GDPR/Ley 25.326.
