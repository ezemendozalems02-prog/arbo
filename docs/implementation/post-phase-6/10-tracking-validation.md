# ARBO OS — POST-PHASE 6 CHECKPOINT
## 10. VALIDACIÓN DE TRACKING PÚBLICO & BLINDAJE CONTRA IDOR

---

## 1. TOKEN CRIPTOGRÁFICO vs IDs SECUENCIALES

Se auditó que el acceso a la pantalla `/order/:token` no dependa de números secuenciales (`/order/1`, `/order/2`), lo cual habilitaría ataques de enumeración masiva (IDOR).

### Propiedades del Token:
- Formato: `ord_sec_[timestamp_base36]_[24_caracteres_aleatorios]` (ej. `ord_sec_mn48k9_a7b9c2d4e6f8g1h3j5k7m9p2`).
- Longitud: Superior a 36 caracteres.
- Espacio de búsqueda: Imposible de adivinar por fuerza bruta.

---

## 2. OFUSCACIÓN DE PII & EXCLUSIÓN FINANCIERA

La función `getPublicOrderTracking(...)` y la página `OrderTracking.jsx` validaron:
- **Teléfono enmascarado**: `+5493410000000` $\rightarrow$ `+54 9 341 ***-0000`.
- **Exclusión de Métricas Internas**: El payload de tracking no incluye costos (`cost`), margen bruto (`profit`), recetas, identificador de caja ni notas internas de personal.
- **Aislamiento**: El `Token A` solo resuelve la `Orden A`. Un intento de acceder con un token inexistente o alterado arroja `ORDER_NOT_FOUND`.
