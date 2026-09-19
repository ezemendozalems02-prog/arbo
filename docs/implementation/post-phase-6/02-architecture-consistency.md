# ARBO OS — POST-PHASE 6 CHECKPOINT
## 02. CONSISTENCIA ARQUITECTÓNICA & FUENTE ÚNICA DE VERDAD

---

## 1. AUDITORÍA DE AISLAMIENTO Y SISTEMAS PARALELOS

Uno de los riesgos más severos en la evolución de un sistema operativo gastronómico es la proliferación de subsistemas paralelos (e.g. una tabla de ventas para el salón y otra para delivery, o un libro mayor de inventario y un contador manual de stock).

Se auditó minuciosamente el código fuente y las migraciones de ARBO OS para certificar la existencia de una **ÚNICA FUENTE DE VERDAD** por dominio:

| Dominio | Entidad de Verdad Única | Verificación de Inexistencia de Paralelos | Estado |
| :--- | :--- | :--- | :---: |
| **Ventas** | `public.sales`, `sale_items` | Toda orden pública se canaliza vía `execute_sale_checkout`. No hay tabla `online_sales`. | **CERTIFICADO** |
| **Inventario** | `public.inventory_movements` | El stock físico se deriva puramente por agregación de deltas. No hay columna mutable de balance. | **CERTIFICADO** |
| **Caja** | `cash_registers`, `cash_sessions`, `cash_movements` | El cobro online takeaway impacta en la sesión de caja del local. No hay caja paralela. | **CERTIFICADO** |
| **Cocina (KDS)** | `public.kitchen_tickets` | Las comandas online ingresan con etiqueta `[ONLINE TAKEAWAY]`. No hay pantalla paralela. | **CERTIFICADO** |
| **Clientes** | `public.customers` | Organización-level con `UNIQUE(organization_id, phone)`. No hay tabla `guest_users`. | **CERTIFICADO** |
| **Fidelización** | `public.loyalty_transactions` | Libro mayor append-only con fórmula $\lfloor \text{total}/100 \rfloor$. No hay saldo mutable. | **CERTIFICADO** |
| **Buffer Web** | `public.public_orders` | Actúa únicamente como captador de intención hasta su confirmación transaccional. | **CERTIFICADO** |

---

## 2. CONCLUSIÓN ARQUITECTÓNICA

No existe fragmentación de estados ni duplicación de entidades operativas. El sistema mantiene coherencia integral e indivisible entre el mundo web público y el backoffice operativo.
