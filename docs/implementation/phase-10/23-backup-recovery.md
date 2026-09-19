# ARBO OS — FASE 10: ESTRATEGIA DE BACKUP & DISASTER RECOVERY
## Continuidad Operativa y Respaldo de Datos

### 1. Respaldo en PostgreSQL / Supabase
- **Respaldos Automáticos Diarios:** Con retención de Point-in-Time Recovery (PITR).
- **Exportación Periódica de Snapshots:** Exportación de esquemas y volcados de tablas transaccionales mediante `pg_dump`.

### 2. Protocolo de Recuperación ante Desastres (Disaster Recovery)
1. Detección de incidente en base de datos.
2. Cambio inmediato de terminales a modo OFFLINE para continuar operando en salón y cocina sin perder ventas.
3. Restauración de snapshot en nueva instancia de PostgreSQL.
4. Aplicación de migraciones idempotentes `001` a `009`.
5. Reconexión de terminales y despacho sincronizado de transacciones acumuladas en la outbox.
