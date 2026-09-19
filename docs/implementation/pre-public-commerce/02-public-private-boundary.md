# ARBO OS — PRE-PUBLIC COMMERCE CHECKPOINT
## 02. FRONTERA PUBLIC WEB / PRIVATE ADMIN

---

## 1. DEFINICIÓN CONCEPTUAL DE LA FRONTERA

La arquitectura de ARBO OS distingue tajantemente dos mundos de ejecución y consumo de datos:

1. **PUBLIC WEB (Internet Abierto / Clientes Consumidores)**:
   - Navegadores sin autenticar o con autenticación ligera de cliente invitado.
   - Acceso de sólo lectura al catálogo comercial activo y habilitado para venta online.
   - Capacidad de emitir pedidos online (`public_orders`) y consultar el estado exclusivo de su propio pedido mediante tracking seguro.
2. **PRIVATE ADMIN (Backoffice / Punto de Venta / Cocina)**:
   - Usuarios autenticados con roles operativos (`ADMIN`, `OPERATOR`, `CHEF`, etc.).
   - Acceso a caja, aperturas, arqueos, cierres, inventario, recetas, costos, proveedores, métricas financieras y CRM.

---

## 2. AUDITORÍA DE DATOS RESTRINGIDOS

Un cliente público **BAJO NINGUNA CIRCUNSTANCIA** debe poder consultar o deducir los siguientes datos:

| Dominio | Entidad Afectada | Riesgo si se Expone |
| :--- | :--- | :--- |
| **Caja y Sesiones** | `cash_registers`, `cash_sessions`, `cash_movements` | Fuga de recaudación en efectivo, arqueos y turnos |
| **Costos y Márgenes** | `ingredients.current_cost_unit`, `PPP`, `Food Cost %` | Revelación del costo industrial y margen de beneficio |
| **Recetas Industriales** | `recipes`, `recipe_items` | Secreto comercial y formulaciones gastronómicas |
| **Inventario Físico** | `inventory_movements`, balances de insumos | Revelación de nivel de stock y patrones de compra |
| **Proveedores** | `suppliers`, facturas de compra | Relación comercial con proveedores mayoristas |
| **CRM y PII Global** | `customers`, `loyalty_transactions` globales | Violación masiva de privacidad de otros clientes |
| **Organización Interna**| `organization_users`, roles, logs de auditoría | Superficie de ataque para ingeniería social |

---

## 3. ESTADO ACTUAL DEL CÓDIGO Y RUTAS

- **Rutas Públicas Actuales** (`src/App.jsx`):
  - `/`, `/carta`, `/pedidos`, `/reservas`, `/eventos`, `/arbo-club`.
  - Actualmente, estas pantallas consumen archivos mock estáticos (`src/data/menu.js`).
  - No exponen credenciales de base de datos ni endpoints privados.
- **Rutas Administrativas**:
  - `/admin/*` encapsulado bajo `AdminApp` y `ProtectedRoute`, exigiendo sesión activa en Supabase Auth.
- **Requisito para Fase 6**:
  - Al conectar la web pública al backend real, **nunca** se debe realizar una consulta directa `supabase.from('products').select('*')` desde el cliente anónimo, ya que las políticas RLS actuales bloquean el acceso anónimo o podrían exponer campos internos si se abren sin proyecciones seguras.
  - Se requerirá un endpoint/RPC de catálogo público que proyecte únicamente los campos comerciales autorizados.
