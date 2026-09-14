import { supabase, isSupabaseConfigured } from './supabase';
import type { Budget, Client, Material, Execution, Settings, Company, User } from './types';

function toSnakeCase(s: string): string {
  return s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

function fromSnakeCase(s: string): string {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function mapKeys<T extends Record<string, unknown>>(obj: T, fn: (k: string) => string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    result[fn(k)] = v;
  }
  return result;
}

function toDb(row: Record<string, unknown>): Record<string, unknown> {
  return mapKeys(row, toSnakeCase);
}

function fromDb(row: Record<string, unknown>): Record<string, unknown> {
  return mapKeys(row, fromSnakeCase);
}

export const repositorySupabase = {
  isConfigured: isSupabaseConfigured(),

  async getUser(): Promise<User | null> {
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    const authUser = session?.user ?? null;
    if (!authUser) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (!profile) return null;

    const { data: membership } = await supabase
      .from('company_memberships')
      .select('company_id')
      .eq('user_id', authUser.id)
      .limit(1)
      .single();

    return {
      id: authUser.id,
      companyId: membership?.company_id ?? null,
      name: profile.name,
      profession: profile.profession,
      createdAt: profile.created_at,
    };
  },

  async getCompany(id: string): Promise<Company | null> {
    if (!supabase) return null;
    const { data } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();

    if (!data) return null;
    return { id: data.id, name: data.name, status: data.status, createdAt: data.created_at, updatedAt: data.updated_at };
  },

  async getBudgets(companyId: string): Promise<Budget[]> {
    if (!supabase) return [];
    const { data } = await supabase
      .from('budgets')
      .select('*')
      .eq('company_id', companyId);

    return (data ?? []).map((row) => fromDb(row) as unknown as Budget);
  },

  async addBudget(budget: Budget, companyId: string): Promise<Budget> {
    if (!supabase) throw new Error('Supabase not configured');
    const dbRow = toDb(budget as unknown as Record<string, unknown>);
    dbRow.company_id = companyId;
    dbRow.created_at = new Date().toISOString();
    dbRow.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('budgets')
      .insert(dbRow)
      .select()
      .single();

    if (error) throw error;
    return fromDb(data) as unknown as Budget;
  },

  async updateBudget(budget: Budget): Promise<void> {
    if (!supabase) return;
    const dbRow = toDb(budget as unknown as Record<string, unknown>);
    dbRow.updated_at = new Date().toISOString();

    await supabase
      .from('budgets')
      .update(dbRow)
      .eq('id', budget.id);
  },

  async deleteBudget(id: string): Promise<void> {
    if (!supabase) return;
    await supabase.from('budgets').delete().eq('id', id);
  },

  async getClients(companyId: string): Promise<Client[]> {
    if (!supabase) return [];
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('company_id', companyId);

    return (data ?? []).map((row) => fromDb(row) as unknown as Client);
  },

  async addClient(data: Omit<Client, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>, companyId: string): Promise<Client> {
    if (!supabase) throw new Error('Supabase not configured');
    const now = new Date().toISOString();
    const dbRow = { ...data, company_id: companyId, created_at: now, updated_at: now };

    const { data: result, error } = await supabase
      .from('clients')
      .insert(dbRow)
      .select()
      .single();

    if (error) throw error;
    return fromDb(result) as unknown as Client;
  },

  async updateClient(client: Client): Promise<void> {
    if (!supabase) return;
    const dbRow = toDb(client as unknown as Record<string, unknown>);
    dbRow.updated_at = new Date().toISOString();

    await supabase
      .from('clients')
      .update(dbRow)
      .eq('id', client.id);
  },

  async deleteClient(id: string): Promise<void> {
    if (!supabase) return;
    await supabase.from('clients').delete().eq('id', id);
  },

  async getMaterials(companyId: string): Promise<Material[]> {
    if (!supabase) return [];
    const { data } = await supabase
      .from('materials')
      .select('*')
      .eq('company_id', companyId);

    return (data ?? []).map((row) => fromDb(row) as unknown as Material);
  },

  async addMaterial(data: Omit<Material, 'id' | 'companyId' | 'lastUpdated'>, companyId: string): Promise<Material> {
    if (!supabase) throw new Error('Supabase not configured');
    const now = new Date().toISOString();
    const dbRow = { ...data, company_id: companyId, last_updated: now };

    const { data: result, error } = await supabase
      .from('materials')
      .insert(dbRow)
      .select()
      .single();

    if (error) throw error;
    return fromDb(result) as unknown as Material;
  },

  async updateMaterial(material: Material): Promise<void> {
    if (!supabase) return;
    const dbRow = toDb(material as unknown as Record<string, unknown>);
    dbRow.last_updated = new Date().toISOString();

    await supabase
      .from('materials')
      .update(dbRow)
      .eq('id', material.id);
  },

  async deleteMaterial(id: string): Promise<void> {
    if (!supabase) return;
    await supabase.from('materials').delete().eq('id', id);
  },

  async getExecutions(companyId: string): Promise<Execution[]> {
    if (!supabase) return [];
    const { data } = await supabase
      .from('executions')
      .select('*')
      .eq('company_id', companyId);

    return (data ?? []).map((row) => fromDb(row) as unknown as Execution);
  },

  async startExecution(budget: Budget, companyId: string): Promise<Execution> {
    if (!supabase) throw new Error('Supabase not configured');
    const now = new Date().toISOString();
    const execution = {
      company_id: companyId,
      project_id: budget.id,
      status: 'in_progress',
      start_date: now,
      planned_end_date: null,
      actual_end_date: null,
      progress_percent: 0,
      planned_labor_cost: budget.laborCost ?? 0,
      planned_material_cost: budget.materialCost ?? 0,
      planned_freight_cost: budget.transportCost ?? 0,
      planned_other_expense: (budget.foodCost ?? 0) + (budget.fuelCost ?? 0) + (budget.toolCost ?? 0) + (budget.otherCost ?? 0),
      planned_risk_reserve: budget.riskReserve ?? 0,
      actual_labor_cost: 0,
      actual_material_cost: 0,
      actual_freight_cost: 0,
      actual_other_expense: 0,
      actual_total_cost: 0,
      projected_final_cost: 0,
      projected_result: null,
      projected_margin: null,
      stages: budget.stages.map((s) => ({ id: s.id, name: s.name, status: 'pending', progress_percent: 0 })),
      payments: [],
      expenses: [],
      logs: [],
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from('executions')
      .insert(execution)
      .select()
      .single();

    if (error) throw error;
    return fromDb(data) as unknown as Execution;
  },

  async saveExecution(execution: Execution): Promise<void> {
    if (!supabase) return;
    const dbRow = toDb(execution as unknown as Record<string, unknown>);
    dbRow.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('executions')
      .upsert(dbRow, { onConflict: 'id' });

    if (error) throw error;
  },

  async deleteExecution(id: string): Promise<void> {
    if (!supabase) return;
    await supabase.from('executions').delete().eq('id', id);
  },

  async getSettings(): Promise<Settings> {
    if (!supabase) {
      return {
        workerDailyRate: 280, helperDailyRate: 150, defaultHelpers: 1,
        minimumMargin: 10, recommendedMargin: 20, fullMargin: 30,
        defaultWastePercent: 10, defaultRiskReservePercent: 5,
        currency: 'R$', region: '', city: '',
      };
    }

    const { data: { session } } = await supabase.auth.getSession();
    const authUser = session?.user ?? null;
    if (!authUser) {
      return {
        workerDailyRate: 280, helperDailyRate: 150, defaultHelpers: 1,
        minimumMargin: 10, recommendedMargin: 20, fullMargin: 30,
        defaultWastePercent: 10, defaultRiskReservePercent: 5,
        currency: 'R$', region: '', city: '',
      };
    }

    const { data } = await supabase
      .from('settings')
      .select('data')
      .eq('user_id', authUser.id)
      .single();

    const defaults: Settings = {
      workerDailyRate: 280, helperDailyRate: 150, defaultHelpers: 1,
      minimumMargin: 10, recommendedMargin: 20, fullMargin: 30,
      defaultWastePercent: 10, defaultRiskReservePercent: 5,
      currency: 'R$', region: '', city: '',
    };

    return { ...defaults, ...(data?.data ?? {}) };
  },

  async saveSettings(partial: Partial<Settings>): Promise<void> {
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    const authUser = session?.user ?? null;
    if (!authUser) return;

    const current = await this.getSettings();
    const merged = { ...current, ...partial };

    await supabase
      .from('settings')
      .upsert({ user_id: authUser.id, data: merged, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  },
};
