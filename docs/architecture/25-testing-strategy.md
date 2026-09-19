# 25 — ARQUITECTURA DE PRUEBAS Y ASEGURAMIENTO DE CALIDAD

---

## 1. PIRÁMIDE Y DIMENSIONES DE TESTING EN ARBO OS

Para blindar la integridad del sistema y garantizar que ningún bug histórico reaparezca en producción, se establece una estrategia de pruebas en **7 dimensiones complementarias**:

```
                  /\
                 /  \     E2E CRITICAL JOURNEYS (Playwright)
                /    \    - Flujo completo POS -> KDS -> Caja -> Stock
               /──────\
              /        \   INTEGRATION & RLS SECURITY TESTS (Vitest + Postgres)
             /          \  - Transacciones ACID, RLS multi-tenant, Stored Procs
            /────────────\
           /              \ UNIT TESTS (Vitest / Pure Functions)
          /                \ - Costeo, Recetas, PPP, Caja, Puntos ARBO Club
         /──────────────────\
```

---

## 2. DESGLOSE DE LAS 7 DIMENSIONES DE PRUEBAS

### 2.1. Pruebas Unitarias de Dominio (Unit Tests)
- **Alcance:** Servicios matemáticos y de lógica pura en TypeScript (`src/services/domain/`).
- **Casos obligatorios:**
  - `recipeCostService.test.ts`: Validación de cálculo de Food Cost %, merma compuesta y margen unitario.
  - `weightedAverageCost.test.ts`: Verificación de la fórmula PPP ante compras fraccionadas y factores de bulto.
  - `cashBalancing.test.ts`: Cuadre matemático de arqueo ciego, tolerancia y detección de faltantes.
  - `loyaltyPoints.test.ts`: Acreditación de puntos enteros según multiplicadores de nivel (Bronce, Plata, Oro, Black).
  - `segmentEvaluator.test.ts`: Árboles lógicos combinados con operadores booleanos `AND` y `OR`.

### 2.2. Pruebas de Integración y Transaccionalidad (Integration Tests)
- **Alcance:** Base de datos PostgreSQL real ejecutándose en contenedor de test (Docker/Testcontainers).
- **Casos obligatorios:**
  - `sales_transaction_acid.test.ts`: Verificar que un fallo en el registro de pago ejecute un `ROLLBACK` total y no deje movimientos de stock huérfanos.
  - `outbox_relay.test.ts`: Comprobar que los eventos insertados en `outbox_events` se procesen exactamente una vez sin duplicación.

### 2.3. Pruebas de Seguridad y Penetración RLS (Security Tests)
- **Objetivo:** Demostrar empíricamente la imposibilidad de filtraciones entre restaurantes.
- **Caso Crítico:** Un usuario autenticado con el token de la *Organización A* ejecuta `SELECT * FROM orders WHERE id = 'orden_de_organizacion_b'`. La prueba debe verificar que la base de datos retorne `0 rows` (RLS enforced).

### 2.4. Pruebas End-to-End (E2E Journeys)
- **Herramienta:** Playwright automatizado sobre navegador real Chromium headless.
- **Flujo Crítico:**
  1. Mozo abre mesa #4 y comanda 2 Hamburguesas y 1 Café.
  2. KDS de cocina recibe la comanda vía WebSockets en <300 ms y marca "Listo".
  3. Cajero cobra la cuenta en el POS aplicando 300 puntos de ARBO Club.
  4. Se verifica en base de datos que el stock de carne y pan se descontó y que el arqueo de caja aumentó en el monto cobrado.

### 2.5. Pruebas de Contrato Fiscal (Contract Tests)
- Simulación de respuestas SOAP/XML de AFIP (éxito, CUIT inválido, servidor no disponible) para asegurar que el adaptador de contingencia fiscal responda sin colapsar el POS.

### 2.6. Pruebas de Carga y Rendimiento (Load Testing)
- **Herramienta:** k6.
- **Escenario:** Inyección de 200 comandas concurrentes por minuto simulando la hora pico de un festival gastronómico, verificando que la latencia de respuesta se mantenga por debajo de los 100 ms.

### 2.7. Suite de Regresión Anti-Bugs Históricos (Regression Tests)
- Suite automatizada específica que reproduce los escenarios de los 21 bugs descubiertos en la auditoría forense (`BUG-001` a `BUG-021`), impidiendo que cualquier cambio de código reactive un defecto superado.
