# ARBO OS — FASE 9: OVERVIEW GENERAL
## Capa de Inteligencia Operacional, Analítica Avanzada & Compras Sugeridas

### 1. Resumen Ejecutivo
La Fase 9 de ARBO OS implementa la capa de inteligencia operacional y analítica avanzada que transforma los datos reales y transaccionales del restaurante (ventas, recetas, inventario, transferencias entre depósitos, clientes) en asistencia operativa determinística, explicable y reproducible para dueños, administradores y encargados de sucursal.

### 2. Principios Fundamentales
- **Sin datos ficticios:** Todas las métricas y recomendaciones se calculan a partir de tablas reales persistidas (`sales`, `sale_items`, `recipes`, `ingredients`, `inventory_movements`, `stock_transfers`, `warehouses`).
- **Sin modelos generativos externos:** Queda estrictamente excluido el uso de OpenAI, Gemini, Claude u otros LLMs para cálculos analíticos. La inteligencia de ARBO OS es determinística, auditable y matemática.
- **Explicabilidad total:** Cada sugerencia de compra o alerta de costo responde a la pregunta *"¿Por qué ARBO me muestra esto?"* con su fórmula, datos de entrada y desglose.
- **Aislamiento Multi-Tenant & Multi-Sucursal:** Respeto irrestricto de las políticas de Row Level Security (RLS) y segregación por organización, sucursal y depósito.
