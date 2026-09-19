# 17 — ARQUITECTURA DE SEGURIDAD INTEGRAL Y PROTECCIÓN DE DATOS

---

## 1. PRINCIPIO DE ZERO TRUST

> **"Ninguna petición —venga de un comensal en la web, de una tablet de mozo o de una pantalla de administración— es confiable por defecto. La autenticidad de la identidad, la membresía en la organización y los permisos específicos se validan en cada solicitud."**

---

## 2. BLINDAJE DE LA RUTA `/admin` Y GESTIÓN DE SESIÓN

### 2.1. Eliminación de la Fuga de Seguridad del Prototipo
En el prototipo auditado, la ruta `/admin` era pública en el bundle de frontend y permitía inspeccionar pantallas administrativas sin login previo (`[FACT: FINAL-ARBO-OS-FORENSIC-AUDIT.md]`).

### 2.2. Mecanismo de Protección en Servidor
1. **Server-Side Route Guard (Middleware):** El servidor intercepta toda petición a `/admin/*`. Si no existe una cookie de sesión HTTP-only válida o un header `Authorization: Bearer <JWT>`, redirige inmediatamente a `/login` con código HTTP `307 Temporary Redirect` sin entregar un solo byte del bundle administrativo.
2. **Tokens JWT Criptográficos:** Emitidos por Supabase Auth con algoritmo de firma asimétrica (RS256) y tiempo de expiración corto (1 hora), renovados mediante refresh tokens rotativos almacenados en cookies seguras (`HttpOnly; Secure; SameSite=Strict`).

---

## 3. MATRIZ DE PRIVILEGIOS POR ROL (RBAC)

```
┌────────────────────────────────────────────────────────────────────────┐
│                      MATRIZ DETALLADA DE PERMISOS                      │
├───────────────────┬────────┬───────┬─────────┬────────┬────────┬───────┤
│ CAPACIDAD / RUTA  │ OWNER  │ ADMIN │ MANAGER │ CASHIER│ WAITER │KITCHEN│
├───────────────────┼────────┼───────┼─────────┼────────┼────────┼───────┤
│ Ver Ventas y P&L  │  SI    │  SI   │   NO    │   NO   │   NO   │  NO   │
│ Abrir/Cerrar Caja │  SI    │  SI   │   SI    │   SI   │   NO   │  NO   │
│ Ver Saldo Teórico │  SI    │  SI   │   SI    │   NO   │   NO   │  NO   │
│ Modificar Recetas │  SI    │  SI   │   NO    │   NO   │   NO   │  NO   │
│ Registrar Compras │  SI    │  SI   │   SI    │   NO   │   NO   │  NO   │
│ Cobrar en POS     │  SI    │  SI   │   SI    │   SI   │   NO   │  NO   │
│ Comandar Mesas    │  SI    │  SI   │   SI    │   SI   │   SI   │  NO   │
│ Operar KDS Cocina │  SI    │  SI   │   SI    │   NO   │   NO   │  SI   │
│ Configurar Fiscal │  SI    │  SI   │   NO    │   NO   │   NO   │  NO   │
└───────────────────┴────────┴───────┴─────────┴────────┴────────┴───────┘
```

---

## 4. PROTECCIÓN DE DATOS DE TARJETAS Y PII (PCI-DSS & PRIVACIDAD)

1. **Cero Almacenamiento de Tarjetas (PCI-DSS Compliance):** ARBO OS **NUNCA** recibe, transmite ni almacena números de tarjetas de crédito o códigos de seguridad (CVV). Todos los cobros con tarjeta se procesan mediante terminales físicas externas homologadas o vía el SDK de tokenización segura de MercadoPago.
2. **Protección de Datos de Clientes (PII):** Los teléfonos y correos electrónicos de los clientes en `customers` están aislados por RLS. Solo usuarios con roles autorizados pueden exportar listas para contacto.

---

## 5. AUDITORÍA FORENSE DE OPERACIONES SENSIBLES (AUDIT LOGS)

Toda acción crítica que afecte dinero, existencias o configuraciones queda asentada en la tabla `audit_logs` con retención mínima de 2 años:
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    actor_id UUID NOT NULL REFERENCES user_profiles(id),
    action VARCHAR(100) NOT NULL, -- ej. "RECIPE_UPDATED", "CASH_DISCREPANCY_APPROVED"
    entity_name VARCHAR(100) NOT NULL, -- ej. "recipes", "cash_shifts"
    entity_id UUID NOT NULL,
    old_state JSONB,
    new_state JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);
```
- Se auditan obligatoriamente: cambios de precios de venta, ediciones de fichas técnicas, reaperturas de caja, aprobaciones de diferencias de arqueo y eliminaciones de empleados.
