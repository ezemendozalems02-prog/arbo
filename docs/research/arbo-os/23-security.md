# 23 — Seguridad, Exposición de Datos y Superficie de Ataque

**Archivos:** `vercel.json`, `dist/assets/index-*.js`, `src/mock/customers.js`, `src/context/*`  
**Estado general:** `BROKEN` / `CRITICAL` — no existe autenticación, autorización ni protección de datos personales; los datos comerciales y de clientes se encuentran expuestos públicamente en el bundle cliente.

---

## 23.1 Ausencia de Autenticación y Acceso Público a `/admin`

**FACT · NOT_IMPLEMENTED (P0)** — Como se demostró en `03-auth-permissions.md`:
1. No existe login, sesión, token JWT, cookie HTTP ni contraseña.
2. Al estar desplegado en producción (`https://arbo-alpha.vercel.app`), cualquier persona en internet que ingrese a `/admin` accede al sistema operativo completo.
3. Puede abrir o cerrar la caja registradora, alterar existencias de mercadería, cancelar comandas en cocina, ver facturación y borrar órdenes.

---

## 23.2 Exposición Masiva de Datos Personales (PII)

**FACT · CRITICAL (P0)** — El bundle de producción generado por Vite (`dist/assets/index-CUFzKwLD.js` de 761 kB):
- Contiene en texto plano los **126 registros completos de clientes** de `src/mock/customers.js`.
- Incluye: Nombres reales, direcciones de correo electrónico, números de teléfono móvil, fechas de nacimiento, volumen total gastado y visitas.
- **Riesgo:** Violación flagrante de leyes de protección de datos personales (Ley 25.326 en Argentina / GDPR internacional). Un atacante o competidor puede descargar la cartera completa de clientes con un simple `curl`.

---

## 23.3 Manipulación Local y Ausencia de Integridad

- Al residir el estado en `localStorage` del navegador:
  - Cualquier usuario puede abrir la consola de DevTools y mutar `arbo_pos_v1` o `arbo_crm_v1`.
  - Es trivial asignarse 999.999 puntos en ARBO Club, cambiar el precio de un plato a $1 o inventar arqueos de caja con diferencia cero.
  - Al no haber backend que valide las firmas o transacciones, no existe garantía de integridad de datos.

---

## 23.4 Ausencia de Cabeceras de Seguridad (`vercel.json`)

`vercel.json` se limita a:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

| Cabecera de Seguridad | Estado | Riesgo |
|---|---|---|
| `Content-Security-Policy` (CSP) | Ausente | Ataques XSS e inyección de scripts |
| `X-Frame-Options: DENY` | Ausente | Clickjacking (embeber el admin en un iframe malicioso) |
| `X-Content-Type-Options: nosniff` | Ausente | Ataques MIME sniffing |
| `Referrer-Policy` | Ausente | Fuga de rutas y tokens en headers |
| `Permissions-Policy` | Ausente | Acceso no restringido a APIs de hardware |
