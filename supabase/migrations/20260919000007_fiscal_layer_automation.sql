-- ARBO OS — MIGRATION 20260919000007: FISCAL LAYER ARGENTINA & OPERATIONAL AUTOMATION
-- Version: 1.6.0
-- Description: Creates fiscal tables (fiscal_invoices, fiscal_contingency_queue),
-- automation engine tables (automation_rules, automation_executions),
-- alters existing entities (organizations, branches, sales, customers),
-- sets up RLS policies, correlative constraints, indexes, and triggers.

-- 1. EXTENDER ENTIDADES BASE CON ATRIBUTOS FISCALES
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS tax_condition VARCHAR(50) NOT NULL DEFAULT 'RESPONSABLE_INSCRIPTO',
ADD COLUMN IF NOT EXISTS cuit VARCHAR(20) DEFAULT '30712345678',
ADD COLUMN IF NOT EXISTS legal_name VARCHAR(255);

ALTER TABLE public.branches
ADD COLUMN IF NOT EXISTS fiscal_pos_number INT NOT NULL DEFAULT 1;

ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS tax_condition VARCHAR(50) NOT NULL DEFAULT 'CONSUMIDOR_FINAL',
ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50);

-- 2. TABLA: fiscal_invoices (COMPROBANTES FISCALES EMITIDOS)
CREATE TABLE IF NOT EXISTS public.fiscal_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE RESTRICT,
    invoice_type VARCHAR(20) NOT NULL CHECK (
        invoice_type IN (
            'FACTURA_A', 'FACTURA_B', 'FACTURA_C',
            'NOTA_CREDITO_A', 'NOTA_CREDITO_B', 'NOTA_CREDITO_C',
            'COMPROBANTE_X'
        )
    ),
    pos_number INT NOT NULL CHECK (pos_number > 0),
    invoice_number BIGINT NOT NULL CHECK (invoice_number > 0),
    cae VARCHAR(30),
    cae_expires_at DATE,
    afip_qr_url TEXT,
    net_amount NUMERIC(12, 2) NOT NULL CHECK (net_amount >= 0),
    vat_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (vat_amount >= 0),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    customer_tax_id VARCHAR(50),
    customer_name VARCHAR(255),
    customer_tax_condition VARCHAR(50) DEFAULT 'CONSUMIDOR_FINAL',
    status VARCHAR(30) NOT NULL DEFAULT 'AUTHORIZED' CHECK (
        status IN ('AUTHORIZED', 'PENDING_CONTINGENCY', 'REJECTED', 'CANCELLED')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_fiscal_invoice_correlative UNIQUE (organization_id, pos_number, invoice_type, invoice_number),
    CONSTRAINT uq_fiscal_invoice_sale_type UNIQUE (sale_id, invoice_type)
);

-- Vincular ventas con comprobante fiscal
ALTER TABLE public.sales
ADD COLUMN IF NOT EXISTS fiscal_invoice_id UUID REFERENCES public.fiscal_invoices(id) ON DELETE SET NULL;

-- Índices de auditoría y consulta fiscal
CREATE INDEX IF NOT EXISTS idx_fiscal_invoices_org_branch ON public.fiscal_invoices(organization_id, branch_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_invoices_sale ON public.fiscal_invoices(sale_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_invoices_status ON public.fiscal_invoices(status);
CREATE INDEX IF NOT EXISTS idx_fiscal_invoices_cae ON public.fiscal_invoices(cae);

-- 3. TABLA: fiscal_contingency_queue (COLA DE CONTINGENCIA & RESILIENCIA FISCAL)
CREATE TABLE IF NOT EXISTS public.fiscal_contingency_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE RESTRICT,
    fiscal_invoice_id UUID NOT NULL REFERENCES public.fiscal_invoices(id) ON DELETE CASCADE,
    payload JSONB NOT NULL,
    retry_count INT NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
    max_retries INT NOT NULL DEFAULT 5 CHECK (max_retries >= 1),
    next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    last_error TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (
        status IN ('PENDING', 'PROCESSING', 'RESOLVED', 'FAILED_PERMANENT')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TRIGGER tr_fiscal_contingency_updated_at
    BEFORE UPDATE ON public.fiscal_contingency_queue
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_fiscal_contingency_status_next ON public.fiscal_contingency_queue(status, next_attempt_at);
CREATE INDEX IF NOT EXISTS idx_fiscal_contingency_invoice ON public.fiscal_contingency_queue(fiscal_invoice_id);

-- 4. TABLA: automation_rules (REGLAS DE AUTOMATIZACIÓN OPERATIVA)
CREATE TABLE IF NOT EXISTS public.automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (
        event_type IN (
            'sale.completed', 'order.created', 'payment.completed',
            'customer.created', 'fiscal.invoice_issued'
        )
    ),
    condition JSONB NOT NULL DEFAULT '{}'::jsonb,
    action_type VARCHAR(50) NOT NULL,
    action_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TRIGGER tr_automation_rules_updated_at
    BEFORE UPDATE ON public.automation_rules
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_automation_rules_org_event ON public.automation_rules(organization_id, event_type, is_enabled);

-- 5. TABLA: automation_executions (REGISTRO AUDITABLE CON IDEMPOTENCIA ANTI-SPAM)
CREATE TABLE IF NOT EXISTS public.automation_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    rule_id UUID NOT NULL REFERENCES public.automation_rules(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    idempotency_key VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS', 'FAILED', 'RETRYABLE')),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    result JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_automation_execution_idempotency UNIQUE (organization_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_automation_executions_rule ON public.automation_executions(rule_id, executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_automation_executions_idempotency ON public.automation_executions(organization_id, idempotency_key);

-- 6. SEGURIDAD A NIVEL DE FILA (ROW LEVEL SECURITY - RLS)
ALTER TABLE public.fiscal_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiscal_contingency_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_executions ENABLE ROW LEVEL SECURITY;

-- Policies: fiscal_invoices
CREATE POLICY "fiscal_invoices_tenant_select" ON public.fiscal_invoices
    FOR SELECT USING (
        organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    );

CREATE POLICY "fiscal_invoices_tenant_insert" ON public.fiscal_invoices
    FOR INSERT WITH CHECK (
        organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    );

CREATE POLICY "fiscal_invoices_tenant_update" ON public.fiscal_invoices
    FOR UPDATE USING (
        organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    );

-- Policies: fiscal_contingency_queue (estrictamente interno)
CREATE POLICY "contingency_queue_tenant_select" ON public.fiscal_contingency_queue
    FOR SELECT USING (
        organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    );

CREATE POLICY "contingency_queue_tenant_insert" ON public.fiscal_contingency_queue
    FOR INSERT WITH CHECK (
        organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    );

CREATE POLICY "contingency_queue_tenant_update" ON public.fiscal_contingency_queue
    FOR UPDATE USING (
        organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    );

-- Policies: automation_rules
CREATE POLICY "automation_rules_tenant_all" ON public.automation_rules
    FOR ALL USING (
        organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    );

-- Policies: automation_executions
CREATE POLICY "automation_executions_tenant_select" ON public.automation_executions
    FOR SELECT USING (
        organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    );

CREATE POLICY "automation_executions_tenant_insert" ON public.automation_executions
    FOR INSERT WITH CHECK (
        organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    );
