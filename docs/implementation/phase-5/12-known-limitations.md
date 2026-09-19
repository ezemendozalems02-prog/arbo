# ARBO OS — FASE 5: LIMITACIONES CONOCIDAS & ALCANCE FUTURO
## DELIMITACIÓN TÉCNICA DEL MVP DE FIDELIZACIÓN & CRM

---

## 1. LIMITACIONES DE LA FASE 5

1. **Sin Notificaciones Salientes (WhatsApp API / SMS)**:
   - Los movimientos del ledger y las redenciones se visualizan en el POS y en la consola administrativa. No se emiten mensajes SMS ni mensajes automáticos por WhatsApp Business API.
2. **Sin Portal Web Público de Clientes**:
   - No existe un frontend público para que el cliente consulte sus puntos desde su celular. La consulta se realiza en el mostrador mediante el número de teléfono del cliente.
3. **Sin Reglas Dinámicas de Multiplicadores o Campañas Temporales**:
   - La regla de acumulación es universal y determinista: `floor(total / 100)`. No se contemplan multiplicadores como "Doble Puntos los Jueves" o puntos por categoría en esta etapa.
4. **Vencimiento de Puntos**:
   - La estructura soporta el tipo de transacción `EXPIRE` en el ledger, pero no se ha activado un cronjob de expiración automática de puntos por inactividad.
5. **Sin Fusión Automática de Clientes Duplicados**:
   - La tabla `customers` prevé el estado `MERGED`, pero la herramienta visual de merge de cuentas duplicadas queda diferida para fases de administración avanzada.
