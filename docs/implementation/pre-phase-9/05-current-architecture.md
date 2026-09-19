# ARBO OS — PRE-PHASE 9 CHECKPOINT
## 05. ARQUITECTURA ACTUAL (POST-FASE 8)

### 1. Estado de Persistencia Real
A la fecha, el sistema cuenta con 8 migraciones formales en PostgreSQL:
1. `initial_tenancy_and_auth`: `organizations`, `branches`, `user_profiles`.
2. `catalog_recipes_inventory`: `categories`, `products`, `ingredients`, `recipes`, `recipe_items`, `inventory_movements`.
3. `sales_cash_acid`: `cash_sessions`, `sales`, `sale_items`, `payments`, `cash_movements`.
4. `kds_stations_tickets`: `kitchen_stations`, `kitchen_tickets`, `kitchen_ticket_items`.
5. `arbo_club_crm`: `customers`, `loyalty_accounts`, `loyalty_transactions`, `loyalty_rewards`, `loyalty_tiers`, `customer_events`.
6. `public_commerce`: `public_orders`, `public_order_items`.
7. `fiscal_layer_automation`: `fiscal_invoices`, `fiscal_contingency_queue`, `automation_rules`, `automation_executions`.
8. `multibranch_warehouses_transfers`: `warehouses`, `stock_transfers`, `stock_transfer_items`, `branch_product_settings`.

### 2. Clasificación de Datos
- **Ledgers Inmutables (Append-Only)**: `inventory_movements`, `cash_movements`, `loyalty_transactions`, `audit_logs`, `automation_executions`.
- **Entidades de Estado Transaccional**: `sales`, `cash_sessions`, `kitchen_tickets`, `public_orders`, `stock_transfers`, `fiscal_invoices`.
- **Configuración & Catálogo Maestro**: `organizations`, `branches`, `warehouses`, `products`, `recipes`, `ingredients`, `branch_product_settings`.
- **Modelos de Consulta (Read Models)**: Agregaciones en tiempo real sobre ledgers (stock físico actual por depósito, balance de caja, puntos acumulados).
