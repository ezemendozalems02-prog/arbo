# 24 — ESTRATEGIA DE RESPALDO, RECUPERACIÓN Y DISASTER RECOVERY

---

## 1. OBJETIVOS DE RECUPERACIÓN DE NEGOCIO (RPO & RTO)

> **"Un restaurante deposita en ARBO OS la totalidad de su recaudación del mes y el inventario de su negocio. La pérdida de datos por fallo de infraestructura o error humano es inaceptable."**

| Métrica | Objetivo Comprometido | Definición Operativa |
| :--- | :--- | :--- |
| **RPO (Recovery Point Objective)** | `< 5 minutos` | En el peor escenario de catástrofe de datos, la pérdida máxima tolerada es de 5 minutos de operaciones. |
| **RTO (Recovery Time Objective)** | `< 30 minutos` | El tiempo total para restablecer el servicio operativo completo tras una caída de servidor no debe superar la media hora. |

---

## 2. ESTRATEGIA DE BACKUPS Y RETENCIÓN

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ESQUEMA DE COPIAS DE SEGURIDAD                  │
├───────────────────────────────┬────────────────────────────────────────┤
│ 1. POINT-IN-TIME RECOVERY     │ Archivado continuo de Write-Ahead Logs │
│    (PITR - Continuo)          │ (WAL) en Supabase/PostgreSQL. Permite   │
│                               │ restaurar al segundo exacto en 7 días. │
├───────────────────────────────┼────────────────────────────────────────┤
│ 2. DUMPS DIARIOS AUTOMÁTICOS  │ Respaldo lógico completo (`pg_dump`)   │
│    (Daily Snapshots)          │ todas las madrugadas a las 04:00 AM.   │
│                               │ Retención de 30 días en bucket S3 frío.│
├───────────────────────────────┼────────────────────────────────────────┤
│ 3. GEO-REDUNDANCIA EXTERNA    │ Copia encriptada (AES-256) replicada   │
│    (Multi-Cloud Storage)      │ fuera del datacenter principal.        │
└───────────────────────────────┴────────────────────────────────────────┘
```

---

## 3. PLAYBOOKS DE RECUPERACIÓN ANTE DESASTRES

### Escenario 1: Error Humano o Borrado Accidental de Datos
- *Situación:* Un administrador borra por error una categoría completa de productos o recetas activas.
- *Procedimiento:* Se utiliza el PITR para levantar una base de datos temporal clonada al minuto previo al incidente (`T - 1 min`). Se extraen los registros afectados y se reinyectan en la base de producción mediante un script de restauración sin detener la operación de los mozos.

### Escenario 2: Caída Total del Datacenter del Proveedor
- *Situación:* Falla masiva en la región del datacenter cloud principal.
- *Procedimiento:* El DNS conmuta automáticamente (Health Check Failover) hacia la infraestructura de contingencia en región secundaria, reconectando los clientes PWA sin requerir reinstalación por parte del usuario.

---

## 4. PORTABILIDAD Y EXPORTACIÓN SOBERANA DE DATOS

Para evitar que el cliente se sienta "cautivo" y cumplir con las mejores prácticas de soberanía de datos:
- El panel de administración incluye la función **"Descargar Copia de Seguridad Completa"**:
  - Genera un archivo `.zip` con todos los clientes, ventas históricas, recetas y movimientos de stock en formatos universales `CSV` y `JSON`.
  - La exportación se procesa en segundo plano y se entrega con enlace seguro temporal firmado digitalmente.
