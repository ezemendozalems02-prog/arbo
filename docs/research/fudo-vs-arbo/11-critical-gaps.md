# 11 — Gaps Críticos de ARBO OS

Jerarquización de las brechas técnicas, operativas y de producto de ARBO OS identificadas a lo largo de la auditoría forense, clasificadas por su impacto real:

---

## P0 — Bloquea Operación Real (Impedimento Absoluto)

1. **Ausencia de Backend y Base de Datos Relacional (`NOT_IMPLEMENTED`):**
   El sistema es una SPA que reside 100% en el navegador del cliente persistiendo en `localStorage`. Es inviable para operar con más de un dispositivo en simultáneo (mozo, cocina, caja) y vulnerable a la pérdida total de datos por limpieza de caché.
2. **Descarte en Memoria de Pedidos Online (`BUG-001` · `BROKEN`):**
   `/pedidos` confirma transacciones con un ID aleatorio `#ARBO-XXXX` y vacía el carrito, pero descarta los productos y datos del cliente. Ningún pedido llega al restaurante.
3. **Descarte en Memoria de Reservas Online (`BUG-002` · `BROKEN`):**
   `/reservas` emite una pantalla de confirmación ficticia. No se envía notificación ni se asienta en el panel, generando incidentes graves en salón con clientes que llegan con reservas inexistentes.
4. **Exposición Pública de `/admin` y Fuga Masiva de PII (`BUG-SEG` · `CRITICAL`):**
   El panel administrativo está publicado en internet sin login ni contraseña. El bundle JavaScript descargable expone en texto plano los 126 registros completos de clientes con nombres, teléfonos, correos y gastos.
5. **Cero Facturación Fiscal AFIP / ARCA (`NOT_IMPLEMENTED`):**
   Sin integración con Web Services de AFIP, sin generación de CAE, sin comprobantes A/B/C ni controladores fiscales. Operar comercialmente en Argentina sin facturación electrónica acarrea riesgo directo de clausura y sanciones tributarias.

---

## P1 — Riesgo Operativo y Comercial Serio

6. **La Venta no descuenta Insumos del Stock (`GAP CRÍTICO`):**
   Vender productos en el salón o mostrador no descuenta insumos de las recetas. El stock solo varía por compras manuales y mermas. Las alertas de desabastecimiento nunca reaccionan a la demanda real.
7. **Retención de Productos Cancelados como Cobrables (`BUG-003` · `BROKEN`):**
   Cancelar un plato o bebida en cocina desde el KDS no decrementa `sentQty` en el POS. El producto queda bloqueado e impide eliminarlo, obligando al cajero a cobrarle al comensal un plato que no se le entregó.
8. **Comandas Huérfanas tras el Cobro (`BUG-004` · `BROKEN`):**
   Cobrar y liberar una mesa en caja elimina la orden pero deja las comandas activas en la pantalla de cocina con el cronómetro corriendo indefinidamente.
9. **POS Inusable en Smartphones y Tablets de Mozo (`BUG-007` · `BROKEN`):**
   La grilla fija colapsa a 0 px en móviles y a 84 px en iPad vertical (768 px), bloqueando el dispositivo estándar utilizado por camareros en salón.
10. **Destrucción del Historial de Turnos de Caja (`BUG-018` · `BROKEN`):**
    Abrir un nuevo turno ejecuta `movements: []`, borrando permanentemente todos los ingresos, egresos y ventas en efectivo del turno anterior.
11. **Desconexión entre CRM y POS (`BUG-006` · `BROKEN`):**
    Un cliente dado de alta en el mostrador o salón no puede ser buscado ni seleccionado al momento del cobro para acumular puntos ni asociar consumo.
12. **Canjes de Beneficios Inutilizables en Caja (`BUG-021` · `BROKEN`):**
    El POS no tiene campo ni mecanismo para validar o descontar cupones de ARBO Club (`ARBO-XXXXX`).
13. **Pérdida Silenciosa de Postulantes a Franquicias (`BUG-024` · `BROKEN`):**
    El formulario `/franquicia` simula el envío y descarta los datos de contacto y capital de los inversores en memoria.
14. **Inexistencia de Salida a Impresoras Térmicas (`NOT_IMPLEMENTED`):**
    Sin soporte para comandos ESC/POS hacia impresoras térmicas de comanda de 80 mm en cocina y precuentas de salón.
15. **Inexistencia de Operatoria Dinámica de Salón (`NOT_IMPLEMENTED`):**
    Imposibilidad de unir mesas, transferir ítems entre mesas o mover comensales de una mesa a otra.

---

## P2 — Limitación Importante

16. **División de Cuenta es Solo una Calculadora (`UI_ONLY`):** No soporta cobro parcial ni división por ítem consumido.
17. **Arqueo de Caja No Ciego (`BUG-019`):** Exhibe el saldo teórico en pantalla antes del recuento y admite cierres con descuadre sin justificación obligatoria.
18. **Recorte Silencioso de Mermas (`BUG-009`):** Recorta cantidades al stock actual y confunde unidades de medida no convertibles.
19. **Vulnerabilidad de Fraude en Devolución de Puntos (`BUG-010`):** Cancelar un canje ya consumido devuelve los puntos a la cuenta del cliente.
20. **Modificadores Desconectados del Stock:** Opciones como "Leche de almendras" o "Shot extra" alteran el precio pero no consumen insumos de inventario.
21. **Deduplicación de Clientes Inactiva (`BUG-020`):** Código de búsqueda por contacto implementado pero no conectado al modal de alta.
22. **Marketing y Automatizaciones Simuladas:** Envíos con `Math.random()` sin conexión a APIs reales de WhatsApp o Email.
23. **Inexistencia de Multi-sucursal y Depósitos Múltiples:** Modelo atado a un local físico único sin transferencias internas.
24. **Inexistencia de Cuentas Corrientes:** Sin fiado para comensales ni saldo deudor para proveedores.

---

## P3 — Mejora y Optimización

25. **Ausencia de Operación por Teclado en POS:** No ofrece atajos de teclado (`hotkeys`) para despacho de alta velocidad.
26. **Ausencia de Página 404 (`BUG-013`):** Rutas públicas rotas devuelven home con status 200.
27. **Falta de Validación en Formulario de Clientes (`BUG-016`):** Admite cualquier string en email y teléfono.
28. **Bundle Monolítico de 761 kB:** Cero code-splitting entre el portal público y el sistema administrativo.
29. **Cantidades Fraccionarias en Unidades de Conteo (`BUG-012`):** Permite compras de 11,2 panes o medialunas.
30. **Modales sin Focus Trap:** Accesibilidad incompleta para navegación por teclado.
