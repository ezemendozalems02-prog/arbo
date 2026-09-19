# ARBO OS — FASE 6: ENRUTAMIENTO MULTI-TENANT PÚBLICO
## RESOLUCIÓN SEGURA POR SLUG

---

## 1. PRINCIPIO DE SEGURIDAD EN EL ENRUTAMIENTO

En ARBO OS, un cliente consumidor accede a la tienda a través de URLs amigables como:
```
/store/:slug   o   /pedidos
```
Ejemplo: `/store/trevelin` o `/store/esquel`.

### Blindaje contra Tenant Escape:
- El cliente **NUNCA** envía un parámetro `organization_id` o `branch_id` manipulable desde el frontend.
- La función `resolveBranchBySlug(state, slug)` resuelve el slug contra la tabla `branches` de forma estricta:
  ```javascript
  const branch = branches.find(b => {
    const bSlug = (b.slug || b.code || '').toLowerCase().replace(/_/g, '-')
    return bSlug === cleanSlug && b.is_active !== false
  })
  ```
- Se valida que la sucursal pertenezca legítimamente a una organización activa, evitando que un atacante mezcle productos de un tenant con el ID de otro.

---

## 2. COMPATIBILIDAD CON RUTAS EXISTENTES

El enrutador de React (`src/App.jsx`) incorpora:
- `<Route path="/pedidos" element={<Pedidos />} />`: Mostrador web principal por defecto.
- `<Route path="/store/:slug" element={<Pedidos />} />`: Tienda contextualizada por sucursal.
- `<Route path="/order/:token" element={<OrderTracking />} />`: Seguimiento criptográfico de pedidos.
