# ARBO OS — PRE-ARBO CLUB CHECKPOINT: CRM Y ANALÍTICAS DERIVADAS

---

## 1. PRINCIPIO DE NO DUPLICACIÓN DE DATOS

El módulo de CRM no debe crear tablas redundantes para almacenar ventas o consumo de clientes.
La totalidad de las analíticas de clientes debe derivarse directamente de las tablas existentes:
$$\text{customers} \xleftarrow{} \text{sales} \longrightarrow \text{sale_items}$$

---

## 2. DERIVACIÓN DE MÉTRICAS RFM (RECENCIA, FRECUENCIA, MONTO)

Con las tablas actuales consolidadas, las métricas comerciales de CRM se calculan mediante agregaciones SQL puras:

1. **Recencia (R):**
   ```sql
   SELECT customer_id, MAX(created_at) AS last_visit,
          EXTRACT(DAY FROM (now() - MAX(created_at))) AS days_since_last_visit
   FROM public.sales
   WHERE customer_id IS NOT NULL AND status = 'PAID'
   GROUP BY customer_id;
   ```
2. **Frecuencia (F):**
   ```sql
   SELECT customer_id, COUNT(id) AS total_visits
   FROM public.sales
   WHERE customer_id IS NOT NULL AND status = 'PAID'
   GROUP BY customer_id;
   ```
3. **Monto / Gasto Histórico (M):**
   ```sql
   SELECT customer_id, SUM(total) AS lifetime_value, AVG(total) AS average_ticket
   FROM public.sales
   WHERE customer_id IS NOT NULL AND status = 'PAID'
   GROUP BY customer_id;
   ```
4. **Productos Favoritos del Cliente:**
   ```sql
   SELECT s.customer_id, si.product_name_snapshot, SUM(si.quantity) AS units_bought
   FROM public.sales s
   JOIN public.sale_items si ON si.sale_id = s.id
   WHERE s.customer_id = :customerId AND s.status = 'PAID'
   GROUP BY s.customer_id, si.product_name_snapshot
   ORDER BY units_bought DESC
   LIMIT 5;
   ```

---

## 3. SEGMENTACIÓN DE CLIENTES

La segmentación (ej. *VIP*, *Frecuente*, *En Riesgo*, *Nuevo*, *Inactivo*) puede implementarse como una vista SQL calculada dinámicamente (`VIEW customer_rfm_segments`), evitando desincronizaciones de estado.
