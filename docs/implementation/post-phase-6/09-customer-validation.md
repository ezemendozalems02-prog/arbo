# ARBO OS — POST-PHASE 6 CHECKPOINT
## 09. VALIDACIÓN DE IDENTIDAD DE CLIENTES & RESGUARDO DE PII

---

## 1. COMPORTAMIENTO DE `resolveOrCreatePublicCustomer`

Se comprobó la lógica de identificación de baja fricción:
1. **Normalización**: Limpieza de caracteres no numéricos conservando el prefijo internacional (`+54 9 341 555-1234` $\rightarrow$ `+5493415551234`).
2. **Búsqueda Determinista**: Búsqueda en `customers` bajo la condición `organization_id == org_id AND phone == normalized_phone`.
3. **Reutilización**: Si el cliente ya existe, se asocia su `customer_id` sin crear registros duplicados.
4. **Creación**: Si no existe, se inserta en estado `ACTIVE`.
5. **Aislamiento Multi-Tenant**: Un mismo número de teléfono puede registrarse en la Organización A y en la Organización B de forma independiente sin conflicto.

---

## 2. PRIVACIDAD EN CHECKOUT PÚBLICO

Se confirmó que el checkout público es estrictamente un flujo de entrada unidireccional:
- Un usuario anónimo que ingresa un teléfono celular **NUNCA** recibe como respuesta el historial de pedidos pasados, el saldo de puntos acumulados ni la dirección de la persona titular del número.
