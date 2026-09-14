-- ============================================
-- OrcaObra — Sprint 06: Schema + RLS
-- ============================================

-- 1. PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  profession TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. COMPANIES
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- 3. COMPANY MEMBERSHIPS
CREATE TABLE IF NOT EXISTS company_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, user_id)
);

ALTER TABLE company_memberships ENABLE ROW LEVEL SECURITY;

-- Membership: user can see their own memberships
CREATE POLICY "memberships_select_own" ON company_memberships
  FOR SELECT USING (auth.uid() = user_id);

-- Membership: only owners can insert new members (base policy)
CREATE POLICY "memberships_insert_owner" ON company_memberships
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_memberships cm
      WHERE cm.company_id = company_memberships.company_id
        AND cm.user_id = auth.uid()
        AND cm.role = 'owner'
    )
  );

-- Membership: users can join a company during signup (self-insert with role=owner)
CREATE POLICY "memberships_insert_self_owner" ON company_memberships
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND role = 'owner'
  );

-- 4. BUDGETS
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID,
  service_type TEXT NOT NULL DEFAULT '',
  service_category TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  project_name TEXT NOT NULL DEFAULT '',
  project_description TEXT NOT NULL DEFAULT '',
  site_address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  measurements JSONB NOT NULL DEFAULT '{}',
  quantities JSONB NOT NULL DEFAULT '{}',
  options JSONB NOT NULL DEFAULT '{}',
  calculated JSONB NOT NULL DEFAULT '{"floorArea":null,"perimeter":null,"wallArea":null,"volume":null,"linearMeters":null}',
  estimated_days NUMERIC,
  days_calculation_mode TEXT NOT NULL DEFAULT 'fixed',
  productivity_per_day NUMERIC,
  team_daily_cost NUMERIC,
  labor_cost NUMERIC,
  worker_cost NUMERIC,
  helper_cost NUMERIC,
  worker_daily_rate NUMERIC,
  helper_daily_rate NUMERIC,
  number_of_helpers NUMERIC,
  transport_cost NUMERIC NOT NULL DEFAULT 0,
  food_cost NUMERIC NOT NULL DEFAULT 0,
  fuel_cost NUMERIC NOT NULL DEFAULT 0,
  tool_cost NUMERIC NOT NULL DEFAULT 0,
  other_cost NUMERIC NOT NULL DEFAULT 0,
  expense_cost NUMERIC NOT NULL DEFAULT 0,
  risk_reserve_percent NUMERIC,
  risk_reserve NUMERIC NOT NULL DEFAULT 0,
  material_cost NUMERIC NOT NULL DEFAULT 0,
  material_selling_price NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  minimum_margin NUMERIC,
  recommended_margin NUMERIC,
  full_margin NUMERIC,
  minimum_price NUMERIC,
  recommended_price NUMERIC,
  full_price NUMERIC,
  effective_unit_price NUMERIC,
  pricing_version TEXT NOT NULL DEFAULT 'v1',
  selected_price_type TEXT,
  custom_price NUMERIC,
  discount NUMERIC NOT NULL DEFAULT 0,
  final_price NUMERIC,
  payment_method TEXT NOT NULL DEFAULT '',
  payment_terms JSONB NOT NULL DEFAULT '[]',
  included_services JSONB NOT NULL DEFAULT '[]',
  excluded_services JSONB NOT NULL DEFAULT '[]',
  agreed_days NUMERIC,
  validity_days NUMERIC NOT NULL DEFAULT 30,
  expires_at TIMESTAMPTZ,
  approval_status TEXT NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft',
  project_mode TEXT NOT NULL DEFAULT 'simple',
  stages JSONB NOT NULL DEFAULT '[]',
  materials JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "budgets_select_company" ON budgets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM company_memberships cm
      WHERE cm.company_id = budgets.company_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "budgets_insert_company" ON budgets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_memberships cm
      WHERE cm.company_id = budgets.company_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "budgets_update_company" ON budgets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM company_memberships cm
      WHERE cm.company_id = budgets.company_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "budgets_delete_company" ON budgets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM company_memberships cm
      WHERE cm.company_id = budgets.company_id
        AND cm.user_id = auth.uid()
    )
  );

-- 5. CLIENTS
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_select_company" ON clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM company_memberships cm
      WHERE cm.company_id = clients.company_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "clients_insert_company" ON clients
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_memberships cm
      WHERE cm.company_id = clients.company_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "clients_update_company" ON clients
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM company_memberships cm
      WHERE cm.company_id = clients.company_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "clients_delete_company" ON clients
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM company_memberships cm
      WHERE cm.company_id = clients.company_id
        AND cm.user_id = auth.uid()
    )
  );

-- 6. MATERIALS
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  supplier TEXT NOT NULL DEFAULT '',
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT NOT NULL DEFAULT ''
);

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "materials_select_company" ON materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM company_memberships cm
      WHERE cm.company_id = materials.company_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "materials_insert_company" ON materials
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_memberships cm
      WHERE cm.company_id = materials.company_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "materials_update_company" ON materials
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM company_memberships cm
      WHERE cm.company_id = materials.company_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "materials_delete_company" ON materials
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM company_memberships cm
      WHERE cm.company_id = materials.company_id
        AND cm.user_id = auth.uid()
    )
  );

-- 7. EXECUTIONS
CREATE TABLE IF NOT EXISTS executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress',
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  planned_end_date TIMESTAMPTZ,
  actual_end_date TIMESTAMPTZ,
  progress_percent NUMERIC NOT NULL DEFAULT 0,
  planned_labor_cost NUMERIC NOT NULL DEFAULT 0,
  planned_material_cost NUMERIC NOT NULL DEFAULT 0,
  planned_freight_cost NUMERIC NOT NULL DEFAULT 0,
  planned_other_expense NUMERIC NOT NULL DEFAULT 0,
  planned_risk_reserve NUMERIC NOT NULL DEFAULT 0,
  actual_labor_cost NUMERIC NOT NULL DEFAULT 0,
  actual_material_cost NUMERIC NOT NULL DEFAULT 0,
  actual_freight_cost NUMERIC NOT NULL DEFAULT 0,
  actual_other_expense NUMERIC NOT NULL DEFAULT 0,
  actual_total_cost NUMERIC NOT NULL DEFAULT 0,
  projected_final_cost NUMERIC NOT NULL DEFAULT 0,
  projected_result NUMERIC,
  projected_margin NUMERIC,
  stages JSONB NOT NULL DEFAULT '[]',
  payments JSONB NOT NULL DEFAULT '[]',
  expenses JSONB NOT NULL DEFAULT '[]',
  logs JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "executions_select_company" ON executions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM company_memberships cm
      WHERE cm.company_id = executions.company_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "executions_insert_company" ON executions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_memberships cm
      WHERE cm.company_id = executions.company_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "executions_update_company" ON executions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM company_memberships cm
      WHERE cm.company_id = executions.company_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "executions_delete_company" ON executions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM company_memberships cm
      WHERE cm.company_id = executions.company_id
        AND cm.user_id = auth.uid()
    )
  );

-- 8. SETTINGS (per-user, stored as jsonb)
CREATE TABLE IF NOT EXISTS settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_select_own" ON settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "settings_insert_own" ON settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "settings_update_own" ON settings
  FOR UPDATE USING (auth.uid() = user_id);
