# 03 — Autenticación, roles y permisos

## 3.1 Veredicto

**FACT · NOT_IMPLEMENTED** — ARBO OS no tiene autenticación de ningún tipo.
No hay login, ni logout, ni sesión, ni usuarios, ni roles, ni permisos, ni
rutas protegidas, ni guards de cliente, ni autorización de servidor.

## 3.2 Evidencia

Búsqueda exhaustiva en `src/` de los términos `login`, `logout`, `signin`,
`signup`, `auth`, `session`, `jwt`, `token`, `role`, `permission`, `isAdmin`,
`currentUser`, `protected`: **las únicas coincidencias son atributos ARIA**
(`role="dialog"`, `role="img"`) en cinco componentes. No hay una sola línea
de código relacionada con identidad.

Corroboración estructural:

- No existe ruta `/login` ni `/admin/login` (`App.jsx:54-65`, `nav.config.js`).
- `AdminApp.jsx:103-130` monta el panel sin ninguna comprobación previa.
- No hay providers de sesión. El árbol es
  `ToastProvider > POSProvider > InventoryProvider > CRMProvider > AdminLayout`.
- `nav.config.js` no tiene campo de rol ni de permiso en ninguna entrada. La
  única propiedad de control es `available: true|false`, que sólo decide si el
  módulo existe o muestra "Próximamente".

## 3.3 El "usuario" del sistema

**FACT** — el sistema tiene un único actor hardcodeado, en `src/mock/staff.js`:

```js
export const CURRENT_STAFF_NAME = 'Valentina (mozo)'
```

Es un string, no un objeto usuario: no tiene id, ni rol, ni permisos, ni
credenciales. Se estampa en todos los campos de responsabilidad del sistema:
`createdBy`, `startedBy`, `completedBy`, `cancelledBy` de las comandas, y el
campo `user` de movimientos de stock, mermas, compras, inventarios físicos,
transacciones de puntos y entradas de auditoría.

**INFERENCE** — los campos de trazabilidad existen y tienen la forma correcta
para recibir un usuario real, pero hoy **toda acción del sistema queda
atribuida a la misma persona**. La auditoría interna (`auditLog` de Inventario
y CRM) registra qué se hizo y cuándo, pero el "quién" es una constante. Como
control de trazabilidad, no tiene valor probatorio.

## 3.4 Control de acceso al panel — P0

**CONFIRMED por prueba en vivo.** Se navegó directamente a
`http://localhost:5199/admin` en una sesión limpia, sin credenciales de
ningún tipo. Resultado: el panel administrativo completo cargó de inmediato,
con título `Dashboard | ARBO OS`, mostrando facturación, ticket promedio,
cantidad de clientes, pedidos pendientes con nombres reales, reservas con
nombres y datos de contacto implícitos, costos de compras y food cost.

Evidencia: `evidence/02-admin-dashboard.png`.

Desde ahí, sin ninguna barrera adicional, se accede a los 29 módulos
implementados, incluyendo el POS (cobrar), la Caja (abrir, cerrar, registrar
egresos), el inventario (ajustar stock, registrar mermas) y el CRM (los 126
clientes con nombre, teléfono, email y fecha de nacimiento).

**Nota de alcance:** esto se verificó contra el servidor de desarrollo local.
No se auditó el despliegue de producción, porque no se dispone de su URL ni
se recibió autorización para probarlo. Sin embargo, `vercel.json` define un
rewrite catch-all a `index.html` sin ninguna regla de protección, y el panel
es código cliente dentro del mismo bundle que el sitio público
(`21-performance.md`, §bundle único). **Si el sitio está publicado, `/admin`
es público.** Verificarlo en producción queda marcado como
`REQUIERE INTERVENCIÓN DEL USUARIO` en `28-open-questions.md`.

## 3.5 Respuesta a las preguntas del brief

> No asumas que ocultar un botón equivale a seguridad. Probá si una acción
> realmente está protegida.

No hay botones ocultos que probar, porque **no hay nada oculto**: no existe
una capa de permisos que esconda acciones a unos usuarios y no a otros. Todas
las acciones están disponibles para todo el que abra la URL. La pregunta no
encuentra una discrepancia entre UI y servidor porque no hay servidor.

> Auditar: login, logout, sesiones, persistencia, expiración, recuperación,
> roles, permisos, rutas protegidas, acciones protegidas, server-side
> authorization, client-side guards, RLS, separación tenant/sucursal.

Todos los puntos: `NOT_IMPLEMENTED`. Ninguno es "no verificado" — se verificó
que no existen.

## 3.6 Lo que sí está preparado

En favor del diseño actual: los campos de autoría ya están modelados en las
entidades (`createdBy`, `startedBy`, `completedBy`, `cancelledBy`, `user`), y
el propio código lo documenta como una decisión consciente de fase
(`mock/staff.js:1-5`: "El día que haya login real, solo este archivo deja de
usarse"). El trabajo de retrofit de identidad está acotado, siempre que la
autorización se resuelva del lado del servidor que hoy no existe.
